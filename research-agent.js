import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { tavily } from '@tavily/core';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

// 真實搜尋工具
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

async function runAgent(topic) {
  console.log(`\n🤖 開始研究主題：${topic}\n`);

  const messages = [
    {
      role: 'user',
      content: `請幫我搜尋「${topic}」的相關資料，並整理成一份繁體中文報告。`,
    },
  ];

  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      const report = response.content[0].text;
      console.log('\n📄 報告完成：\n');
      console.log(report);
      return report;
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

// 命令列：node research-agent.js [主題] [-o 輸出檔]
const args = process.argv.slice(2);
const outputIdx = args.includes('-o')
  ? args.indexOf('-o')
  : args.includes('--output')
    ? args.indexOf('--output')
    : -1;
const outputFile = outputIdx >= 0 ? args[outputIdx + 1] : null;
const topic =
  args
    .filter(
      (a, i) =>
        !['-o', '--output'].includes(a) &&
        (outputIdx < 0 || i !== outputIdx + 1),
    )
    .join(' ') || '2025年台灣AI產業發展趨勢';

runAgent(topic).then((report) => {
  if (outputFile && report) {
    const dir = path.dirname(outputFile);
    if (dir) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputFile, report, 'utf8');
    console.log(`\n💾 已儲存至：${outputFile}`);
  }
});
