#!/bin/bash

echo "🔍 Echo 專案設定檢查"
echo "===================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查 .env 檔案
echo "1️⃣ 檢查 .env 檔案..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env 檔案存在${NC}"
else
    echo -e "${RED}❌ .env 檔案不存在${NC}"
    echo "   請執行：cp .env.example .env"
    exit 1
fi
echo ""

# 檢查 NEXTAUTH_SECRET
echo "2️⃣ 檢查 NEXTAUTH_SECRET..."
if grep -q "NEXTAUTH_SECRET=" .env && ! grep -q "請執行" .env | grep NEXTAUTH_SECRET > /dev/null; then
    SECRET=$(grep "NEXTAUTH_SECRET=" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    if [ ${#SECRET} -gt 20 ]; then
        echo -e "${GREEN}✅ NEXTAUTH_SECRET 已設定${NC}"
    else
        echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET 可能不正確${NC}"
        echo "   請執行：openssl rand -base64 32"
    fi
else
    echo -e "${RED}❌ NEXTAUTH_SECRET 未設定${NC}"
fi
echo ""

# 檢查 Google OAuth
echo "3️⃣ 檢查 Google OAuth..."
GOOGLE_ID=$(grep "GOOGLE_CLIENT_ID=" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
GOOGLE_SECRET=$(grep "GOOGLE_CLIENT_SECRET=" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')

if [[ "$GOOGLE_ID" == "your-google-client-id" ]] || [ -z "$GOOGLE_ID" ]; then
    echo -e "${RED}❌ Google Client ID 未設定（還是範例值）${NC}"
    echo "   需要從 Google Cloud Console 取得"
else
    echo -e "${GREEN}✅ Google Client ID 已設定${NC}"
fi

if [[ "$GOOGLE_SECRET" == "your-google-client-secret" ]] || [ -z "$GOOGLE_SECRET" ]; then
    echo -e "${RED}❌ Google Client Secret 未設定（還是範例值）${NC}"
    echo "   需要從 Google Cloud Console 取得"
else
    echo -e "${GREEN}✅ Google Client Secret 已設定${NC}"
fi
echo ""

# 檢查資料庫
echo "4️⃣ 檢查資料庫..."
if [ -f "prisma/dev.db" ]; then
    echo -e "${GREEN}✅ 資料庫檔案存在${NC}"
else
    echo -e "${YELLOW}⚠️  資料庫檔案不存在${NC}"
    echo "   請執行：npx prisma db push"
fi
echo ""

# 檢查 node_modules
echo "5️⃣ 檢查依賴..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules 存在${NC}"
else
    echo -e "${RED}❌ node_modules 不存在${NC}"
    echo "   請執行：npm install"
fi
echo ""

# 總結
echo "===================="
echo "📊 檢查總結"
echo "===================="
echo ""

if [[ "$GOOGLE_ID" == "your-google-client-id" ]] || [[ "$GOOGLE_SECRET" == "your-google-client-secret" ]]; then
    echo -e "${RED}❌ OAuth 未正確設定！${NC}"
    echo ""
    echo "🔧 修復步驟："
    echo ""
    echo "1. 訪問 Google Cloud Console："
    echo "   https://console.cloud.google.com/"
    echo ""
    echo "2. 建立 OAuth 憑證（參考「錯誤排除.md」）"
    echo ""
    echo "3. 將 Client ID 和 Secret 填入 .env"
    echo ""
    echo "4. 重新啟動伺服器：npm run dev"
    echo ""
else
    echo -e "${GREEN}✅ 設定看起來正確！${NC}"
    echo ""
    echo "🚀 可以啟動伺服器了："
    echo "   npm run dev"
    echo ""
    echo "然後訪問："
    echo "   http://localhost:3000"
    echo ""
fi

echo "📚 詳細教學請參考："
echo "   - 錯誤排除.md"
echo "   - 專案架構說明.md"
echo "   - 現在就開始.md"
echo ""

