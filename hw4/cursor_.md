# My MapBook - 開發記錄

## 專案概述

**主題**: 地圖功能導向全端應用  
**技術**: React + Node.js + Express + TypeScript + Google Maps API + SQLite

---

## 主要功能

- ✅ 使用者註冊/登入（JWT 認證）
- ✅ Google Maps 地圖顯示與互動
- ✅ 地點標記 CRUD 操作
- ✅ SQLite 資料庫儲存
- ✅ RESTful API 設計
- ✅ 環境變數管理

---

## 解決的主要問題

### 1. 後端 Prisma Client 導入
- 設定自定義輸出路徑：`output = "../src/generated/prisma"`
- 修正導入路徑為：`import { PrismaClient } from '../generated/prisma/client'`

### 2. 前端 Tailwind CSS
- 安裝 `@tailwindcss/postcss` 套件
- 更新 PostCSS 配置

### 3. 端口衝突
- 後端端口改為 3001（原本 5000 被 AirTunes 佔用）
- 更新前後端環境變數

### 4. TypeScript 類型錯誤
- 在 `backend/tsconfig.json` 設 `strict: false`
- 完善 `AuthRequest` 接口定義

### 5. Vite 快取問題
- 清除 `node_modules/.vite` 目錄重新啟動

---

## 檔案結構

```
hw4/
├── backend/
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── controllers/  # 業務邏輯
│   │   ├── middleware/   # 認證中間件
│   │   ├── db/          # Prisma Client
│   │   └── app.ts       # Express 應用
│   ├── prisma/schema.prisma
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/        # Login, Signup, Map, Places
    │   ├── components/   # MapView, PlaceForm
    │   ├── api/         # API 呼叫
    │   ├── contexts/    # AuthContext
    │   └── types/       # TypeScript 類型
    └── .env
```

---

## 啟動方式

### 後端
```bash
cd backend
npm run dev
```

### 前端
```bash
cd frontend
npm run dev
```

訪問: http://localhost:5173

---

## API 端點

- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/places` - 取得地點列表
- `POST /api/places` - 新增地點
- `PUT /api/places/:id` - 更新地點
- `DELETE /api/places/:id` - 刪除地點
- `GET /api/maps/geocode` - 地址轉座標
- `GET /api/maps/reverse-geocode` - 座標轉地址

---

## 技術棧

**前端**: React 18, TypeScript, Vite, TailwindCSS, React Router, Axios  
**後端**: Node.js, Express, TypeScript, Prisma ORM, SQLite  
**認證**: JWT, bcryptjs  
**地圖**: Google Maps JavaScript API, Geocoding API

---

## 學習重點

1. 前後端分離架構設計
2. RESTful API 實作
3. JWT 身份驗證機制
4. Prisma ORM 使用
5. Google Maps API 整合
6. TypeScript 類型安全
7. 環境變數管理
8. 錯誤處理與除錯
