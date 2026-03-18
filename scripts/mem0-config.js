// Mem0 配置文件
// 使用百炼/Qwen 模型（OpenAI 兼容接口）

import { Memory } from "mem0ai";

// 创建 Mem0 实例 - 使用阿里云百炼
export const createMem0Instance = () => {
  // 百炼基础 URL
  const baseURL = process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  
  // API Key（百炼/通义）
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;
  
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
