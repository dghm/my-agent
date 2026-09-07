import { getStore } from '@netlify/blobs';
import { STATUS_STORE_NAME, STATUS_STORE_KEY } from './lib/site-checks.js';

export default async () => {
  const store = getStore({ name: STATUS_STORE_NAME, consistency: 'strong' });
  const lastDailyCheck = await store.get(STATUS_STORE_KEY, { type: 'json', consistency: 'strong' });

  return new Response(JSON.stringify({ ok: true, lastDailyCheck: lastDailyCheck || null }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};

export const config = { path: '/api/site-monitor/status' };
