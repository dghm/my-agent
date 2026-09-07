import tls from 'node:tls';

export const TARGETS = [
  { name: '合信旺旺', url: 'https://hs128.com.tw/' },
  { name: 'TailorMed JP', url: 'https://jp.tailormed-intl.com/' },
  { name: 'TailorMed Tracking', url: 'https://tracking.tailormed-intl.com/' },
  { name: 'FP Enterprise', url: 'https://www.fp-enterprise.com.tw/' },
];

const TIMEOUT_MS = 8000;
export const SSL_WARN_DAYS = 21;

function checkSslExpiry(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, timeout: TIMEOUT_MS },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || !cert.valid_to) {
          resolve({ ok: false, error: '無法取得憑證資訊', validTo: null, daysLeft: null });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const daysLeft = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        resolve({ ok: true, error: null, validTo: validTo.toISOString(), daysLeft });
      }
    );
    socket.on('error', (error) => {
      resolve({ ok: false, error: error.message || 'TLS 連線失敗', validTo: null, daysLeft: null });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, error: '逾時', validTo: null, daysLeft: null });
    });
  });
}

async function checkOne(target) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const hostname = new URL(target.url).hostname;
  const sslPromise = checkSslExpiry(hostname);

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
      ssl: await sslPromise,
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
      ssl: await sslPromise,
    };
  }
}

export async function checkAll() {
  return Promise.all(TARGETS.map(checkOne));
}
