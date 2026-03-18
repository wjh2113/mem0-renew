// Mem0-Recruiter 配置文件
// 招聘专用记忆层配置

import { Memory } from "mem0ai";

// 从环境变量读取配置
const getUserAgent = () => {
  if (typeof navigator !== "undefined") {
    return navigator.userAgent;
  }
  return "mem0-recruiter/1.0.0";
};

// 创建 Mem0 实例
export const createMem0Instance = () => {
  const config = {
    embedder: {
      provider: "openai",
      config: {
        model: "text-embedding-3-small",
      },
    },
    llm: {
      provider: "openai",
      config: {
        model: "gpt-4o-mini",
      },
    },
    vectorStore: {
      provider: "memory", // 本地向量存储
    },
    historyDb: process.env.MEM0_HISTORY_DB || "~/.mem0/recruiter.db",
    userId: process.env.MEM0_USER_ID || "recruiter",
    // 招聘场景优化
    extractionPrompt: `提取招聘相关的用户偏好、决策模式、候选人匹配规律。
忽略敏感信息（薪资数字、个人隐私、公司机密）。
输出简洁、可操作的记忆条目。`,
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
