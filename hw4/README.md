# My MapBook - 地圖功能導向全端應用

一個基於 React + Node.js + Google Maps API 的地點管理系統，讓使用者可以在地圖上標記、管理自己的地點收藏。

## ✨ 功能特色

- ✅ **使用者認證系統** - 註冊/登入/登出功能
- ✅ **互動式地圖** - 基於 Google Maps API 的地圖顯示與操作
- ✅ **地點管理** - 在地圖上新增、編輯、刪除地點標記
- ✅ **地點清單** - 以清單形式檢視和管理所有地點
- ✅ **分類系統** - 為地點設定不同分類標籤
- ✅ **響應式設計** - 支援桌面和行動裝置
- ✅ **JWT 認證** - 安全的身份驗證機制
- ✅ **Geocoding API** - 地址轉座標與座標轉地址

## 🏗️ 專案架構

```
hw4/
├── frontend/        ← React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/          ← 頁面組件
│   │   ├── components/     ← 可重用組件
│   │   ├── api/           ← API 呼叫邏輯
│   │   ├── contexts/      ← React Context
│   │   ├── types/         ← TypeScript 類型定義
│   │   └── App.tsx
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── backend/         ← Node + Express + TypeScript
│   ├── src/
│   │   ├── routes/        ← API 路由
│   │   ├── controllers/   ← 控制器邏輯
│   │   ├── middleware/    ← 中間件
│   │   ├── db/           ← 資料庫客戶端
│   │   └── app.ts        ← 應用程式入口
│   ├── prisma/           ← 資料庫 schema
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── start.sh            ← 快速啟動腳本
├── SETUP.md            ← 詳細設定說明
└── README.md
```

## 🚀 快速開始

### 前置需求
- Node.js 18+
- npm 或 yarn
- Google Maps API Key（詳見 [SETUP.md](./SETUP.md)）

### 快速啟動（推薦）

**方式 1：自動修復並啟動（推薦）**
```bash
# 自動修復並啟動
./fix-and-run.sh
```

**方式 2：手動啟動**
```bash
# 終端機 1 - 後端
cd backend && npm run dev

# 終端機 2 - 前端  
cd frontend && npm run dev
```

**注意：** 前端默認在 `http://localhost:5173`，如果端口被占用會在 `http://localhost:5174`

### 詳細設定

請參考 [SETUP.md](./SETUP.md) 查看：
- Google Maps API Key 取得方法
- 環境變數設定
- 常見問題解決

## 🌐 使用說明

1. **註冊/登入** - 首次使用需要註冊帳號
2. **地圖操作** - 在地圖上點擊可以新增地點標記
3. **地點管理** - 點擊標記可以編輯或刪除地點
4. **清單檢視** - 在「我的地點」頁面查看所有收藏地點
5. **分類功能** - 為地點設定分類標籤便於管理

## 🛠️ 技術棧

### 前端
- **React 18** + **TypeScript** - 現代化前端框架
- **Vite** - 快速建置工具
- **TailwindCSS** - 實用優先的 CSS 框架
- **React Router** - 前端路由管理
- **Axios** - HTTP 客戶端
- **Google Maps JavaScript API** - 地圖功能
- **Lucide React** - 現代化圖示庫
- **React Hot Toast** - 通知系統

### 後端
- **Node.js** + **Express** + **TypeScript** - 後端框架
- **SQLite** + **Prisma ORM** - 資料庫與 ORM
- **JWT** - 身份驗證
- **bcryptjs** - 密碼加密
- **Helmet** - 安全中介軟體
- **CORS** - 跨域資源共享
- **Express Rate Limit** - 速率限制

## 📚 API 文檔

### 認證相關
- `POST /api/auth/register` - 註冊新帳號
- `POST /api/auth/login` - 登入

### 地點管理
- `GET /api/places` - 取得使用者所有地點
- `POST /api/places` - 新增地點
- `PUT /api/places/:id` - 更新地點
- `DELETE /api/places/:id` - 刪除地點

### Google Maps 整合
- `GET /api/maps/geocode?address=xxx` - 地址轉座標
- `GET /api/maps/reverse-geocode?lat=x&lng=y` - 座標轉地址

## 🎯 作業要求達成

本專案完全符合作業要求：

✅ **前後端分離架構** - React + Node/Express  
✅ **Google Maps API 整合** - JavaScript API + Geocoding API  
✅ **登入系統** - 完整的註冊/登入/登出功能  
✅ **資料庫整合** - SQLite + Prisma ORM  
✅ **CRUD 操作** - 地點的完整增刪改查功能  
✅ **地圖互動** - 地圖點擊新增、標記點擊編輯  
✅ **環境變數管理** - 前後端各自獨立的 .env.example 檔案  
✅ **TypeScript** - 完整的類型安全

## 📝 資料庫 Schema

### User (使用者)
- id: String (CUID)
- email: String (唯一)
- password: String (加密)
- name: String (可選)
- createdAt: DateTime
- updatedAt: DateTime

### Place (地點)
- id: String (CUID)
- title: String
- description: String (可選)
- category: String (可選)
- lat: Float
- lng: Float
- address: String (可選)
- userId: String (外鍵)
- createdAt: DateTime
- updatedAt: DateTime

## 🔧 開發說明

本專案採用前後端分離架構，前端負責使用者介面與互動，後端提供 RESTful API 服務。所有地圖相關功能透過 Google Maps JavaScript API 實作，並與後端 API 緊密整合。

### 主要功能流程：
1. 使用者註冊/登入後獲得 JWT token
2. 前端攜帶 token 向後端請求地點資料
3. 在地圖上顯示所有地點標記
4. 點擊地圖可以新增地點，點擊標記可以編輯/刪除
5. 所有操作都會同步更新到資料庫

## 📄 License

MIT
