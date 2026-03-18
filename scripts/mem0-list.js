#!/usr/bin/env node
// Mem0 列表脚本
// 列出所有存储的记忆

import { Memory } from "mem0ai";

// 解析命令行参数
const args = process.argv.slice(2);
const userArg = args.find((a) => a.startsWith("--user="));
const userId = userArg ? userArg.split("=")[1] : process.env.MEM0_USER_ID || "default";

// 检查 API Key
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ 错误：需要设置 OPENAI_API_KEY 环境变量");
  console.log("   export OPENAI_API_KEY=your_key_here");
  process.exit(1);
}

async function list() {
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
      userId: userId,
    };

    const mem0 = new Memory(config);

    // 获取所有记忆
    const results = await mem0.getAll({ userId, limit: 100 });

    if (!results || results.length === 0) {
      console.log("📭 暂无记忆");
      console.log("");
      console.log("提示：使用 mem0-add.js 添加记忆");
    } else {
      console.log(`📋 共 ${results.length} 条记忆 (用户：${userId})：\n`);
      results.forEach((item, index) => {
        const memory = item.memory || item.text || JSON.stringify(item);
        const id = item.id || index + 1;
        const createdAt = item.created_at ? new Date(item.created_at).toLocaleString("zh-CN") : "未知";
        console.log(`${index + 1}. [ID: ${id}]`);
        console.log(`   ${memory}`);
        console.log(`   创建时间：${createdAt}\n`);
      });
    }

    // JSON 输出模式
    if (process.env.JSON_OUTPUT === "1") {
      console.log("---JSON---");
      console.log(JSON.stringify({ userId, count: results.length, results }, null, 2));
    }

    await mem0.close();
  } catch (error) {
    console.log(`❌ 获取失败：${error.message}`);
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ error: error.message }, null, 2));
    }
    process.exit(1);
  }
}

list();
