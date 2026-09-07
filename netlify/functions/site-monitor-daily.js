import nodemailer from 'nodemailer';
import { checkAll } from './lib/site-checks.js';

async function sendAlertEmail(failed, results) {
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
  const failedLines = failed
    .map((r) => `- ${r.name}（${r.url}）：${r.error || `HTTP ${r.status}`}`)
    .join('\n');
  const allLines = results
    .map((r) => `- ${r.name}：${r.ok ? '正常' : '異常'}（${r.status ?? '無回應'}）`)
    .join('\n');

  await transporter.sendMail({
    from: user,
    to,
    subject: `[網站健康監控] ${failed.length} 個網站異常`,
    text: `每日巡檢時間：${checkedAt}\n\n異常網站：\n${failedLines}\n\n全部檢查結果：\n${allLines}`,
  });
}

export default async () => {
  const results = await checkAll();
  const failed = results.filter((r) => !r.ok);

  console.log(`[site-monitor-daily] 檢查 ${results.length} 個網站，${failed.length} 個異常。`);

  if (failed.length > 0) {
    await sendAlertEmail(failed, results);
  }
};

export const config = { schedule: '0 0 * * *' };
