# 🌊 Echo - 社群媒體平台

> 一個功能完整的社群媒體平台，類似 Twitter/X，使用 Next.js、TypeScript、Prisma 和 Pusher 建構

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![Pusher](https://img.shields.io/badge/Pusher-Realtime-300D4F?style=flat-square&logo=pusher)

---

## 從 GitHub 

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

```

**生成 NEXTAUTH_SECRET：**
```bash
openssl rand -base64 32
```

**設定 PostgreSQL 資料庫：**

使用 Neon（免費 Serverless PostgreSQL）

1. 註冊 [Neon](https://neon.tech/)
2. 建立專案
3. 複製連接字串到 `.env`

本地 PostgreSQL
```bash
# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql
createdb echo_dev

# DATABASE_URL 設為：
# postgresql://你的使用者名稱@localhost:5432/echo_dev

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

# 📄 授權

本專案僅供教育用途。

---

**享受使用 Echo！** 🌊✨

如果有任何問題，請參考上述文件或檢查 Browser Console 的錯誤訊息。
