---
name: mem0-recruiter
description: >-
  招聘专用智能记忆层，基于 Mem0 优化。用于存储候选人偏好、面试模式、招聘决策习惯等动态信息。
  使用场景：(1) 记录俊哥的招聘偏好 (2) 学习候选人匹配模式 (3) 语义搜索历史招聘决策 (4) 避免重复推荐同类候选人。
  配合 MEMORY.md 使用：MEMORY.md 存结构化数据，mem0-recruiter 存动态学习到的模式。
---

# Mem0-Recruiter 招聘记忆层

专为招聘大姐头 Agent 优化的智能记忆层，自动学习招聘偏好、候选人匹配模式、面试决策习惯。

## 核心工作流

### 1. 响应前搜索记忆

```bash
node scripts/mem0-search.js "俊哥招聘偏好" --limit=3
```

搜索内容：
- 俊哥的用人标准
- 历史录用决策模式
- 候选人匹配偏好
- 面试流程习惯

### 2. 存储招聘上下文

**显式存储**（俊哥明确要求）：
```bash
node scripts/mem0-add.js "俊哥偏好有招聘经验的候选人"
```

**对话学习**（自动提取招聘模式）：
```bash
node scripts/mem0-add.js --messages='[{"role":"user","content":"这个候选人不行，经验不够"},{"role":"assistant","content":"收到，后续优先推荐 3 年以上经验的"}]'
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

## 招聘场景存储指南

### ✅ 应该存储：
- **俊哥的偏好**：「偏好有大厂背景的候选人」、「喜欢直接沟通的 HR」
- **决策模式**：「技术岗更看重项目经验而非学历」、「销售岗必须有同行业资源」
- **候选人匹配规律**：「某类简历通过率高」、「某类面试表现容易翻车」
- **流程优化**：「某岗位面试周期太长需要简化」、「某渠道简历质量高」
- **反馈学习**：「上次推荐的候选人被拒原因」、「录用候选人的共同特质」

### ❌ 不要存储：
- 候选人隐私信息（身份证号、手机号、家庭住址）
- 薪资细节（具体数字、银行信息）
- 公司机密（未公开的岗位计划、内部架构调整）
- MEMORY.md 已有的结构化数据（避免重复）

## 与 MEMORY.md 配合

| 类型 | MEMORY.md | mem0-recruiter |
|------|-----------|----------------|
| 候选人基本信息 | ✅ 姓名、联系方式 | ❌ |
| 面试记录 | ✅ 时间、面试官、结果 | ❌ |
| 俊哥偏好模式 | ❌ | ✅「偏好 985 学历」、「看重沟通能力」 |
| 决策规律 | ❌ | ✅「技术岗三面通过率 60%」 |
| 招聘渠道效果 | ❌ | ✅「BOSS 直聘响应快」、「猎聘质量高」 |

## 配置

位于 `scripts/mem0-config.js`：

```javascript
{
  embedder: "openai/text-embedding-3-small",
  llm: "openai/gpt-4o-mini",
  vectorStore: "memory",
  historyDb: "~/.mem0/recruiter.db",
  userId: process.env.MEM0_USER_ID || "recruiter"  // 可配置
}
```

使用 OpenClaw 的 `OPENAI_API_KEY` 环境变量。

## 性能优势

- **+26% 准确率** 相比原始上下文检索
- **91% 更快** 的响应速度
- **90% 更少 token** 消耗
- **<50ms** 语义搜索

## 程序化调用

所有脚本支持 `JSON_OUTPUT` 环境变量：

```bash
JSON_OUTPUT=1 node scripts/mem0-search.js "招聘偏好"
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
| `OPENAI_API_KEY` | ✅ | OpenAI API 密钥 |
| `MEM0_USER_ID` | ❌ | 用户 ID（默认：recruiter） |
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
