import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { tavily } from '@tavily/core';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

const DEFAULT_QUOTE_DIR = path.resolve(process.cwd(), '../DMS/docs/reports/quotes');

async function searchWeb(query) {
  console.log(`🔍 搜尋中：${query}`);
  const result = await tavilyClient.search(query, { maxResults: 5 });
  return result.results.map((r) => `${r.title}\n${r.content}`).join('\n\n');
}

const tools = [
  {
    name: 'search_web',
    description: '搜尋網路上的資訊',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜尋關鍵字' },
      },
      required: ['query'],
    },
  },
];

const SYSTEM_PROMPT = `你是一位台灣 B2B 專案顧問，專門協助中小企業做 Airtable 資料庫與 Interface 報價。
請依使用者主題先查詢參考資訊，再輸出一份可提案用的繁體中文報價草案。

輸出規格（務必包含）：
1) 專案假設與範圍（In scope / Out of scope）
2) 工項拆解表（至少含：需求釐清、Interface 規劃、List、Detail Editable、Add New、測試驗收、教育訓練、上線）
3) 工時估算（樂觀/一般/保守三種）
4) 金額估算（TWD，列出小計與總計，可給區間）
5) 里程碑與付款建議（例如 40/40/20）
6) 風險與報價備註（哪些條件變動會加價）
7) 下一步（客戶需要提供的資料清單）

請特別針對 Airtable Interface 場景說明：
- 單一操作角色、無 Dashboard
- 層級到 L2
- 每個 Table 含 List + Details(Editable) + Add New
- 欄位複雜度不同，尤其 Quotation 類表單通常最複雜

語氣要專業但易懂，可直接貼給客戶討論。`;

async function generateQuote(topic) {
  console.log(`\n🧮 開始生成報價草案：${topic}\n`);

  const messages = [
    {
      role: 'user',
      content: `請針對以下需求主題，先搜尋必要參考資訊，然後產生一份可直接拿來與客戶討論的報價草案。

主題：${topic}

請用台灣常見報價習慣（TWD）並把假設條件寫清楚。`,
    },
  ];

  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      return response.content[0].text;
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await searchWeb(block.input.query);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    }
  }
}

function getDateCode() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function getDefaultOutputPath() {
  const base = path.join(DEFAULT_QUOTE_DIR, `${getDateCode()}-quote.md`);
  if (!fs.existsSync(base)) return base;

  let idx = 1;
  while (true) {
    const candidate = path.join(
      DEFAULT_QUOTE_DIR,
      `${getDateCode()}-quote-${idx}.md`,
    );
    if (!fs.existsSync(candidate)) return candidate;
    idx += 1;
  }
}

function formatOutput(topic, quote) {
  const now = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `# 報價草案：${topic}

> 生成日期：${now}

---

${quote}
`;
}

// 命令列：node quote.js [主題] [-o 輸出檔]
// 未指定 -o 時，預設輸出到 ../DMS/docs/reports/quotes/YYMMDD-quote.md
const args = process.argv.slice(2);
const outputIdx = args.includes('-o')
  ? args.indexOf('-o')
  : args.includes('--output')
    ? args.indexOf('--output')
    : -1;
const outputFile =
  outputIdx >= 0 ? args[outputIdx + 1] : getDefaultOutputPath();
const topic =
  args
    .filter(
      (a, i) =>
        !['-o', '--output'].includes(a) &&
        (outputIdx < 0 || i !== outputIdx + 1),
    )
    .join(' ') ||
  'Airtable CRM Interface 開發：4 個 Table（List / Detail Editable / Add New）';

generateQuote(topic).then((quote) => {
  const output = formatOutput(topic, quote);

  console.log('\n📄 報價草案完成：\n');
  console.log(output);

  const dir = path.dirname(outputFile);
  if (dir) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`\n💾 已儲存至：${outputFile}`);
});
