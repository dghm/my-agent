import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.SOCIAL_UI_API_PORT || 8780);
const TMP_DIR = path.join(__dirname, '.tmp-social-output');
const DATA_DIR = path.join(__dirname, 'data');
const INCOME_FILE = path.join(DATA_DIR, 'income.json');
const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readIncomeRecords() {
  if (!fs.existsSync(INCOME_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(INCOME_FILE, 'utf8').trim();
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

function writeIncomeRecords(records) {
  fs.writeFileSync(INCOME_FILE, JSON.stringify(records, null, 2), 'utf8');
}

function referenceDate(r) {
  return r.paidDate || r.dueDate || r.invoiceDate || (r.createdAt ? r.createdAt.slice(0, 10) : '');
}

function statusOf(r) {
  if (r.paidDate) return 'paid';
  if (r.invoiceDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (r.dueDate && r.dueDate < today) return 'overdue';
    return 'invoiced_unpaid';
  }
  return 'pending_invoice';
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function runSocialScript(topic) {
  return new Promise((resolve, reject) => {
    const safeTopic = topic.trim();
    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const outputFile = path.join(TMP_DIR, `social-${stamp}.md`);
    const socialScript = path.join(__dirname, 'social-post-agent.js');

    const proc = spawn(
      process.execPath,
      [socialScript, safeTopic, '-o', outputFile],
      { cwd: __dirname, env: process.env },
    );

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (buf) => {
      stdout += String(buf);
    });
    proc.stderr.on('data', (buf) => {
      stderr += String(buf);
    });
    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(stderr || `social-post-agent.js exited with code ${code}`),
        );
        return;
      }
      if (!fs.existsSync(outputFile)) {
        reject(new Error('social-post-agent.js 執行完成，但找不到輸出檔案'));
        return;
      }
      const output = fs.readFileSync(outputFile, 'utf8');
      resolve({ output, outputFile, stdout });
    });
  });
}

async function generateSectionVariants(input) {
  if (!anthropicClient) {
    throw new Error('未設定 ANTHROPIC_API_KEY，無法生成版型');
  }

  const variantCount = input.variantCount || 6;
  const sectionType = input.sectionType || 'Hero';

  const variantDirections = {
    Hero: [
      '左圖右文（圖片佔 50%，文字區在右）',
      '右圖左文（文字區在左，圖片在右）',
      '全幅背景圖＋置中文字覆蓋（深色遮罩）',
      '影片背景佔位＋半透明遮罩＋文字',
      '上方導覽列＋下方左右分欄（文字左、圖右）',
      '分割畫面（左半純色底＋大標題，右半圖片色塊）',
      '輪播指示點＋全幅圖片背景',
      '極簡純文字型（無圖，大標題置中，副標＋CTA）',
    ],
    服務介紹: [
      '三欄卡片（色塊 icon + 標題 + 說明文字）',
      '左圖右文交替列表型（圖左文右、圖右文左交替）',
      '單欄垂直列表＋左側色條裝飾',
      'Tab 切換型（上方 Tab 按鈕，下方內容區）',
      '數字序號型（大號數字＋標題＋說明）',
      '全寬橫幅型（每項服務佔一列，左右排列）',
    ],
    特色優勢: [
      '四欄 icon 卡片型（色塊 icon＋標題＋短說明）',
      '大數字統計型（超大數字＋單位＋說明，橫排）',
      '左側文字列表＋右側大圖色塊',
      '橫向 timeline（步驟點連線）',
      'Checklist 條列型（勾選圖示＋說明）',
      '不對稱兩欄（左大右小，或左小右大）',
    ],
    作品案例: [
      '三欄等比例卡片（圖片色塊＋標題＋標籤）',
      '左大右小兩欄（主打案例＋側欄小圖列表）',
      '全幅單張展示＋左側文字說明',
      '四欄小卡密集型',
      '上方 Filter 標籤列＋下方格線',
      '左右交替大圖型（一列圖左文右、一列圖右文左）',
    ],
    流程說明: [
      '橫向步驟條（數字圓點連線，1→2→3→4）',
      '縱向 timeline（左側線＋右側說明）',
      '卡片分欄型（每步驟一張卡片，橫排）',
      '大號數字型（步驟號碼超大，右側說明文字）',
      '圖文交替縱向型（奇數左圖右文，偶數左文右圖）',
      '圓形圖示步驟型（icon 圓圈＋箭頭連接）',
    ],
    客戶見證: [
      '三欄引言卡片（引號＋內文＋姓名）',
      '單則大型引言置中（超大引號裝飾）',
      '左側頭像色塊＋右側文字引言',
      '星評分列＋短評卡片網格',
      '深色全幅背景＋白色引言文字',
      'Logo 色塊牆＋下方引言文字',
    ],
    FAQ: [
      'Accordion 折疊式單欄（展開一則顯示內容）',
      '雙欄 Accordion（左右各一欄）',
      '上方 Tab 分類＋下方問答列表',
      '序號條列型（Q1. Q2. Q3. 直接顯示答案）',
      '左側問題列表＋右側答案內容區',
      '大字問題＋縮排答案（無折疊）',
    ],
    'CTA 區塊': [
      '置中大標題＋單一主要 CTA 按鈕',
      '左側標題說明＋右側按鈕（橫排）',
      '深色全幅色塊背景＋白色文字按鈕',
      '背景圖色塊＋遮罩＋置中文字按鈕',
      '雙按鈕型（主要 CTA＋次要連結並排）',
      '表單嵌入型（姓名欄＋Email 欄＋送出按鈕）',
      '倒數計時色塊＋CTA 按鈕',
      '對話式標語＋大按鈕（強調行動緊迫感）',
    ],
  };

  const directions =
    variantDirections[sectionType] ||
    Array.from({ length: variantCount }, (_, i) => `版型 ${i + 1}`);
  const selectedDirections = directions.slice(0, variantCount);

  // 字型方向對應 Google Fonts
  const fontMap = {
    'serif-editorial': "font-family: 'Noto Serif TC', serif;",
    'sans-minimal': "font-family: 'Noto Sans TC', sans-serif;",
    'bold-display':
      "font-family: 'Noto Sans TC', sans-serif; font-weight: 900;",
    'mixed-bilingual': "font-family: 'Noto Sans TC', sans-serif;",
    'monospace-tech': "font-family: 'JetBrains Mono', monospace;",
  };
  const fontStyle = fontMap[input.typographyStyle] || fontMap['sans-minimal'];

  const systemPrompt = `你是一位頂尖網頁設計師，專精 Lo-Fi 視覺稿（介於 Wireframe 和完稿之間）。
你的任務是為指定 Section 生成多種不同排版結構的 HTML 視覺稿，讓網頁設計師能快速判斷版型方向。

Lo-Fi 視覺稿規格（嚴格遵守）：
【色彩】
- 使用簡化色盤：1-2 個主色調（可參考輸入的主色系），其餘用淺灰 #f0f0f0、中灰 #d0d0d0、深灰 #888
- 圖片區域一律用色塊代替（不使用真實圖片或外部圖片網址）
- 背景色、文字色、按鈕色要有明確對比

【文字】
- 主標題：放入 10-15 字的真實感標題文案（符合專案類型，繁體中文）
- 副標題：放入 20-30 字的說明文案
- 內文段落：用 2-3 行短句，每行 25-35 字
- 按鈕：放入真實 CTA 文字（如「立即諮詢」「預約體驗」）
- 不要放 Lorem ipsum，要有真實感的中文佔位文字

【版面】
- section 寬度 100%，內容區最大寬度 1100px，左右自動置中
- 模擬桌機比例，min-height 依內容而定（不強制固定高度）
- 上下 padding 充裕（60px 以上）
- 版面結構要清楚：欄位數、比例、元素位置一目瞭然

【HTML 輸出格式】
- 輸出完整 HTML 文件（包含 <!DOCTYPE html>、<html>、<head>、<body>）
- CSS 全部內嵌在 <style> 標籤內
- 不引用任何外部圖片，色塊用 div 加 background-color 實現
- 圖片色塊內可加文字標示如「封面圖」「產品圖」「案例照片」
- 不引用外部 JS（不需要互動功能）
- 可引用 Google Fonts（僅限字型）`;

  const userPrompt = `專案資訊：
- 專案類型：${input.projectType}
- 品牌風格：${input.brandStyle}
- 目標受眾：${input.audience}
- 主要 CTA：${input.ctaGoal}
- 主色系：${input.colorPalette || '請自行根據品牌風格判斷'}
- 字型方向：${input.typographyStyle || 'sans-minimal'}（CSS 建議：${fontStyle}）
- 版面偏好：${input.layoutPreference || '未指定'}
- 文案語言：繁體中文

請為「${sectionType}」生成 ${variantCount} 種排版結構明顯不同的 Lo-Fi 視覺稿。

版型方向：
${selectedDirections.map((d, i) => `${i + 1}. ${d}`).join('\n')}

每種版型請嚴格按照以下格式輸出：

## 版型 N：[版型名稱]

\`\`\`html
（完整 HTML 文件）
\`\`\`

重要規則：
- 每個版型的版面結構必須有明顯差異（欄位數、排列方式、比例都不同）
- 每個 \`\`\`html 區塊必須是完整可獨立渲染的 HTML 文件
- 圖片位置一律用色塊，不使用 <img> 或外部網址
- 所有文案用繁體中文，符合「${input.projectType}」的語境`;

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.text?.trim() || '（未取得內容）';
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'tool-api-server' });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/social/generate') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const topic = String(parsed.topic || '').trim();
        if (!topic) {
          sendJson(res, 400, { ok: false, error: '請提供主題（topic）' });
          return;
        }
        const result = await runSocialScript(topic);
        sendJson(res, 200, {
          ok: true,
          topic,
          output: result.output,
          outputFile: result.outputFile,
          stdout: result.stdout,
        });
      } catch (err) {
        sendJson(res, 500, {
          ok: false,
          error: err instanceof Error ? err.message : '未知錯誤',
        });
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/sections/generate') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const input = {
          projectType: String(parsed.projectType || '').trim(),
          brandStyle: String(parsed.brandStyle || '').trim(),
          audience: String(parsed.audience || '').trim(),
          ctaGoal: String(parsed.ctaGoal || '').trim(),
          colorPalette: String(parsed.colorPalette || '').trim(),
          typographyStyle: String(parsed.typographyStyle || '').trim(),
          layoutPreference: String(parsed.layoutPreference || '').trim(),
          copyLanguage: String(parsed.copyLanguage || '').trim(),
          sectionType: String(parsed.sectionType || 'Hero').trim(),
          variantCount: Math.min(
            Math.max(parseInt(parsed.variantCount) || 6, 3),
            8,
          ),
        };

        if (
          !input.projectType ||
          !input.brandStyle ||
          !input.audience ||
          !input.ctaGoal
        ) {
          sendJson(res, 400, {
            ok: false,
            error: '請完整填寫專案類型、品牌風格、目標受眾與主要 CTA',
          });
          return;
        }

        const output = await generateSectionVariants(input);
        sendJson(res, 200, { ok: true, input, output });
      } catch (err) {
        sendJson(res, 500, {
          ok: false,
          error: err instanceof Error ? err.message : '未知錯誤',
        });
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/income/list') {
    try {
      const records = readIncomeRecords().map((r) => ({ ...r, status: statusOf(r) }));
      sendJson(res, 200, { ok: true, records });
    } catch (err) {
      sendJson(res, 500, {
        ok: false,
        error: err instanceof Error ? err.message : '未知錯誤',
      });
    }
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/income/summary')) {
    try {
      const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
      const year = reqUrl.searchParams.get('year');
      const month = reqUrl.searchParams.get('month');
      const records = readIncomeRecords()
        .map((r) => ({ ...r, status: statusOf(r) }))
        .filter((r) => {
          const ref = referenceDate(r);
          if (!ref) return false;
          const [y, m] = ref.split('-');
          if (year && y !== String(year)) return false;
          if (month && m !== String(month).padStart(2, '0')) return false;
          return true;
        });

      const total = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const paid = records
        .filter((r) => r.status === 'paid')
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const unpaid = total - paid;

      sendJson(res, 200, {
        ok: true,
        year: year || null,
        month: month || null,
        count: records.length,
        total,
        paid,
        unpaid,
        records,
      });
    } catch (err) {
      sendJson(res, 500, {
        ok: false,
        error: err instanceof Error ? err.message : '未知錯誤',
      });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/income/create') {
    readJsonBody(req)
      .then((parsed) => {
        const project = String(parsed.project || '').trim();
        const client = String(parsed.client || '').trim();
        const amount = Number(parsed.amount);

        if (!project || !client || !Number.isFinite(amount) || amount <= 0) {
          sendJson(res, 400, {
            ok: false,
            error: '請完整填寫案件名稱、客戶與有效金額',
          });
          return;
        }

        const record = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          project,
          client,
          amount,
          invoiceNo: String(parsed.invoiceNo || '').trim(),
          invoiceDate: String(parsed.invoiceDate || '').trim(),
          dueDate: String(parsed.dueDate || '').trim(),
          paidDate: String(parsed.paidDate || '').trim(),
          note: String(parsed.note || '').trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const records = readIncomeRecords();
        records.push(record);
        writeIncomeRecords(records);
        sendJson(res, 200, { ok: true, record: { ...record, status: statusOf(record) } });
      })
      .catch((err) => {
        sendJson(res, 400, { ok: false, error: '請求格式錯誤：' + err.message });
      });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/income/update') {
    readJsonBody(req)
      .then((parsed) => {
        const id = String(parsed.id || '').trim();
        if (!id) {
          sendJson(res, 400, { ok: false, error: '請提供 id' });
          return;
        }

        const records = readIncomeRecords();
        const index = records.findIndex((r) => r.id === id);
        if (index === -1) {
          sendJson(res, 404, { ok: false, error: '找不到對應的登記紀錄' });
          return;
        }

        const existing = records[index];
        const updated = {
          ...existing,
          project: parsed.project !== undefined ? String(parsed.project).trim() : existing.project,
          client: parsed.client !== undefined ? String(parsed.client).trim() : existing.client,
          amount: parsed.amount !== undefined ? Number(parsed.amount) : existing.amount,
          invoiceNo: parsed.invoiceNo !== undefined ? String(parsed.invoiceNo).trim() : existing.invoiceNo,
          invoiceDate: parsed.invoiceDate !== undefined ? String(parsed.invoiceDate).trim() : existing.invoiceDate,
          dueDate: parsed.dueDate !== undefined ? String(parsed.dueDate).trim() : existing.dueDate,
          paidDate: parsed.paidDate !== undefined ? String(parsed.paidDate).trim() : existing.paidDate,
          note: parsed.note !== undefined ? String(parsed.note).trim() : existing.note,
          updatedAt: new Date().toISOString(),
        };

        records[index] = updated;
        writeIncomeRecords(records);
        sendJson(res, 200, { ok: true, record: { ...updated, status: statusOf(updated) } });
      })
      .catch((err) => {
        sendJson(res, 400, { ok: false, error: '請求格式錯誤：' + err.message });
      });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/income/delete') {
    readJsonBody(req)
      .then((parsed) => {
        const id = String(parsed.id || '').trim();
        if (!id) {
          sendJson(res, 400, { ok: false, error: '請提供 id' });
          return;
        }

        const records = readIncomeRecords();
        const next = records.filter((r) => r.id !== id);
        if (next.length === records.length) {
          sendJson(res, 404, { ok: false, error: '找不到對應的登記紀錄' });
          return;
        }

        writeIncomeRecords(next);
        sendJson(res, 200, { ok: true });
      })
      .catch((err) => {
        sendJson(res, 400, { ok: false, error: '請求格式錯誤：' + err.message });
      });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`✅ tool-api-server running at http://localhost:${PORT}`);
  console.log('   POST /api/social/generate');
  console.log('   POST /api/sections/generate');
  console.log('   GET  /api/income/list');
  console.log('   GET  /api/income/summary');
  console.log('   POST /api/income/create');
  console.log('   POST /api/income/update');
  console.log('   POST /api/income/delete');
});
