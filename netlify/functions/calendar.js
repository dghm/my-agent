import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

/* ============================================================
   代打使用者的 Google Calendar（讀取 + 寫入本週排程）
   路由（config.path = /api/calendar/:action）：
     GET  /api/calendar/list?start=YYYY-MM-DD&end=YYYY-MM-DD
     POST /api/calendar/write   body: { weekStart, events: [{date,startTime,endTime,summary,slotKey}] }
   需先透過 /api/auth/login/google 登入並同意 calendar.events 權限，
   refresh token 存於 Netlify Blobs（store: members，由 auth.js 寫入）。
   write 動作會先刪除同一週、由本工具建立過的舊事件（用 extendedProperties
   標記 dghmScheduleWeek 辨識），再整批建立新的，避免重複點擊產生重複事件；
   所有寫入都帶 sendUpdates=none，不會發 Google Calendar 通知信給任何人。
   ============================================================ */

const SESSION_COOKIE = 'dghm_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-please-set-SESSION_SECRET';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

function hmac(data) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

function verifySession(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig || hmac(data) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookie(req, name) {
  const header = req.headers.get('cookie') || '';
  const match = header.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

async function getRefreshToken(uid) {
  const store = getStore('members');
  const users = (await store.get('users', { type: 'json' })) || [];
  const user = users.find((u) => u.id === uid);
  return user?.googleRefreshToken || null;
}

async function getAccessToken(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, detail: data.error_description || data.error || `HTTP ${res.status}` };
  return { ok: true, accessToken: data.access_token };
}

function parseSummary(summary) {
  const m = /^【([^】]+)】(.*)$/.exec(summary || '');
  return m ? { code: m[1], desc: m[2].trim() } : { code: '', desc: (summary || '').trim() };
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const action = context.params.action;

  try {
    const session = verifySession(getCookie(req, SESSION_COOKIE));
    if (!session) return json(401, { ok: false, error: '請先登入', code: 'unauthenticated' });

    if (req.method === 'GET' && action === 'list') {
      const url = new URL(req.url);
      const start = url.searchParams.get('start');
      const end = url.searchParams.get('end');
      if (!start || !end) return json(400, { ok: false, error: '請提供 start 與 end（YYYY-MM-DD）' });

      const refreshToken = await getRefreshToken(session.uid);
      if (!refreshToken) {
        return json(409, {
          ok: false,
          error: '尚未授權讀取 Google 日曆，請先登出再用 Google 重新登入一次以同意「讀取日曆」權限',
          code: 'no_calendar_grant',
        });
      }

      const tokenResult = await getAccessToken(refreshToken);
      if (!tokenResult.ok) {
        return json(502, {
          ok: false,
          error: `無法取得 Google 存取權杖，請重新登入後再試一次（詳細：${tokenResult.detail}）`,
        });
      }

      const params = new URLSearchParams({
        timeMin: new Date(`${start}T00:00:00+08:00`).toISOString(),
        timeMax: new Date(`${end}T23:59:59+08:00`).toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      });
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${tokenResult.accessToken}` } }
      );
      const calData = await calRes.json().catch(() => ({}));
      if (!calRes.ok) {
        const detail = calData.error?.message || `HTTP ${calRes.status}`;
        return json(502, { ok: false, error: `Google Calendar API 呼叫失敗（詳細：${detail}）` });
      }

      const events = (calData.items || [])
        .filter((ev) => ev.start && (ev.start.dateTime || ev.start.date))
        .map((ev) => {
          const { code, desc } = parseSummary(ev.summary);
          const startAt = ev.start.dateTime || ev.start.date;
          const endAt = ev.end?.dateTime || ev.end?.date || startAt;
          const hours =
            ev.start.dateTime && ev.end?.dateTime
              ? (new Date(ev.end.dateTime) - new Date(ev.start.dateTime)) / 3600000
              : null;
          return { summary: ev.summary || '', code, desc, start: startAt, end: endAt, hours };
        });

      return json(200, { ok: true, events });
    }

    if (req.method === 'POST' && action === 'write') {
      const body = await req.json().catch(() => ({}));
      const weekStart = String(body.weekStart || '').trim();
      const events = Array.isArray(body.events) ? body.events : [];
      if (!weekStart || !events.length) {
        return json(400, { ok: false, error: '請提供 weekStart 與 events' });
      }

      const refreshToken = await getRefreshToken(session.uid);
      if (!refreshToken) {
        return json(409, {
          ok: false,
          error: '尚未授權寫入 Google 日曆，請先登出再用 Google 重新登入一次以同意權限',
          code: 'no_calendar_grant',
        });
      }

      const tokenResult = await getAccessToken(refreshToken);
      if (!tokenResult.ok) {
        return json(502, {
          ok: false,
          error: `無法取得 Google 存取權杖，請重新登入後再試一次（詳細：${tokenResult.detail}）`,
        });
      }
      const accessToken = tokenResult.accessToken;

      // 1) 先找出同一週、之前用本工具寫過的舊事件並刪除，避免重複點擊或重新產生後累積重複事件
      const listParams = new URLSearchParams({
        privateExtendedProperty: `dghmScheduleWeek=${weekStart}`,
        maxResults: '250',
      });
      const listRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${listParams}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const listData = await listRes.json().catch(() => ({}));
      const oldEvents = listRes.ok ? (listData.items || []) : [];
      for (const ev of oldEvents) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${ev.id}?sendUpdates=none`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }

      // 2) 建立新事件，全部標記 sendUpdates=none（不發通知）＋週次標記（供下次覆寫用）
      let created = 0;
      const errors = [];
      for (const ev of events) {
        const eventBody = {
          summary: ev.summary || '',
          start: { dateTime: `${ev.date}T${ev.startTime}:00+08:00`, timeZone: 'Asia/Taipei' },
          end: { dateTime: `${ev.date}T${ev.endTime}:00+08:00`, timeZone: 'Asia/Taipei' },
          reminders: { useDefault: false },
          extendedProperties: {
            private: { dghmScheduleWeek: weekStart, dghmScheduleSlot: `${ev.date}-${ev.slotKey || ''}` },
          },
        };
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=none',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(eventBody),
          }
        );
        if (res.ok) {
          created++;
        } else {
          const errData = await res.json().catch(() => ({}));
          errors.push(errData.error?.message || `HTTP ${res.status}`);
        }
      }

      return json(200, { ok: true, created, deleted: oldEvents.length, errors });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/calendar/:action' };
