/* ============================================================
   Make.com 自動化場景健康檢查（唯讀）
   路由：GET /api/make-monitor/check
   需要環境變數 MAKE_API_TOKEN（Make 後台 Profile → API 產生的 Token，
   權限勾 scenarios:read 即可）。MAKE_ZONE／MAKE_TEAM_ID 視帳號而定，
   可用環境變數覆寫，預設為目前唯一在用的團隊。
   ============================================================ */

const DEFAULT_ZONE = 'us2.make.com';
const DEFAULT_TEAM_ID = '2215044';

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

  if (!token) {
    return json(200, {
      ok: false,
      error: '尚未設定 MAKE_API_TOKEN，請到 Make 後台 Profile → API 產生 Token 並加進 Netlify 環境變數',
    });
  }

  try {
    const res = await fetch(`https://${zone}/api/v2/scenarios?teamId=${teamId}`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = data.message || data.detail || `HTTP ${res.status}`;
      return json(200, { ok: false, error: `Make API 呼叫失敗：${detail}` });
    }

    const scenarios = Array.isArray(data) ? data : (data.scenarios || []);
    const active = scenarios.filter((s) => s.isActive);
    const problems = scenarios
      .filter((s) => s.isinvalid || (s.dlqCount || 0) > 0)
      .map((s) => ({ name: s.name, dlqCount: s.dlqCount || 0, isinvalid: !!s.isinvalid }));

    return json(200, {
      ok: true,
      checkedAt: new Date().toISOString(),
      total: scenarios.length,
      activeCount: active.length,
      problems,
    });
  } catch (error) {
    return json(200, { ok: false, error: error instanceof Error ? error.message : '無法連線至 Make API' });
  }
};

export const config = { path: '/api/make-monitor/check' };
