/* ============================================================
   Make.com 自動化監控（唯讀）：場景異常 + Credit 用量
   路由：GET /api/make-monitor/check
   需要環境變數 MAKE_API_TOKEN（Make 後台 Profile → API 產生的 Token，
   權限需勾 scenarios:read 與 organizations:read）。
   MAKE_ZONE／MAKE_TEAM_ID／MAKE_ORG_ID 視帳號而定，可用環境變數覆寫，
   預設為目前唯一在用的組織／團隊。
   ============================================================ */

const DEFAULT_ZONE = 'us2.make.com';
const DEFAULT_TEAM_ID = '2215044';
const DEFAULT_ORG_ID = '7453677';

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export default async () => {
  const token = Netlify.env.get('MAKE_API_TOKEN');
  const zone = Netlify.env.get('MAKE_ZONE') || DEFAULT_ZONE;
  const teamId = Netlify.env.get('MAKE_TEAM_ID') || DEFAULT_TEAM_ID;
  const orgId = Netlify.env.get('MAKE_ORG_ID') || DEFAULT_ORG_ID;

  if (!token) {
    return json(200, {
      ok: false,
      error: '尚未設定 MAKE_API_TOKEN，請到 Make 後台 Profile → API 產生 Token 並加進 Netlify 環境變數',
    });
  }

  const authHeaders = { Authorization: `Token ${token}` };

  try {
    const [scenariosRes, orgRes] = await Promise.all([
      fetch(`https://${zone}/api/v2/scenarios?teamId=${teamId}`, { headers: authHeaders }),
      fetch(`https://${zone}/api/v2/organizations/${orgId}`, { headers: authHeaders }),
    ]);

    const scenariosData = await scenariosRes.json().catch(() => ({}));
    if (!scenariosRes.ok) {
      const detail = scenariosData.message || scenariosData.detail || `HTTP ${scenariosRes.status}`;
      return json(200, { ok: false, error: `Make API 呼叫失敗（場景清單）：${detail}` });
    }

    const orgData = await orgRes.json().catch(() => ({}));
    if (!orgRes.ok) {
      const detail = orgData.message || orgData.detail || `HTTP ${orgRes.status}`;
      return json(200, { ok: false, error: `Make API 呼叫失敗（組織用量，需要 Token 加 organizations:read 權限）：${detail}` });
    }

    const scenarios = Array.isArray(scenariosData) ? scenariosData : (scenariosData.scenarios || []);
    const active = scenarios.filter((s) => s.isActive);
    const problems = scenarios
      .filter((s) => s.isinvalid || (s.dlqCount || 0) > 0)
      .map((s) => ({ name: s.name, dlqCount: s.dlqCount || 0, isinvalid: !!s.isinvalid }));

    const org = orgData.organization || orgData;
    const operationsLimit = org.license ? org.license.operations : null;
    const operationsUsed = Number(org.operations || 0);
    const percentUsed = operationsLimit ? Math.round((operationsUsed / operationsLimit) * 1000) / 10 : null;

    return json(200, {
      ok: true,
      checkedAt: new Date().toISOString(),
      total: scenarios.length,
      activeCount: active.length,
      problems,
      usage: {
        operationsUsed,
        operationsLimit,
        percentUsed,
        lastReset: org.lastReset || null,
        nextReset: org.nextReset || null,
      },
    });
  } catch (error) {
    return json(200, { ok: false, error: error instanceof Error ? error.message : '無法連線至 Make API' });
  }
};

export const config = { path: '/api/make-monitor/check' };
