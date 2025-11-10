#!/bin/bash

# Echo 部署前檢查腳本

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 檢查 Echo 專案是否準備好部署到 Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤：請在 hw5 目錄下執行此腳本"
    exit 1
fi

echo "📦 檢查專案檔案..."

# 1. 檢查 package.json
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    
    # 檢查 postinstall script
    if grep -q '"postinstall"' package.json; then
        echo "✅ postinstall script 已設定"
    else
        echo "⚠️  警告：缺少 postinstall script"
    fi
else
    echo "❌ package.json 不存在"
fi

# 2. 檢查 Prisma schema
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ prisma/schema.prisma 存在"
    
    # 檢查是否使用 postgresql
    if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
        echo "✅ 資料庫設定為 PostgreSQL（符合作業要求）"
    elif grep -q 'provider = "sqlite"' prisma/schema.prisma; then
        echo "⚠️  警告：目前使用 SQLite，部署前需改為 PostgreSQL"
        echo "   修改 prisma/schema.prisma 第 9 行："
        echo "   provider = \"postgresql\""
    fi
else
    echo "❌ prisma/schema.prisma 不存在"
fi

# 3. 檢查環境變數範本
if [ -f "ENV_EXAMPLE" ] || [ -f ".env.example" ] || [ -f "ENV_TEMPLATE.txt" ]; then
    echo "✅ 環境變數範本存在"
else
    echo "⚠️  警告：缺少環境變數範本"
fi

# 4. 檢查 .env（本地開發）
if [ -f ".env" ]; then
    echo "✅ .env 檔案存在（本地開發用）"
    
    # 檢查關鍵變數
    if grep -q "GOOGLE_CLIENT_ID=" .env && ! grep -q "GOOGLE_CLIENT_ID=\"\"" .env; then
        echo "✅ Google OAuth 已設定"
    else
        echo "⚠️  警告：Google OAuth 未設定"
    fi
    
    if grep -q "PUSHER_APP_ID=" .env && ! grep -q "PUSHER_APP_ID=\"\"" .env; then
        echo "✅ Pusher 已設定"
    else
        echo "⚠️  Pusher 未設定（部署時可選）"
    fi
else
    echo "⚠️  .env 檔案不存在（部署時會用 Vercel 環境變數）"
fi

# 5. 檢查 Git
if [ -d ".git" ]; then
    echo "✅ Git repository 已初始化"
    
    # 檢查是否有遠端
    if git remote -v | grep -q "github.com"; then
        echo "✅ GitHub 遠端已設定"
        REMOTE_URL=$(git remote get-url origin 2>/dev/null)
        echo "   遠端 URL: $REMOTE_URL"
    else
        echo "⚠️  警告：未設定 GitHub 遠端"
    fi
else
    echo "❌ 不是 Git repository"
fi

# 6. 檢查 node_modules
if [ -d "node_modules" ]; then
    echo "✅ 依賴已安裝"
else
    echo "⚠️  警告：需要執行 npm install"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 檢查結果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  部署前需要準備："
echo "   1. PostgreSQL 資料庫（Supabase 或 Neon）"
echo "   2. Google OAuth 憑證"
echo "   3. Pusher 憑證"
echo "   4. 推送到 GitHub（如果還沒推）"
echo ""
echo "📚 參考文件："
echo "   → Vercel部署指南.md（完整流程）"
echo "   → 部署步驟.md（簡易版本）"
echo "   → PostgreSQL設定.md（資料庫設定）"
echo ""
echo "🚀 準備好了就前往 Vercel 開始部署："
echo "   https://vercel.com/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
