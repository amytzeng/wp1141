#!/bin/bash

echo "🌊 Echo 專案快速啟動腳本"
echo "=========================="
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 找不到 Node.js，請先安裝 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 檢查 .env 檔案
if [ ! -f ".env" ]; then
    echo "⚠️  找不到 .env 檔案"
    echo "📝 正在建立 .env 檔案..."
    cat > .env << 'ENVEOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="請執行 openssl rand -base64 32 產生並替換此處"

# OAuth 設定（至少需要設定一個）
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
ENVEOF
    echo "✅ .env 檔案已建立"
    echo "⚠️  請編輯 .env 檔案並填入 OAuth 設定"
    echo ""
fi

# 檢查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴..."
    npm install
    echo "✅ 依賴安裝完成"
    echo ""
fi

# 檢查資料庫
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  初始化資料庫..."
    npx prisma db push
    npx prisma generate
    echo "✅ 資料庫初始化完成"
    echo ""
fi

echo "🚀 啟動開發伺服器..."
echo ""
echo "📝 提示："
echo "1. 訪問 http://localhost:3000"
echo "2. 使用 OAuth 登入（需要先在 .env 中設定）"
echo "3. 按 Ctrl+C 停止伺服器"
echo ""

npm run dev
