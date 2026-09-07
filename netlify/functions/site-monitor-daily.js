import nodemailer from 'nodemailer';
import { getStore } from '@netlify/blobs';
import { checkAll, SSL_WARN_DAYS, STATUS_STORE_NAME, STATUS_STORE_KEY } from './lib/site-checks.js';

async function sendAlertEmail({ failed, expiringSoon, results }) {
  const user = Netlify.env.get('SITE_MONITOR_SMTP_USER');
  const pass = Netlify.env.get('SITE_MONITOR_SMTP_APP_PASSWORD');
  const to = Netlify.env.get('SITE_MONITOR_ALERT_TO') || 'help@dghm.tw';

  if (!user || !pass) {
    console.log('[site-monitor-daily] 未設定 SITE_MONITOR_SMTP_USER / SITE_MONITOR_SMTP_APP_PASSWORD，略過寄信通知。');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const checkedAt = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });

  const sections = [`每日巡檢時間：${checkedAt}`];

  if (failed.length > 0) {
    const failedLines = failed
      .map((r) => `- ${r.name}（${r.url}）：${r.error || `HTTP ${r.status}`}`)
      .join('\n');
    sections.push(`異常網站：\n${failedLines}`);
  }

  if (expiringSoon.length > 0) {
    const sslLines = expiringSoon
      .map((r) => `- ${r.name}（${r.url}）：剩 ${r.ssl.daysLeft} 天到期（${r.ssl.validTo}）`)
      .join('\n');
    sections.push(`SSL 憑證即將到期：\n${sslLines}`);
  }

  const allLines = results
    .map((r) => `- ${r.name}：${r.ok ? '正常' : '異常'}（${r.status ?? '無回應'}）· SSL 剩 ${r.ssl.daysLeft ?? '未知'} 天`)
    .join('\n');
  sections.push(`全部檢查結果：\n${allLines}`);

  const subjectParts = [];
  if (failed.length > 0) subjectParts.push(`${failed.length} 個網站異常`);
  if (expiringSoon.length > 0) subjectParts.push(`${expiringSoon.length} 張 SSL 即將到期`);

  await transporter.sendMail({
    from: user,
    to,
    subject: `[網站健康監控] ${subjectParts.join('、')}`,
    text: sections.join('\n\n'),
  });
}

export default async () => {
  const results = await checkAll();
  const failed = results.filter((r) => !r.ok);
  const expiringSoon = results.filter((r) => r.ssl.ok && r.ssl.daysLeft <= SSL_WARN_DAYS);
  const checkedAt = new Date().toISOString();

  console.log(
    `[site-monitor-daily] 檢查 ${results.length} 個網站，${failed.length} 個異常，${expiringSoon.length} 張憑證即將到期。`
  );

  const store = getStore({ name: STATUS_STORE_NAME, consistency: 'strong' });
  await store.setJSON(STATUS_STORE_KEY, {
    checkedAt,
    results,
    failedCount: failed.length,
    expiringSoonCount: expiringSoon.length,
  });

  if (failed.length > 0 || expiringSoon.length > 0) {
    await sendAlertEmail({ failed, expiringSoon, results });
  }
};

export const config = { schedule: '0 0 * * *' };
