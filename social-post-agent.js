import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { tavily } from '@tavily/core';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
const DEFAULT_SOCIAL_POST_DIR = path.resolve(
  process.cwd(),
  '../DMS/docs/BrandRize/socialPost',
);

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

const SYSTEM_PROMPT = `你是一位專業的 Facebook 文案撰稿人，專門為台灣中小企業撰寫繁體中文貼文。
你的目標受眾是台灣中小企業的老闆或主管，他們每天忙於營運，沒有時間看長篇大論。

撰寫規則：
1. 開頭（前 2 行）：用一句話點出他們日常的痛點或困境，讓人看到第一行就想繼續讀。可以用提問、反問或描述場景的方式。
2. 正文：用親切、口語化的語氣說明問題的影響，並帶出解決方向。避免艱澀術語，善用 emoji 讓版面清爽易讀。重點 3～4 項，每項不超過 2 行。
3. 結尾 CTA：以「歡迎私訊我們了解更多」作為結尾，語氣要自然不生硬，可視情況加上一句溫暖的邀請語。

風格要求：
- 像朋友說話，不像業務推銷
- 有共鳴感，讓老闆看到會說「對！就是這樣！」
- 整篇約 150～220 字，簡潔有力`;

async function generateSocialPosts(topic) {
  console.log(`\n✍️  開始為「${topic}」生成 Facebook 貼文\n`);

  const messages = [
    {
      role: 'user',
      content: `請先搜尋「${topic}」的相關資料，了解台灣中小企業在這個主題上常見的困境與需求，收集足夠素材後，撰寫一篇 Facebook 貼文。

主題：${topic}

注意：開頭要能讓滑手機的老闆或主管停下來看，內容要點出他們在資料管理上的實際痛點，結尾以「歡迎私訊我們了解更多」作為行動呼籲。`,
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

function formatOutput(topic, post) {
  const now = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `# Facebook 貼文：${topic}

> 生成日期：${now}

---

${post}
`;
}

function getDateCode() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function getDefaultOutputPath() {
  const base = path.join(DEFAULT_SOCIAL_POST_DIR, `${getDateCode()}.md`);
  if (!fs.existsSync(base)) return base;

  let idx = 1;
  while (true) {
    const candidate = path.join(
      DEFAULT_SOCIAL_POST_DIR,
      `${getDateCode()}-${idx}.md`,
    );
    if (!fs.existsSync(candidate)) return candidate;
    idx += 1;
  }
}

// 命令列：node social-post-agent.js [主題] [-o 輸出檔]
// 未指定 -o 時，預設輸出到 ../DMS/docs/BrandRize/socialPost/YYMMDD.md
const args = process.argv.slice(2);
const outputIdx = args.includes('-o')
  ? args.indexOf('-o')
  : args.includes('--output')
    ? args.indexOf('--output')
    : -1;
const outputFile = outputIdx >= 0 ? args[outputIdx + 1] : getDefaultOutputPath();
const topic =
  args
    .filter(
      (a, i) =>
        !['-o', '--output'].includes(a) &&
        (outputIdx < 0 || i !== outputIdx + 1),
    )
    .join(' ') || 'AI 工具如何提升工作效率';

generateSocialPosts(topic).then((post) => {
  const output = formatOutput(topic, post);

  console.log('\n📱 Facebook 貼文完成：\n');
  console.log(output);

  const dir = path.dirname(outputFile);
  if (dir) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`\n💾 已儲存至：${outputFile}`);
});
