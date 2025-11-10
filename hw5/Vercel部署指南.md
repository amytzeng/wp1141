# 🚀 Vercel 部署完整指南

## 📋 部署前準備（10 分鐘）

### ✅ 確認清單

在開始部署前，確認以下項目：

- [ ] 專案在本地可以正常運行（`npm run dev`）
- [ ] 已測試核心功能（登入、發文、按讚、留言）
- [ ] 已設定好 PostgreSQL（Supabase 或 Neon）
- [ ] 已取得 Google OAuth 憑證
- [ ] 已取得 Pusher 憑證
- [ ] 專案已推送到 GitHub

---

## 🗄️ 步驟 1：準備 PostgreSQL 資料庫（5 分鐘）

### 選項 A：使用 Supabase（推薦）

1. **確認 Supabase 專案已建立**
   - 訪問 https://supabase.com/
   - 確認你的專案正在運行

2. **取得連接字串**
   - 進入專案 → Settings → Database
   - 找到「Connection string」→ 選擇「URI」
   - 複製連接字串（保存好，等下要用）

3. **重要：使用 Connection Pooling**
   ```
   正確：postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
   錯誤：postgresql://...supabase.com:5432/postgres（Direct connection）
   ```
   Vercel 需要使用 Connection Pooling 避免連接數過多。

### 選項 B：使用 Neon

1. 訪問 https://neon.tech/
2. 確認專案已建立
3. 複製連接字串（保存好）

---

## 🔗 步驟 2：部署到 Vercel（15 分鐘）

### 2.1 登入 Vercel

1. 訪問 https://vercel.com/
2. 使用 GitHub 帳號登入

### 2.2 導入專案

1. 點擊「Add New...」→「Project」
2. 找到你的 GitHub repository：`wp1141`
3. 點擊「Import」

### 2.3 設定專案

**Root Directory：**
```
hw5
```
（因為你的專案在 wp1141/hw5 目錄下）

**Framework Preset：**
```
Next.js（自動偵測）
```

**Build Command：**
```
npm run build
```

**Output Directory：**
```
.next
```

### 2.4 設定環境變數（重要！）

點擊「Environment Variables」，添加以下變數：

#### 資料庫
```
DATABASE_URL
你的 PostgreSQL 連接字串（從 Supabase 或 Neon 複製）
```

#### NextAuth
```
NEXTAUTH_URL
https://your-app.vercel.app（先填臨時值，部署後會更新）

NEXTAUTH_SECRET
執行 openssl rand -base64 32 生成的值
```

#### Google OAuth
```
GOOGLE_CLIENT_ID
你的 Google Client ID

GOOGLE_CLIENT_SECRET
你的 Google Client Secret
```

#### GitHub OAuth（選填）
```
GITHUB_CLIENT_ID
你的 GitHub Client ID（如果有設定）

GITHUB_CLIENT_SECRET
你的 GitHub Client Secret（如果有設定）
```

#### Pusher（即時更新）
```
NEXT_PUBLIC_PUSHER_APP_KEY
你的 Pusher Key

NEXT_PUBLIC_PUSHER_CLUSTER
ap3

PUSHER_APP_ID
你的 Pusher App ID

PUSHER_SECRET
你的 Pusher Secret
```

#### Cloudinary（選填）
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
你的 Cloudinary Cloud Name（如果有設定）
```

### 2.5 部署

1. 確認所有環境變數都已填入
2. 點擊「Deploy」
3. 等待 3-5 分鐘建置完成
4. **記下你的 Vercel URL**（例如：`https://echo-abc123.vercel.app`）

---

## 🔧 步驟 3：更新 OAuth Redirect URIs（10 分鐘）

部署完成後，你會得到一個 Vercel URL（例如：`https://echo-abc123.vercel.app`）

### 3.1 更新 Google OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 左側選單：API 和服務 → 憑證
4. 點擊你的 OAuth 2.0 用戶端 ID
5. 在「已授權的重新導向 URI」**添加**（不是取代）：
   ```
   https://echo-abc123.vercel.app/api/auth/callback/google
   ```
   （替換成你的實際 URL）
6. 保留原有的 `http://localhost:3000/api/auth/callback/google`
7. 點擊「儲存」

### 3.2 更新 GitHub OAuth（如果有設定）

1. 前往 https://github.com/settings/developers
2. 點擊你的 OAuth App
3. Authorization callback URL **添加**：
   ```
   https://echo-abc123.vercel.app/api/auth/callback/github
   ```

### 3.3 更新 Vercel 環境變數

1. 回到 Vercel Dashboard
2. 選擇你的專案
3. Settings → Environment Variables
4. 找到 `NEXTAUTH_URL`
5. 點擊編輯，改為你的實際 URL：
   ```
   https://echo-abc123.vercel.app
   ```
6. 點擊「Save」

### 3.4 重新部署

**重要：** 環境變數更新後需要重新部署

1. 前往 Deployments 標籤
2. 點擊最新的部署右側的 「...」
3. 點擊「Redeploy」
4. 等待重新建置完成

---

## ✅ 步驟 4：測試部署的應用程式（10 分鐘）

### 4.1 基本測試

1. **訪問你的 Vercel URL**
   ```
   https://echo-abc123.vercel.app
   ```

2. **測試登入**
   - [ ] 頁面正常載入
   - [ ] 點擊「使用 Google 繼續」
   - [ ] Google 授權成功
   - [ ] 設定 userId
   - [ ] 成功進入首頁

3. **測試核心功能**
   - [ ] 發文成功
   - [ ] 按讚成功
   - [ ] 留言成功
   - [ ] 個人頁面正常

### 4.2 多裝置測試

1. **用手機訪問**
   - 確認 UI 正常顯示
   - 測試登入

2. **用另一台電腦/瀏覽器**
   - 用不同帳號登入
   - 測試即時更新

---

## 🐛 常見部署問題

### 問題 1：Internal Server Error 500

**原因：** 資料庫連接失敗

**解決：**
1. 檢查 Vercel 的環境變數 `DATABASE_URL` 是否正確
2. 確認 PostgreSQL 服務正在運行
3. 測試連接字串：在本地 `.env` 試試看能否連接

### 問題 2：OAuth 登入失敗

**原因：** Redirect URI 不正確

**解決：**
1. 確認 Google Cloud Console 的 Redirect URI **完全匹配**
2. 格式：`https://your-actual-url.vercel.app/api/auth/callback/google`
3. 注意：
   - ✅ `https://`（生產環境用 https）
   - ❌ 結尾不要有 `/`
   - ✅ 確實是你的 Vercel URL

### 問題 3：Environment Variables 沒生效

**原因：** 環境變數更新後沒有重新部署

**解決：**
1. Deployments → 最新部署 → ... → Redeploy
2. 或者推送一個新的 commit 觸發自動部署

### 問題 4：Prisma Client 錯誤

**原因：** Prisma 沒有正確生成

**解決：**
在 Vercel 會自動執行 `prisma generate`，如果還有問題：

1. 在專案根目錄添加 `postinstall` script
2. 編輯 `package.json`：
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
3. 重新部署

### 問題 5：圖片上傳不工作

**原因：** Cloudinary 環境變數未設定

**解決：**
1. 如果沒設定 Cloudinary，系統會自動用 Base64
2. Base64 會增加資料庫大小，建議設定 Cloudinary

---

## 📊 部署檢查清單

### 部署前
- [x] 本地測試通過
- [x] 專案推送到 GitHub
- [x] PostgreSQL 資料庫準備好
- [x] OAuth 憑證準備好
- [x] Pusher 憑證準備好

### 部署中
- [ ] Vercel 專案設定正確（Root Directory = hw5）
- [ ] 所有環境變數已填入
- [ ] 建置成功（無錯誤）
- [ ] 取得 Vercel URL

### 部署後
- [ ] 更新 Google OAuth Redirect URI
- [ ] 更新 NEXTAUTH_URL
- [ ] 重新部署
- [ ] 測試登入成功
- [ ] 測試核心功能

---

## 🎯 快速部署流程（給有經驗的開發者）

```bash
# 1. 確認 git 狀態
git status

# 2. 如果有變更，commit
git add .
git commit -m "Ready for deployment"
git push

# 3. 前往 Vercel
# https://vercel.com/ → Import Project → 選擇 repo

# 4. 設定
# Root Directory: hw5
# 環境變數：填入所有值

# 5. Deploy

# 6. 取得 URL 後
# - 更新 Google OAuth Redirect URI
# - 更新 Vercel 的 NEXTAUTH_URL
# - Redeploy

# 7. 測試
# 訪問你的 Vercel URL → 登入 → 測試功能
```

---

## 📝 部署後的環境變數範例

```bash
# Vercel 環境變數（生產環境）
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXTAUTH_URL="https://echo-abc123.vercel.app"
NEXTAUTH_SECRET="你的secret"
GOOGLE_CLIENT_ID="你的client-id"
GOOGLE_CLIENT_SECRET="你的client-secret"
NEXT_PUBLIC_PUSHER_APP_KEY="你的pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="ap3"
PUSHER_APP_ID="你的app-id"
PUSHER_SECRET="你的pusher-secret"
```

---

## 🎉 部署成功！

完成以上步驟後，你的 Echo 應用程式就成功部署到 Vercel 了！

**接下來：**
1. 分享你的 Vercel URL 給朋友測試
2. 用不同裝置測試（手機、平板）
3. 測試即時更新功能
4. 準備作業展示

---

## 💡 進階提示

### 自訂網域（選填）

如果想要自訂網域（例如：echo.yourdomain.com）：

1. Vercel Dashboard → Settings → Domains
2. 添加你的網域
3. 按照指示設定 DNS
4. 更新 OAuth Redirect URIs

### 監控和日誌

1. Vercel Dashboard → Deployments → 點擊部署
2. 查看建置日誌
3. 查看執行日誌（Runtime Logs）
4. 監控效能和錯誤

### 環境變數管理

Vercel 支援三種環境：
- **Production**：正式環境
- **Preview**：預覽環境（Pull Request）
- **Development**：開發環境

建議：所有環境變數都勾選 Production。

---

## 📞 需要幫助？

### 如果部署失敗

1. **查看建置日誌**
   - Vercel Dashboard → Deployments → 點擊失敗的部署
   - 查看錯誤訊息

2. **常見錯誤**
   - Module not found：檢查 import 路徑
   - Prisma error：確認 `postinstall` script
   - Build timeout：專案太大或網路問題

3. **檢查清單**
   - [ ] package.json 沒有語法錯誤
   - [ ] 所有依賴都在 dependencies（不在 devDependencies）
   - [ ] Prisma schema 正確
   - [ ] 環境變數都已設定

---

**準備好了就開始部署吧！** 🚀

