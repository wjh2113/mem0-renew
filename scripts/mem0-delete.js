#!/usr/bin/env node
// Mem0 删除脚本
// 支持删除单条记忆或清空全部

import { Memory } from "mem0ai";

// 解析命令行参数
const args = process.argv.slice(2);
const allFlag = args.includes("--all");
const userArg = args.find((a) => a.startsWith("--user="));
const userId = userArg ? userArg.split("=")[1] : process.env.MEM0_USER_ID || "default";

// 获取记忆 ID（非参数部分）
const memoryId = args.find((a) => !a.startsWith("--"));

if (!memoryId && !allFlag) {
  console.log("用法：");
  console.log("  node mem0-delete.js <memory_id> [--user=recruiter]");
  console.log("  node mem0-delete.js --all [--user=recruiter]");
  console.log("");
  console.log("示例：");
  console.log("  node mem0-delete.js 12345");
  console.log("  node mem0-delete.js --all  # 删除所有记忆（危险操作）");
  process.exit(1);
}

// 检查 API Key
if (!process.env.OPENAI_API_KEY) {
  console.log("❌ 错误：需要设置 OPENAI_API_KEY 环境变量");
  console.log("   export OPENAI_API_KEY=your_key_here");
  process.exit(1);
}

async function deleteMem() {
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

    if (allFlag) {
      // 删除所有记忆
      console.log(`⚠️  警告：即将删除 "${userId}" 的所有记忆！`);
      console.log("此操作不可逆...");

      const results = await mem0.getAll({ userId, limit: 100 });
      if (results && results.length > 0) {
        console.log(`🗑️  正在删除 ${results.length} 条记忆...`);

        for (const item of results) {
          const id = item.id;
          if (id) {
            await mem0.delete(id, { userId });
          }
        }

        console.log(`✅ 已删除所有记忆`);
      } else {
        console.log("📭 暂无记忆可删除");
      }
    } else {
      // 删除单条记忆
      console.log(`🗑️  正在删除记忆 ID: ${memoryId}`);
      await mem0.delete(memoryId, { userId });
      console.log(`✅ 记忆已删除`);
    }

    // JSON 输出模式
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ success: true, deletedId: memoryId || "all" }, null, 2));
    }

    await mem0.close();
  } catch (error) {
    console.log(`❌ 删除失败：${error.message}`);
    if (process.env.JSON_OUTPUT === "1") {
      console.log("\n---JSON---");
      console.log(JSON.stringify({ error: error.message }, null, 2));
    }
    process.exit(1);
  }
}

deleteMem();
