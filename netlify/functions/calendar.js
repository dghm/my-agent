import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

/* ============================================================
   讀取使用者 Google Calendar 事件（唯讀）
   路由（config.path = /api/calendar/:action）：
     GET /api/calendar/list?start=YYYY-MM-DD&end=YYYY-MM-DD
   需先透過 /api/auth/login/google 登入並同意「讀取日曆」權限，
   refresh token 存於 Netlify Blobs（store: members，由 auth.js 寫入）。
   本函式只代為呼叫 Google Calendar API 讀取事件，不寫入任何日曆內容。
   ============================================================ */

const SESSION_COOKIE = 'dghm_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-please-set-SESSION_SECRET';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
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

      const accessToken = await getAccessToken(refreshToken);
      if (!accessToken) {
        return json(502, { ok: false, error: '無法取得 Google 存取權杖，請重新登入後再試一次' });
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
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!calRes.ok) return json(502, { ok: false, error: 'Google Calendar API 呼叫失敗' });
      const calData = await calRes.json();

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

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/calendar/:action' };
