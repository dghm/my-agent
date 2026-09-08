import { checkAll } from './lib/site-checks.js';

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
  const results = await checkAll();
  return json(200, {
    ok: true,
    checkedAt: new Date().toISOString(),
    results,
  });
};

export const config = { path: '/api/site-monitor/check' };
