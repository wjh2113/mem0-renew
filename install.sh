#!/bin/bash
# Mem0-Recruiter 安装脚本
# 自动安装依赖并初始化配置

set -e

echo "🔧 Mem0-Recruiter 安装程序"
echo "=========================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：需要 Node.js"
    echo "请安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：需要 npm"
    exit 1
fi

echo "✅ npm 版本：$(npm -v)"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install --production

# 创建配置目录
echo ""
echo "📁 创建配置目录..."
mkdir -p ~/.mem0

# 检查环境变量
echo ""
echo "🔍 检查环境变量..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  警告：OPENAI_API_KEY 未设置"
    echo "   请设置环境变量后使用："
    echo "   export OPENAI_API_KEY=your_key_here"
else
    echo "✅ OPENAI_API_KEY 已配置"
fi

# 复制示例配置
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    echo ""
    echo "📝 复制环境变量示例..."
    cp .env.example .env
    echo "   已创建 .env 文件，请编辑后填入你的配置"
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "使用说明："
echo "  搜索记忆：node scripts/mem0-search.js \"查询内容\""
echo "  添加记忆：node scripts/mem0-add.js \"记忆内容\""
echo "  列出记忆：node scripts/mem0-list.js"
echo "  删除记忆：node scripts/mem0-delete.js <memory_id>"
echo ""
