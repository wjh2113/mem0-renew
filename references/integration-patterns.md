# Mem0 集成模式

通用对话记忆场景下的最佳实践和集成模式。

## 工作流模式

### 模式 1：响应前搜索

在回答用户问题前，先搜索相关记忆：

```javascript
// 伪代码示例
async function respondToUser(question) {
  // 1. 搜索相关记忆
  const memories = await searchMemories(question);
  
  // 2. 结合记忆生成回答
  const context = memories.map(m => m.memory).join("\n");
  const answer = await generateAnswer(question, context);
  
  return answer;
}
```

**适用场景：**
- 用户询问偏好相关问题
- 提供个性化建议前
- 需要上下文感知的回复

---

### 模式 2：对话后学习

在对话结束后，自动提取并存储记忆：

```javascript
// 伪代码示例
async function learnFromConversation(messages) {
  // 过滤出有价值的对话
  const valuableMessages = messages.filter(m => 
    m.includes("偏好") || 
    m.includes("喜欢") || 
    m.includes("不要") ||
    m.includes("记住")
  );
  
  if (valuableMessages.length > 0) {
    await addMemories(valuableMessages);
  }
}
```

**适用场景：**
- 用户明确表达偏好后
- 用户说"记住这个"
- 对话中透露出重要信息

---

### 模式 3：记忆去重

避免存储重复或冲突的记忆：

```javascript
// 伪代码示例
async function addMemoryWithDedup(newMemory) {
  // 1. 搜索相似记忆
  const similar = await searchMemories(newMemory, { limit: 3 });
  
  // 2. 检查是否已存在
  const exists = similar.some(m => 
    similarity(m.memory, newMemory) > 0.9
  );
  
  if (!exists) {
    await storeMemory(newMemory);
  }
}
```

---

## 使用示例

### 示例 1：存储用户偏好

```bash
# 用户说：「我喜欢简洁的回答」
node scripts/mem0-add.js "用户喜欢简洁的回答"
```

### 示例 2：存储上下文信息

```bash
# 用户说：「我最近在学习 Python」
node scripts/mem0-add.js "用户最近在学习 Python"
```

### 示例 3：存储对话模式

```bash
# 对话记录
node scripts/mem0-add.js --messages='[
  {"role":"user","content":"我通常早上 8 点查看新闻"},
  {"role":"assistant","content":"好的，我会记住这个习惯"}
]'
```

### 示例 4：搜索历史上下文

```bash
# 回复前搜索用户偏好
node scripts/mem0-search.js "用户偏好" --limit=5
```

---

## 错误处理

### API Key 缺失

```bash
# 错误：❌ 错误：需要设置 OPENAI_API_KEY 环境变量
# 解决：
export OPENAI_API_KEY=sk-xxx
```

### 记忆数据库损坏

```bash
# 删除并重建数据库
rm ~/.mem0/history.db
node scripts/mem0-list.js  # 会自动重建
```

### 搜索结果为空

可能原因：
1. 还没有存储任何记忆
2. 查询词与已存储记忆语义距离较远

解决：
```bash
# 尝试更宽泛的查询
node scripts/mem0-search.js "偏好" --limit=10

# 或检查已存储的记忆
node scripts/mem0-list.js
```

---

## 性能优化

### 批量添加

避免频繁调用添加接口，建议批量处理：

```javascript
// 推荐：批量添加
const memories = ["偏好 1", "偏好 2", "偏好 3"];
await mem0.add(memories.join("\n"), { userId });

// 不推荐：逐条添加
for (const memory of memories) {
  await mem0.add(memory, { userId });  // 慢
}
```

### 限制搜索结果

设置合理的 limit 值，避免返回过多结果：

```bash
# 推荐
node scripts/mem0-search.js "query" --limit=3

# 不推荐（返回太多，处理慢）
node scripts/mem0-search.js "query" --limit=50
```

---

## 安全注意事项

### 不要存储的内容

- ❌ 密码、API Key 等敏感凭证
- ❌ 身份证号、手机号等个人隐私
- ❌ 银行卡号、财务信息
- ❌ 公司机密信息

### 定期清理

建议定期审查和清理过时的记忆：

```bash
# 列出所有记忆
node scripts/mem0-list.js

# 删除过时记忆
node scripts/mem0-delete.js <memory_id>
```

---

## 调试技巧

### 启用 JSON 输出

```bash
JSON_OUTPUT=1 node scripts/mem0-search.js "query"
```

便于程序化处理和调试。

### 检查配置

```bash
# 查看当前用户 ID
echo $MEM0_USER_ID

# 查看数据库位置
ls -la ~/.mem0/
```

### 测试连接

```bash
# 添加测试记忆
node scripts/mem0-add.js "测试记忆 123"

# 搜索测试记忆
node scripts/mem0-search.js "测试"

# 删除测试记忆
node scripts/mem0-delete.js <id>
```

---

## 与 MEMORY.md 配合使用

| 类型 | MEMORY.md | Mem0 |
|------|-----------|------|
| 永久事实 | ✅ 姓名、位置 | ❌ |
| 参考数据 | ✅ 邮箱、博客 | ❌ |
| 结构化知识 | ✅ 项目详情 | ❌ |
| 用户偏好 | ❌ | ✅「喜欢简洁回复」 |
| 行为模式 | ❌ | ✅「通常 8 点询问天气」 |
| 动态上下文 | ❌ | ✅「最近在学习 Python」 |

**最佳实践：**
- MEMORY.md 存储结构化、永久性事实
- Mem0 存储动态、学习到的偏好和模式
- 两者互补，避免重复存储
