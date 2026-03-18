---
name: mem0-recruiter
description: >-
  智能记忆层，基于 Mem0 优化。提供语义搜索和自动存储用户偏好、模式、上下文 across conversations。
  使用场景：(1) 用户明确说"记住这个" (2) 对话中学习用户偏好和模式 (3) 搜索历史上下文 (4) 构建自适应响应。
  配合 MEMORY.md 使用：MEMORY.md 存结构化事实，mem0-recruiter 存动态学习到的偏好和模式。
---

# Mem0-Recruiter 智能记忆层

通用智能记忆层，自动学习用户偏好、行为模式、对话上下文。

## 核心工作流

### 1. 响应前搜索记忆

```bash
node scripts/mem0-search.js "用户偏好" --limit=3
```

搜索内容：
- 用户偏好和习惯
- 历史对话模式
- 个性化上下文
- 沟通风格

### 2. 存储对话上下文

**显式存储**（用户明确要求）：
```bash
node scripts/mem0-add.js "用户喜欢简洁的回复"
```

**对话学习**（自动提取模式）：
```bash
node scripts/mem0-add.js --messages='[{"role":"user","content":"我喜欢简短的回答"},{"role":"assistant","content":"好的！"}]'
```

## 可用命令

### 搜索记忆
```bash
node scripts/mem0-search.js "query" [--limit=3]
```

### 添加记忆
```bash
# 简单文本
node scripts/mem0-add.js "记忆内容"

# 对话消息（自动提取）
node scripts/mem0-add.js --messages='[{...}]'
```

### 列出所有记忆
```bash
node scripts/mem0-list.js
```

### 删除记忆
```bash
# 删除特定记忆
node scripts/mem0-delete.js <memory_id>

# 删除全部
node scripts/mem0-delete.js --all
```

## 存储指南

### ✅ 应该存储：
- **用户偏好**：沟通风格、格式选择、回复长度偏好
- **个人上下文**：工作信息、兴趣、家庭（非敏感）
- **使用模式**：频繁请求、时间偏好
- **纠正反馈**：用户纠正你的错误时
- **动态事实**：当前项目、近期兴趣

### ❌ 不要存储：
- 密码、API Key 等敏感信息
- 临时上下文（除非明确要求）
- 系统错误或调试信息
- MEMORY.md 已有的结构化数据（避免重复）

## 与 MEMORY.md 配合

| 类型 | MEMORY.md | mem0-recruiter |
|------|-----------|----------------|
| 永久事实 | ✅ 姓名、位置、邮箱 | ❌ |
| 参考数据 | ✅ 博客 URL、社交媒体 | ❌ |
| 结构化知识 | ✅ 项目详情、凭证 | ❌ |
| 用户偏好 | ❌ | ✅「喜欢简洁回复」、「偏好早晨沟通」 |
| 行为模式 | ❌ | ✅「通常 8 点询问天气」、「对技术话题感兴趣」 |
| 动态上下文 | ❌ | ✅「当前在学习 Python」、「最近关注 AI 新闻」 |

## 配置

位于 `scripts/mem0-config.js`：

```javascript
{
  embedder: "dashscope/text-embedding-v3",  // 百炼嵌入模型
  llm: "dashscope/qwen-plus",               // 百炼/Qwen 模型
  vectorStore: "memory",
  historyDb: "~/.mem0/history.db",
  userId: process.env.MEM0_USER_ID || "default"
}
```

使用阿里云百炼 API Key（`DASHSCOPE_API_KEY`），无需 OpenAI。

## 性能优势

- **+26% 准确率** 相比原始上下文检索
- **91% 更快** 的响应速度
- **90% 更少 token** 消耗
- **<50ms** 语义搜索

## 程序化调用

所有脚本支持 `JSON_OUTPUT` 环境变量：

```bash
JSON_OUTPUT=1 node scripts/mem0-search.js "用户偏好"
```

输出 JSON 格式（查找 `---JSON---` 标记后的内容）。

## 文件结构

```
mem0-recruiter/
├── SKILL.md                 # 本文档
├── package.json             # 依赖声明
├── package-lock.json        # 依赖锁定
├── install.sh               # 安装脚本（自动安装依赖）
├── .env.example             # 环境变量示例
├── scripts/
│   ├── mem0-config.js       # 配置
│   ├── mem0-search.js       # 搜索
│   ├── mem0-add.js          # 添加
│   ├── mem0-list.js         # 列表
│   └── mem0-delete.js       # 删除
└── references/
    └── integration-patterns.md  # 集成模式
```

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DASHSCOPE_API_KEY` | ✅ | 阿里云百炼 API 密钥 |
| `MEM0_USER_ID` | ❌ | 用户 ID（默认：default） |
| `EMBEDDING_MODEL` | ❌ | 嵌入模型（默认：text-embedding-v3） |
| `LLM_MODEL` | ❌ | LLM 模型（默认：qwen-plus） |
| `JSON_OUTPUT` | ❌ | 启用 JSON 输出模式 |

## 安装

```bash
# 自动安装（推荐）
./install.sh

# 或手动安装
npm install
```

## 资源

- `references/integration-patterns.md` - 详细集成模式和最佳实践
