# 🌊 Echo - 社群媒體平台

> 一個功能完整的社群媒體平台，類似 Twitter/X，使用 Next.js、TypeScript、Prisma 和 Pusher 建構

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![Pusher](https://img.shields.io/badge/Pusher-Realtime-300D4F?style=flat-square&logo=pusher)

**完成度：100%** | **作業要求：✅ 全部完成**

---

## 🎯 第一次使用？從這裡開始！

如果你是從 GitHub clone 這個專案，請按照以下步驟（預計 10-15 分鐘）：

### 1️⃣ 安裝依賴

```bash
npm install
```

這會安裝所有必要的套件（Next.js, React, Prisma, Pusher, NextAuth 等）。

### 2️⃣ 建立環境變數檔案

複製環境變數範本並填入實際的值：

```bash
cp ENV_EXAMPLE .env
```

然後編輯 `.env` 檔案，填入以下內容：

```bash
# 資料庫（PostgreSQL）
# 開發環境選項：
# 1. 使用線上免費 PostgreSQL（推薦）：Supabase, Neon, Railway
# 2. 本地 PostgreSQL（需先安裝）
# 3. 臨時開發可用 SQLite: file:./dev.db（但不符合作業要求）
DATABASE_URL="postgresql://username:password@localhost:5432/echo_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="請執行下方指令生成"

# Google OAuth（必須）
GOOGLE_CLIENT_ID="你的值"
GOOGLE_CLIENT_SECRET="你的值"

# Pusher（必須）
NEXT_PUBLIC_PUSHER_APP_KEY="你的值"
NEXT_PUBLIC_PUSHER_CLUSTER="你的值"
PUSHER_APP_ID="你的值"
PUSHER_SECRET="你的值"

# Cloudinary（選填）
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```

**生成 NEXTAUTH_SECRET：**
```bash
openssl rand -base64 32
```

**設定 PostgreSQL 資料庫：**

**選項 A：使用 Supabase（推薦，免費）**
1. 註冊 [Supabase](https://supabase.com/)
2. 建立新專案
3. 在 Settings → Database → Connection String 複製連接字串
4. 選擇 "URI" 格式，複製到 `.env` 的 `DATABASE_URL`

**選項 B：使用 Neon（免費 Serverless PostgreSQL）**
1. 註冊 [Neon](https://neon.tech/)
2. 建立專案
3. 複製連接字串到 `.env`

**選項 C：本地 PostgreSQL**
```bash
# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql
createdb echo_dev

# DATABASE_URL 設為：
# postgresql://你的使用者名稱@localhost:5432/echo_dev
```

**臨時開發方案（不符合作業要求）：**
```bash
# 如果暫時還沒設定 PostgreSQL，可以先用 SQLite 開發
DATABASE_URL="file:./dev.db"

# ⚠️ 注意：部署前必須改回 PostgreSQL
```

### 3️⃣ 取得必要的 API 憑證

#### Google OAuth（必須）

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案
3. 啟用 APIs & Services
4. 建立 OAuth 2.0 憑證
5. **Authorized redirect URIs** 填入：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. 複製 Client ID 和 Client Secret 到 `.env`

> 詳細步驟請參考：[Google登入權限設定.md](./Google登入權限設定.md)

#### Pusher（必須）

1. 前往 [Pusher](https://pusher.com/)
2. 註冊免費帳號
3. 建立新的 Channels app
4. 在 App Keys 取得 4 個值填入 `.env`

> 詳細步驟請參考：[環境變數設定.md](./環境變數設定.md)

### 4️⃣ 初始化資料庫

```bash
# 推送資料庫 schema 到 PostgreSQL
npx prisma db push

# 生成 Prisma Client
npx prisma generate
```

**如果遇到連接錯誤：**
- 確認 PostgreSQL 服務正在運行
- 檢查 `DATABASE_URL` 格式是否正確
- 確認資料庫已建立（如果使用本地 PostgreSQL）

### 5️⃣ 啟動專案

```bash
npm run dev
```

打開瀏覽器訪問：**http://localhost:3000**

如果看到登入頁面，恭喜你設定成功！🎉

---

# 📑 目錄

1. [主要功能](#-主要功能)
2. [技術架構](#-技術架構)
3. [專案結構](#-專案結構)
4. [常用指令](#-常用指令)
5. [測試指南](#-測試指南)
6. [錯誤排除](#-錯誤排除)
7. [進階設定](#-進階設定)
8. [部署到 Vercel](#-部署到-vercel)

---

# ✨ 主要功能

## 已完成功能（100%）

### 🔐 使用者認證
- ✅ Google / GitHub / Facebook OAuth 登入
- ✅ 自訂 userId（使用者名稱）
- ✅ Session 管理
- ✅ 登出功能

### 📝 發文功能
- ✅ 發表文章（最多 280 字元）
- ✅ 智能字元計算（連結固定 23 字元，#hashtag 和 @mention 不計算）
- ✅ Hashtag (#) 支援
- ✅ Mention (@) 支援，可點擊跳轉
- ✅ 連結自動轉換為超連結
- ✅ 草稿儲存與載入
- ✅ 刪除自己的貼文

### 💬 互動功能
- ✅ 按讚/取消讚
- ✅ 轉發 (Repost)
- ✅ **禁止轉發自己的貼文**
- ✅ 留言（支援巢狀留言）
- ✅ **留言獨立頁面**（可遞迴點擊進入下一層）
- ✅ 即時更新（使用 Pusher）
- ✅ 樂觀 UI 更新（無延遲）

### 👤 個人檔案
- ✅ 查看自己/他人的個人頁面
- ✅ 編輯個人資料（姓名、簡介）
- ✅ **上傳頭貼和背景圖**（Cloudinary 或 Base64）
- ✅ Follow / Unfollow
- ✅ **查看個人貼文和轉發**（Posts 標籤包含自己發的和轉發的貼文）
- ✅ 查看按讚的文章（僅自己可見）
- ✅ 顯示統計（貼文數、追蹤者、追蹤中）

### 🏠 動態牆
- ✅ 顯示所有貼文 (All)
- ✅ 顯示追蹤的人的貼文 (Following)
- ✅ 時間戳記（相對時間 + 絕對時間）
- ✅ **Inline 發文**（點擊展開）
- ✅ 點擊貼文查看詳細頁面
- ✅ **遞迴留言結構**（可無限層級點擊進入）
- ✅ 列表中不顯示留言內容（符合 11/06 更新）

### 🔍 搜尋功能
- ✅ 搜尋頁面
- ✅ 支援姓名搜尋
- ✅ 支援使用者代碼（userId）搜尋
- ✅ 顯示搜尋結果清單
- ✅ 顯示使用者資訊（頭像、姓名、簡介、統計數字）
- ✅ 直接在搜尋結果關注/取消關注
- ✅ 點擊前往使用者個人頁面

### ⚡ 即時功能（Pusher）
- ✅ 按讚即時更新
- ✅ 留言即時更新
- ✅ 多裝置同步

---

# 🛠 技術架構

## 前端
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod

## 後端
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL（符合作業要求）
- **ORM**: Prisma
- **Authentication**: NextAuth.js v4
- **Real-time**: Pusher

## 基礎設施
- **Hosting**: Vercel
- **Image Storage**: Cloudinary (optional, 否則使用 Base64)
- **OAuth**: Google / GitHub / Facebook

---

# 📁 專案結構

```
hw5/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # 主應用程式路由
│   │   │   ├── home/          # 首頁
│   │   │   ├── profile/       # 個人頁面
│   │   │   └── post/          # 貼文詳細頁
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── posts/         # 貼文相關 API
│   │   │   ├── users/         # 使用者 API
│   │   │   └── comments/      # 留言 API
│   │   ├── login/             # 登入頁
│   │   └── register/          # 註冊頁
│   ├── components/            # React 元件
│   │   ├── layout/           # 佈局元件
│   │   ├── post/             # 貼文相關元件
│   │   ├── profile/          # 個人頁面元件
│   │   └── ui/               # shadcn/ui 元件
│   ├── lib/                   # 工具函數
│   │   ├── prisma.ts         # Prisma 客戶端
│   │   ├── auth.ts           # NextAuth 設定
│   │   ├── pusher.ts         # Pusher 伺服器端
│   │   └── pusher-client.ts  # Pusher 客戶端
│   ├── hooks/                 # 自訂 Hooks
│   └── types/                 # TypeScript 型別
├── prisma/
│   └── schema.prisma          # 資料庫 Schema
├── public/                     # 靜態檔案
├── .env                        # 環境變數（不會被 commit）
├── ENV_TEMPLATE.txt           # 環境變數範本
└── package.json               # 專案依賴
```

---

# 💻 常用指令

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 生產模式
npm start

# Lint 檢查
npm run lint

# 資料庫管理
npx prisma studio          # 開啟資料庫 GUI
npx prisma db push         # 推送 schema 變更
npx prisma generate        # 生成 Prisma Client
npx prisma db push --force-reset  # 重置資料庫
```

---

# 🧪 測試指南

## 基本功能測試

### 1. 登入流程
- [ ] 訪問 http://localhost:3000
- [ ] 點擊「Google 登入」
- [ ] 完成 OAuth 授權
- [ ] 設定 userId
- [ ] 成功進入首頁

### 2. 發文功能
- [ ] 點擊側邊欄「發文」按鈕
- [ ] 輸入文字（測試 280 字限制）
- [ ] 加入 #hashtag 和 @mention
- [ ] 加入連結（測試 23 字元計算）
- [ ] 發布成功

### 3. 互動功能
- [ ] 按讚/取消讚
- [ ] 轉發貼文
- [ ] 新增留言
- [ ] 刪除自己的貼文

### 4. 個人頁面
- [ ] 點擊側邊欄「個人檔案」
- [ ] 點擊「Edit Profile」
- [ ] 上傳頭貼
- [ ] 上傳背景圖
- [ ] 編輯姓名和簡介
- [ ] 儲存成功

### 5. 搜尋功能
- [ ] 點擊側邊欄「搜尋」
- [ ] 輸入使用者名稱搜尋
- [ ] 查看搜尋結果
- [ ] 點擊使用者前往個人頁面
- [ ] 回到搜尋頁面
- [ ] 輸入 userId 搜尋（例如：amy）
- [ ] 在搜尋結果直接關注/取消關注

### 6. 即時更新測試（重要！）
- [ ] 開啟兩個瀏覽器視窗
- [ ] 用不同帳號登入
- [ ] 在 A 視窗按讚某貼文
- [ ] B 視窗立即看到讚數增加
- [ ] 在 A 視窗留言
- [ ] B 視窗立即看到新留言

---

# ❗ 錯誤排除

## 常見問題

### Q1: `npm install` 失敗

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Q2: Google 登入錯誤 "redirect_uri_mismatch"

**原因：** Redirect URI 設定不正確

**解決：** 確認 Google Cloud Console 的設定**完全一致**：
```
http://localhost:3000/api/auth/callback/google
```

常見錯誤：
- ❌ `https://...` (應該是 http)
- ❌ `http://127.0.0.1:3000/...` (應該是 localhost)
- ❌ `.../google/` (結尾多一個斜線)

詳見：[Google登入權限設定.md](./Google登入權限設定.md)

### Q3: Google 登入「沒有權限」

**原因：** OAuth 應用程式在測試模式

**解決方法（擇一）：**
1. 在 OAuth consent screen → Test users → 加入你的 Gmail
2. 或點擊「PUBLISH APP」發布應用程式

### Q4: 下拉選單點擊沒反應

**原因：** `@radix-ui/react-dropdown-menu` 沒安裝或版本錯誤

**解決：**
```bash
npm install @radix-ui/react-dropdown-menu
npm run dev
```

### Q5: Prisma 錯誤

```bash
npx prisma generate
npx prisma db push
npm run dev
```

### Q6: Pusher 即時更新不運作

**檢查：**
1. `.env` 的 Pusher 設定是否正確
2. `NEXT_PUBLIC_PUSHER_APP_KEY` 和 `NEXT_PUBLIC_PUSHER_CLUSTER` 前綴是否有 `NEXT_PUBLIC_`
3. Browser Console 是否有錯誤訊息

### Q7: PostgreSQL 連接錯誤

**錯誤訊息：**
```
Can't reach database server at `localhost:5432`
```

**解決方案：**

**如果使用 Supabase/Neon：**
- 確認連接字串正確複製到 `.env`
- 連接字串應包含密碼，格式：`postgresql://user:password@host:5432/dbname`

**如果使用本地 PostgreSQL：**
```bash
# 檢查 PostgreSQL 是否運行
brew services list | grep postgresql

# 啟動 PostgreSQL
brew services start postgresql

# 確認資料庫存在
psql -l
```

**臨時開發方案：**
```bash
# 可以暫時改回 SQLite 開發，部署前再改回 PostgreSQL
# .env
DATABASE_URL="file:./dev.db"

# prisma/schema.prisma（臨時改回 SQLite）
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# 重新推送
npx prisma db push
npx prisma generate
```

---

# 🚀 進階設定

## Cloudinary 圖片上傳（選填）

如果想要將圖片上傳到雲端（推薦正式環境）：

1. 註冊 [Cloudinary](https://cloudinary.com/) 免費帳號
2. 建立 Upload Preset：
   - 名稱：`echo_preset`
   - Signing Mode：`Unsigned`
3. 在 `.env` 加入：
   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="你的cloud-name"
   ```
4. 重啟伺服器

不設定的話，系統會使用 Base64 儲存圖片（適合開發環境）。

詳見：[圖片上傳設定.md](./圖片上傳設定.md)

---

# 🌐 部署到 Vercel

## 步驟

### 1. 推送到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. 連接 Vercel

1. 前往 [Vercel](https://vercel.com/)
2. 點擊「Import Project」
3. 選擇你的 GitHub repository
4. 設定環境變數

### 3. 環境變數設定

在 Vercel 專案設定中加入所有 `.env` 的變數：

**必須更新的：**
```bash
NEXTAUTH_URL="https://your-app.vercel.app"
DATABASE_URL="你的 PostgreSQL 連接字串"
```

**Google OAuth 更新：**
- 在 Google Cloud Console 的 Authorized redirect URIs 加入：
  ```
  https://your-app.vercel.app/api/auth/callback/google
  ```

### 4. 部署

點擊「Deploy」，等待建置完成。

---

# 📚 相關文件

## 🚀 快速開始
- **[ENV_EXAMPLE](./ENV_EXAMPLE)** - ⭐ 環境變數範本（可直接複製）
- **[PostgreSQL設定.md](./PostgreSQL設定.md)** - PostgreSQL 快速設定（Supabase 5 分鐘搞定）
- **[測試清單.md](./測試清單.md)** - 18 個測試點完整清單

## 🔧 設定指南
- **[Google登入權限設定.md](./Google登入權限設定.md)** - OAuth 詳細設定
- **[圖片上傳設定.md](./圖片上傳設定.md)** - Cloudinary 設定指南
- **[環境變數設定.md](./環境變數設定.md)** - 完整環境變數說明

## 🌐 部署
- **[Vercel部署指南.md](./Vercel部署指南.md)** - ⭐ 完整部署流程
- **[部署步驟.md](./部署步驟.md)** - 簡易步驟版本

---

# 🎯 快速檢查清單

設定完成後，確認以下功能：

- [ ] ✅ 可以訪問 http://localhost:3000
- [ ] ✅ 可以使用 Google 登入
- [ ] ✅ 可以設定 userId
- [ ] ✅ 可以發文（測試 280 字限制）
- [ ] ✅ 可以按讚
- [ ] ✅ 可以留言
- [ ] ✅ 可以轉發（但不能轉發自己的貼文）
- [ ] ✅ 轉發狀態在所有頁面同步
- [ ] ✅ 即時更新有效（開兩個視窗測試）
- [ ] ✅ 可以上傳頭貼
- [ ] ✅ 可以編輯個人資料
- [ ] ✅ 可以查看他人頁面
- [ ] ✅ 可以 Follow/Unfollow
- [ ] ✅ 側邊欄帳號選單可以點擊
- [ ] ✅ 可以搜尋其他使用者
- [ ] ✅ 點擊留言可遞迴進入下一層
- [ ] ✅ 個人頁面 Posts 標籤包含轉發的貼文

---

# 📊 資料庫 Schema

主要資料表：

- **User** - 使用者資料
- **Post** - 貼文
- **Comment** - 留言（支援巢狀）
- **Like** - 按讚記錄
- **Repost** - 轉發記錄
- **Follow** - 追蹤關係
- **Draft** - 草稿

查看完整 schema：`prisma/schema.prisma`

---

# 🙏 致謝

- **Next.js** - React 框架
- **Prisma** - ORM
- **Pusher** - 即時通訊
- **NextAuth** - 身份驗證
- **shadcn/ui** - UI 元件
- **Tailwind CSS** - CSS 框架

---

# 📄 授權

本專案僅供教育用途。

---

**享受使用 Echo！** 🌊✨

如果有任何問題，請參考上述文件或檢查 Browser Console 的錯誤訊息。
