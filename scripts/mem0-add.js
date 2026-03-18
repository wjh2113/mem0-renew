#!/usr/bin/env node
// Mem0-Recruiter 添加记忆脚本
// 支持文本和对话消息两种模式

import { Memory } from "mem0ai";

// 解析命令行参数
const args = process.argv.slice(2);

// 检查是否是对话模式
const messagesArg = args.find((a) => a.startsWith("--messages="));
const userArg = args.find((a) => a.startsWith("--user="));
const userId = userArg ? userArg.split("=")[1] : process.env.MEM0_USER_ID || "recruiter";

// 获取查询文本（非参数部分）
const queryText = args.find((a) => !a.startsWith("--"));

if (!queryText && !messagesArg) {
  console.log("用法：");
  console.log('  node mem0-add.js "记忆内容" [--user=recruiter]');
  console.log('  node mem0-add.js --messages=\'[{"role":"user","content":"..."}]\' [--user=recruiter]');
  console.log("");
  console.log("示例：");
  console.log('  node mem0-add.js "俊哥偏好有大厂背景的候选人"');
  console.log('  node mem0-add.js --messages=\'[{"role":"user","content":"这个候选人经验不够"}]\'');
  process.exit(1);
}

// 检查 API Key
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ 错误：需要设置 OPENAI_API_KEY 环境变量");
  console.log("   export OPENAI_API_KEY=your_key_here");
  process.exit(1);
}

async function add() {
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

    let result;

    if (messagesArg) {
      // 对话模式：自动提取记忆
      const messagesJson = messagesArg.split("=")[1];
      const messages = JSON.parse(messagesJson);

      console.log(`📝 从对话中提取记忆...`);
      result = await mem0.add(messages, { userId });
      console.log(`✅ 已提取并存储 ${result.length || 1} 条记忆`);
    } else {
      // 文本模式：直接存储
      console.log(`📝 添加记忆：${queryText}`);
      result = await mem0.add(queryText, { userId });
      console.log(`✅ 记忆已存储`);
    }

    // JSON 输出模式
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ success: true, result }, null, 2));
    }

    await mem0.close();
  } catch (error) {
    console.log(`❌ 添加失败：${error.message}`);
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ error: error.message }, null, 2));
    }
    process.exit(1);
  }
}

add();
