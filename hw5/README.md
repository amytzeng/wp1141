# Echo - 社群媒體平台

Echo 是一個社群媒體平台，採用 Next.js 14 全端框架、TypeScript、PostgreSQL 資料庫以及 Pusher 即時通訊技術建構。平臺支援 Google 和 GitHub OAuth 登入方式，實作了發文、按讚、轉發和無限層級遞迴留言等核心社交功能。除了滿足所有作業要求外，我也開發了**使用者搜尋系統、可以關注列表的人、還有圖片上傳，可以自己更改頭貼跟背景（支援 Cloudinary）**、完整的草稿管理系統，以及樂觀更新機制確保所有互動操作皆無延遲。專案採用 RESTful API 架構，並透過 Pusher 實現跨裝置即時同步，已成功部署至 Vercel 平台。

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)
![Pusher](https://img.shields.io/badge/Pusher-Realtime-300D4F?style=flat-square&logo=pusher)

**Vercel 部署：** https://wp1141-omega.vercel.app

---

## 🚀 快速開始

### 1️⃣ Clone 專案並安裝依賴

```bash
git clone <your-repo-url>
cd hw5
npm install
```

### 2️⃣ 設定環境變數

建立 `.env` 檔案：

```bash
# 資料庫（PostgreSQL）- 推薦使用 Neon（https://neon.tech/）
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="執行 openssl rand -base64 32 生成"

# Google OAuth（必須）
GOOGLE_CLIENT_ID="你的Google-Client-ID"
GOOGLE_CLIENT_SECRET="你的Google-Client-Secret"

# GitHub OAuth（選填）
GITHUB_CLIENT_ID="你的GitHub-Client-ID"
GITHUB_CLIENT_SECRET="你的GitHub-Client-Secret"

# Pusher（即時更新）
NEXT_PUBLIC_PUSHER_APP_KEY="你的Pusher-Key"
NEXT_PUBLIC_PUSHER_CLUSTER="ap3"
PUSHER_APP_ID="你的Pusher-App-ID"
PUSHER_SECRET="你的Pusher-Secret"
```

### 3️⃣ 初始化資料庫

```bash
npx prisma generate
npx prisma db push
```

### 4️⃣ 啟動開發伺服器

```bash
npm run dev
```

訪問 **http://localhost:3000** 🎉

---

## ✨ 主要功能

### 核心功能
- 🔐 **OAuth 認證**：Google / GitHub / Facebook 多種登入方式
- 📝 **發文系統**：280 字符限制、智能字數計算、草稿功能
- 💬 **互動功能**：按讚、轉發、留言（支援無限層級遞迴）
- 👤 **個人檔案**：編輯資料、上傳圖片、查看關注列表
- 🤝 **社交功能**：Follow/Unfollow、查看關注中/關注者
- 🔍 **搜尋功能**：搜尋使用者姓名或 userId
- ⚡ **即時更新**：Pusher 驅動的即時按讚、留言通知

### 特色功能
- **智能字符計數**：URL 固定 23 字元，Hashtag 和 Mention 不計入
- **遞迴留言**：可無限層級點擊進入留言詳細頁面
- **轉發系統**：支援 Repost，個人頁面顯示「轉發了」標記
- **樂觀更新**：按讚、轉發即時響應，無延遲
- **關注列表**：點擊關注中/關注者數字查看完整列表

---

## 🛠 技術架構

**前端：** Next.js 14 (App Router) + TypeScript + Tailwind CSS  
**後端：** Next.js API Routes + Prisma ORM  
**資料庫：** PostgreSQL  
**認證：** NextAuth.js v4  
**即時通訊：** Pusher Channels  
**部署：** Vercel

---

## 📋 環境變數設定指南

### 必須設定（5 個）

#### 1. DATABASE_URL - PostgreSQL 資料庫

**使用 Neon**

1. 註冊 https://neon.tech/
2. 建立專案
3. 複製連接字串（專案建立後立即顯示）
4. 格式：`postgresql://user:password@ep-xxx.aws.neon.tech/neondb`

**或使用 Supabase：** https://supabase.com/

#### 2. NEXTAUTH_SECRET - Session 加密密鑰

```bash
# 在終端機執行
openssl rand -base64 32
```

複製輸出的值。

#### 3-4. Google OAuth - Client ID 和 Secret

1. 前往 https://console.cloud.google.com/
2. 建立專案
3. API 和服務 → 憑證
4. 建立 OAuth 2.0 用戶端 ID
5. 應用程式類型：**網頁應用程式**
6. **已授權的重新導向 URI：**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   （部署後需要添加 Vercel URL）
7. 複製 Client ID 和 Client Secret

#### 5-8. Pusher - 即時更新

1. 註冊 https://pusher.com/
2. 建立 Channels app
3. Cluster 選擇：**ap3**
4. 在 App Keys 頁面取得 4 個值：
   - `app_id`
   - `key`
   - `secret`
   - `cluster`

### 選填設定

#### GitHub OAuth

1. https://github.com/settings/developers
2. New OAuth App
3. Authorization callback URL:
   ```
   http://localhost:3000/api/auth/callback/github
   ```

---

## 🌐 部署到 Vercel

### 前置準備

1. **確保已設定 PostgreSQL**（Neon 或 Supabase）
2. **確保本地測試通過**

### 部署步驟

#### 1. 前往 Vercel

訪問 https://vercel.com/ 並用 GitHub 登入

#### 2. 導入專案

- 點擊「Add New...」→「Project」
- 選擇你的 GitHub repository
- 點擊「Import」

#### 3. 設定專案

**Root Directory：** 設為 `hw5`（重要！）

**環境變數：** 添加所有變數

| 變數名稱 | 值 | 說明 |
|---------|---|------|
| `DATABASE_URL` | PostgreSQL 連接字串 | 從 Neon/Supabase 取得 |
| `NEXTAUTH_URL` | 先填 `https://temp.vercel.app` | 部署後更新 |
| `NEXTAUTH_SECRET` | 生成的 secret | 可以和本地用不同的 |
| `GOOGLE_CLIENT_ID` | 你的值 | 和本地相同 |
| `GOOGLE_CLIENT_SECRET` | 你的值 | 和本地相同 |
| `GITHUB_CLIENT_ID` | 你的值 | 和本地相同 |
| `GITHUB_CLIENT_SECRET` | 你的值 | 和本地相同 |
| `NEXT_PUBLIC_PUSHER_APP_KEY` | 你的值 | 和本地相同 |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | ap3 | 和本地相同 |
| `PUSHER_APP_ID` | 你的值 | 和本地相同 |
| `PUSHER_SECRET` | 你的值 | 和本地相同 |

#### 4. 部署

點擊「Deploy」，等待 3-5 分鐘

#### 5. 取得 Vercel URL

部署完成後記下你的 URL

### 部署後設定

#### 1. 更新 Google OAuth

https://console.cloud.google.com/ → 你的專案 → 憑證

在「已授權的重新導向 URI」**添加**（不要刪除原有的）：
```
https://wp1141-omega.vercel.app/api/auth/callback/google
```

儲存。

#### 2. 更新 GitHub OAuth（如果有設定）

https://github.com/settings/developers → Echo app

在「Authorization callback URL」**添加**（換行分隔）：
```
http://localhost:3000/api/auth/callback/github
https://wp1141-omega.vercel.app/api/auth/callback/github
```

Update application。

#### 3. 更新 Vercel 環境變數

Vercel → Settings → Environment Variables

編輯 `NEXTAUTH_URL`，改為：
```
https://wp1141-omega.vercel.app
```

#### 4. 重新部署（重要！）

Deployments → 最新部署 → ... → Redeploy

等待完成。

---

## 📁 專案檔案

```
hw5/
├── README.md                  # 專案說明
├── package.json              # 依賴管理
├── prisma/schema.prisma      # 資料庫結構
├── src/                      # 原始碼
│   ├── app/                  # Next.js 路由
│   ├── components/           # React 元件
│   ├── lib/                  # 工具函數
│   └── hooks/                # 自訂 Hooks
└── public/                   # 靜態資源
```

---


**© 2025 Echo Project - Web Programming Course**

如有問題請查看瀏覽器 Console 或 Vercel Runtime Logs。
