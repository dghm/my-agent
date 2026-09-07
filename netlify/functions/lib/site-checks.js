export const TARGETS = [
  { name: '合信旺旺', url: 'https://hs128.com.tw/' },
  { name: 'TailorMed JP', url: 'https://jp.tailormed-intl.com/' },
  { name: 'TailorMed Tracking', url: 'https://tracking.tailormed-intl.com/' },
  { name: 'FP Enterprise', url: 'https://www.fp-enterprise.com.tw/' },
];

const TIMEOUT_MS = 8000;

async function checkOne(target) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(target.url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'DGHM-Site-Monitor/1.0' },
    });
    clearTimeout(timer);
    return {
      name: target.name,
      url: target.url,
      ok: res.status < 400,
      status: res.status,
      statusText: res.statusText || '',
      responseTimeMs: Date.now() - started,
      error: null,
    };
  } catch (error) {
    clearTimeout(timer);
    const aborted = error && error.name === 'AbortError';
    return {
      name: target.name,
      url: target.url,
      ok: false,
      status: null,
      statusText: null,
      responseTimeMs: Date.now() - started,
      error: aborted
        ? `逾時（超過 ${TIMEOUT_MS / 1000} 秒無回應）`
        : (error instanceof Error ? error.message : '無法連線'),
    };
  }
}

export async function checkAll() {
  return Promise.all(TARGETS.map(checkOne));
}
