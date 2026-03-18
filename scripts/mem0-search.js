#!/usr/bin/env node
// Mem0 搜索脚本
// 语义搜索记忆

import { Memory } from "mem0ai";

// 解析命令行参数
const args = process.argv.slice(2);
const query = args.find((a) => !a.startsWith("--"));
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1]) : 3;

if (!query) {
  console.log("用法：node mem0-search.js \"搜索内容\" [--limit=3]");
  console.log("");
  console.log("示例：");
  console.log('  node mem0-search.js "用户偏好"');
  console.log('  node mem0-search.js "沟通风格" --limit=5');
  process.exit(1);
}

// 检查 API Key
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ 错误：需要设置 OPENAI_API_KEY 环境变量");
  console.log("   export OPENAI_API_KEY=your_key_here");
  process.exit(1);
}

async function search() {
  try {
    // 初始化 Mem0
    const config = {
      embedder: {
        provider: "openai",
        config: { model: "text-embedding-3-small" },
      },
      llm: {
        provider: "openai",
        config: { model: "gpt-4o-mini" },
      },
      vectorStore: { provider: "memory" },
      userId: process.env.MEM0_USER_ID || "recruiter",
    };

    const mem0 = new Memory(config);

    // 搜索记忆
    const results = await mem0.search(query, { limit, userId: process.env.MEM0_USER_ID || "default" });

    if (!results || results.length === 0) {
      console.log(`📭 未找到与 "${query}" 相关的记忆`);
      console.log("");
      console.log("提示：使用 mem0-add.js 添加记忆");
    } else {
      console.log(`🔍 找到 ${results.length} 条相关记忆：\n`);
      results.forEach((item, index) => {
        const memory = item.memory || item.text || JSON.stringify(item);
        const score = item.score ? `(${(item.score * 100).toFixed(1)}%)` : "";
        console.log(`${index + 1}. ${memory} ${score}`);
      });
    }

    // JSON 输出模式
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ query, results, count: results.length }, null, 2));
    }

    await mem0.close();
  } catch (error) {
    console.log(`❌ 搜索失败：${error.message}`);
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ error: error.message }, null, 2));
    }
    process.exit(1);
  }
}

search();
