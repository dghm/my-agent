import crypto from 'node:crypto';

/* ============================================================
   Make.com 自動化監控與 Scenario 開關
   路由：GET /api/make-monitor/check、POST /api/make-monitor/check
   需要環境變數 MAKE_API_TOKEN，權限需包含 scenarios:read、
   scenarios:write 與 organizations:read。
   ============================================================ */

const DEFAULT_ZONE = 'us2.make.com';
const DEFAULT_TEAM_ID = '2215044';
const DEFAULT_ORG_ID = '7453677';
const SCENARIO_ID_PATTERN = /^\d+$/;

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function sessionFromRequest(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const match = (req.headers.get('cookie') || '').match(/(?:^|;\s*)dghm_session=([^;]*)/);
  if (!match) return null;
  let token;
  try { token = decodeURIComponent(match[1]); } catch { return null; }
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return session.exp > Date.now() && session.uid ? session : null;
  } catch { return null; }
}

function env(name, fallback = '') {
  return Netlify.env.get(name) || fallback;
}

function makeConfig() {
  return {
    token: env('MAKE_API_TOKEN'),
    zone: env('MAKE_ZONE', DEFAULT_ZONE),
    teamId: env('MAKE_TEAM_ID', DEFAULT_TEAM_ID),
    orgId: env('MAKE_ORG_ID', DEFAULT_ORG_ID),
  };
}

function makeError(data, response, label) {
  const payload = data && typeof data === 'object' ? data : {};
  const detail = payload.message || payload.detail || `HTTP ${response.status}`;
  if (response.status === 401 || response.status === 403) {
    return `${label}權限不足，請確認 MAKE_API_TOKEN 已啟用所需 Scope（${detail}）`;
  }
  return `${label}失敗：${detail}`;
}

async function fetchScenarios(config) {
  const response = await fetch(`https://${config.zone}/api/v2/scenarios?teamId=${config.teamId}`, {
    headers: { Authorization: `Token ${config.token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(makeError(data, response, '讀取 Make Scenario'));
  return Array.isArray(data) ? data : (data.scenarios || []);
}

function scenarioSummary(scenario) {
  return {
    id: String(scenario.id),
    name: String(scenario.name || '未命名 Scenario'),
    isActive: !!scenario.isActive,
    isinvalid: !!scenario.isinvalid,
    dlqCount: Number(scenario.dlqCount || 0),
  };
}

async function monitor(config) {
  const [scenarios, orgResponse] = await Promise.all([
    fetchScenarios(config),
    fetch(`https://${config.zone}/api/v2/organizations/${config.orgId}`, {
      headers: { Authorization: `Token ${config.token}` },
    }),
  ]);
  const orgData = await orgResponse.json().catch(() => ({}));
  if (!orgResponse.ok) throw new Error(makeError(orgData, orgResponse, '讀取 Make 組織用量'));

  const scenarioList = scenarios.map(scenarioSummary);
  const problems = scenarioList
    .filter((scenario) => scenario.isinvalid || scenario.dlqCount > 0)
    .map(({ name, dlqCount, isinvalid }) => ({ name, dlqCount, isinvalid }));
  const org = orgData.organization || orgData;
  const operationsLimit = org.license ? org.license.operations : null;
  const operationsUsed = Number(org.operations || 0);

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    total: scenarioList.length,
    activeCount: scenarioList.filter((scenario) => scenario.isActive).length,
    scenarios: scenarioList,
    problems,
    usage: {
      operationsUsed,
      operationsLimit,
      percentUsed: operationsLimit ? Math.round((operationsUsed / operationsLimit) * 1000) / 10 : null,
      lastReset: org.lastReset || null,
      nextReset: org.nextReset || null,
    },
  };
}

export default async (req) => {
  const session = sessionFromRequest(req);
  if (!session) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const config = makeConfig();
  if (!config.token) return json(503, { ok: false, error: '尚未設定 MAKE_API_TOKEN' });

  try {
    if (req.method === 'GET') return json(200, await monitor(config));

    if (req.method === 'POST') {
      let input;
      try { input = await req.json(); } catch { return json(400, { ok: false, error: 'Scenario 操作資料格式錯誤' }); }
      const scenarioId = String(input?.scenarioId || '').trim();
      if (!SCENARIO_ID_PATTERN.test(scenarioId) || typeof input?.active !== 'boolean') {
        return json(400, { ok: false, error: 'Scenario 操作資料格式錯誤' });
      }

      const scenarios = await fetchScenarios(config);
      const scenario = scenarios.find((item) => String(item.id) === scenarioId);
      if (!scenario) return json(404, { ok: false, error: '找不到此 Team 的 Scenario' });
      if (!!scenario.isActive === input.active) {
        return json(200, { ok: true, scenario: scenarioSummary(scenario) });
      }

      const action = input.active ? 'start' : 'stop';
      const response = await fetch(`https://${config.zone}/api/v2/scenarios/${scenarioId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Token ${config.token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return json(502, { ok: false, error: makeError(data, response, input.active ? '啟用 Scenario' : '停用 Scenario') });
      }
      const updated = data.scenario || data;
      return json(200, {
        ok: true,
        scenario: scenarioSummary({ ...scenario, ...updated, isActive: input.active }),
      });
    }

    return json(405, { ok: false, error: '不支援此請求方式' });
  } catch (error) {
    return json(502, { ok: false, error: error instanceof Error ? error.message : '無法連線至 Make API' });
  }
};

export const config = { path: '/api/make-monitor/check' };
