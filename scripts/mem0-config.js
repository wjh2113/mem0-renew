// Mem0 配置文件
// 复用 OpenClaw 的百炼 API Key

import { Memory } from "mem0ai";

// 创建 Mem0 实例 - 使用阿里云百炼
export const createMem0Instance = () => {
  // 百炼基础 URL（与 OpenClaw 相同）
  const baseURL = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  
  // API Key - 复用 OpenClaw 的 BAILIAN_API_KEY
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.BAILIAN_API_KEY;
  
  if (!apiKey) {
    throw new Error("缺少 API Key：请设置 DASHSCOPE_API_KEY 或 BAILIAN_API_KEY 环境变量");
  }
  
  const config = {
    embedder: {
      provider: "openai",  // mem0ai 使用 OpenAI 兼容接口
      config: {
        model: process.env.EMBEDDING_MODEL || "text-embedding-v3",  // 百炼嵌入模型
        apiKey: apiKey,
        baseURL: baseURL,
      },
    },
    llm: {
      provider: "openai",  // 使用 OpenAI 兼容接口调用百炼
      config: {
        model: process.env.LLM_MODEL || "qwen-plus",  // 百炼/Qwen 模型
        apiKey: apiKey,
        baseURL: baseURL,
      },
    },
    vectorStore: {
      provider: "memory", // 本地向量存储
    },
    historyDb: process.env.MEM0_HISTORY_DB || "~/.mem0/history.db",
    userId: process.env.MEM0_USER_ID || "default",
  };

  return new Memory(config);
};

// 单例模式
let mem0Instance = null;

export const getMem0 = () => {
  if (!mem0Instance) {
    mem0Instance = createMem0Instance();
  }
  return mem0Instance;
};

// 工具函数：展开 home 目录路径
export const expandHome = (filepath) => {
  if (filepath.startsWith("~")) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return filepath.replace("~", home);
  }
  return filepath;
};

export default {
  createMem0Instance,
  getMem0,
  expandHome,
};
