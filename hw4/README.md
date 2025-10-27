# My MapBook - 地圖功能導向全端應用

一個基於 React + Node.js + Google Maps API 的地點管理系統，讓使用者可以在地圖上標記、管理自己的地點收藏。

**以下是作者的話：**

在註冊帳號並登入以後，使用者可以在這個地圖上新增地點並為他們分類、修改內容等。直接在地圖上點選想收藏的地點，就會出現紅色的標誌，同時可以新增關於這個地點的資訊，包含名稱、說明、標籤（分類）等，簡單來說就是實作了一個簡單但符合作業要求的功能。

由於這次作業要寫全端，前後端如果沒串好會跑不起來，所以我也做了一個測試網站 `test-simple-react.html`，開啟以後可以看前後端的狀況並測試，沒辦法正常開啟時就會知道是哪裡出問題。（下面也有詳細說明）

以下是 cursor 同學的話（經作者修改過後）：

## 📑 文件導覽

本文件包含以下章節：
1. [功能特色](#-功能特色) - 專案功能與特色介紹
2. [安裝與啟動](#-安裝與啟動) - 環境安裝與服務啟動指南
3. [專案架構](#-專案架構) - 目錄結構與檔案說明
4. [使用說明](#-使用說明) - 詳細的功能使用教學
5. [測試工具](#-測試工具) - test-simple-react.html 測試頁面使用說明
6. [技術棧](#-技術棧) - 前後端技術棧說明
7. [API 文檔](#-api-文檔) - 後端 API 端點說明

---

# ✨ 功能特色

- ✅ **使用者認證系統** - 註冊/登入/登出功能
- ✅ **互動式地圖** - 基於 Google Maps API 的地圖顯示與操作
- ✅ **地點管理** - 在地圖上新增、編輯、刪除地點標記
- ✅ **地點清單** - 以清單形式檢視和管理所有地點
- ✅ **分類系統** - 為地點設定不同分類標籤
- ✅ **響應式設計** - 支援桌面和行動裝置
- ✅ **JWT 認證** - 安全的身份驗證機制
- ✅ **Geocoding API** - 地址轉座標與座標轉地址

---

# 🚀 安裝與啟動

## 前置需求
- Node.js 18+
- npm 或 yarn
- Google Maps API Key（詳見下方設定說明）

## 1. 安裝依賴套件

**後端依賴安裝：**
```bash
cd backend
npm install
```

**前端依賴安裝：**
```bash
cd frontend
npm install
```

### 環境變數設定：

**後端** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
FRONTEND_URL=http://localhost:5173
```

**前端** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 2. 啟動服務

**啟動後端：**
```bash
cd backend
npm run dev
```
後端將在 http://localhost:3001 運行

**啟動前端：**
```bash
# 開啟新的終端機
cd frontend
npm run dev
```
前端將在 http://localhost:5173 運行

---

# 🏗️ 專案架構

## 目錄結構

```
hw4/
├── README.md                    # 專案主要說明文件（本文件）
├── test-simple-react.html       # 整合測試工具頁面
├── backend/                     # 後端專案
│   ├── .env.example            # 後端環境變數範例
│   ├── .env                    # 後端環境變數（不提交）
│   ├── .gitignore              # Git 忽略清單
│   ├── package.json            # 後端依賴套件
│   ├── tsconfig.json           # TypeScript 配置
│   ├── prisma/                 # 資料庫 Schema
│   │   └── schema.prisma      # Prisma 資料模型
│   └── src/                    # 後端原始碼
│       ├── app.ts              # Express 應用程式入口
│       ├── db/                 # 資料庫連線
│       ├── middleware/         # 中間件（認證、錯誤處理）
│       ├── controllers/        # 控制器（業務邏輯）
│       ├── routes/             # 路由定義
│       └── types/              # TypeScript 類型定義
└── frontend/                    # 前端專案
    ├── .env.example            # 前端環境變數範例
    ├── .env                    # 前端環境變數（不提交）
    ├── .gitignore              # Git 忽略清單
    ├── package.json            # 前端依賴套件
    ├── tsconfig.json           # TypeScript 配置
    ├── vite.config.ts          # Vite 配置
    ├── tailwind.config.js      # TailwindCSS 配置
    ├── index.html              # HTML 入口
    └── src/                    # 前端原始碼
        ├── main.tsx            # React 應用程式入口
        ├── App.tsx             # 主應用組件
        ├── pages/              # 頁面組件
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   ├── MapPage.tsx
        │   └── PlacesPage.tsx
        ├── components/         # 可重用組件
        │   ├── MapView.tsx
        │   └── PlaceForm.tsx
        ├── api/                # API 呼叫
        │   ├── client.ts
        │   ├── auth.ts
        │   ├── places.ts
        │   └── maps.ts
        ├── contexts/           # React Context
        │   └── AuthContext.tsx
        ├── types/              # TypeScript 類型定義
        │   └── index.ts
        └── index.css           # 全域樣式
```

## 檔案說明

### 根目錄檔案
| 檔案名稱 | 說明 |
|---------|------|
| `README.md` | 專案主要說明文件，包含安裝、設定、使用說明 |
| `test-simple-react.html` | 整合測試工具頁面 |

### 後端核心檔案
| 檔案/目錄 | 說明 |
|----------|------|
| `src/app.ts` | Express 應用程式主檔案，設定中間件和路由 |
| `src/db/client.ts` | Prisma Client 實例化 |
| `src/middleware/auth.ts` | JWT 認證中間件 |
| `src/controllers/` | 業務邏輯處理（authController, placeController, mapsController） |
| `src/routes/` | API 路由定義（authRoutes, placeRoutes, mapsRoutes） |
| `prisma/schema.prisma` | 資料庫 Schema 定義 |

### 前端核心檔案
| 檔案/目錄 | 說明 |
|----------|------|
| `src/App.tsx` | React 主應用組件和路由配置 |
| `src/pages/` | 各個頁面組件（Login, Signup, Map, Places） |
| `src/components/` | 可重用組件（MapView, PlaceForm） |
| `src/api/` | API 呼叫封裝 |
| `src/contexts/` | React Context（認證狀態管理） |

---

# 🌐 使用說明

1. **打開瀏覽器**
   http://localhost:5173

2. **註冊帳號**
   - 點擊「立即註冊」按鈕
   - 填寫電子郵件（例如：test@example.com）
   - 設置密碼（至少 6 個字符）
   - 點擊「註冊」

3. **開始使用地圖**
   註冊成功後，您將看到：
   - Google Maps 地圖
   - 可以在地圖上點擊新增地點標記
   - 可以編輯或刪除地點
   - 查看地點清單

## 主要功能

### 🗺️ 新增地點

**方法 1: 在地圖上點擊（最簡單）**
1. 點擊地圖上的任意位置
2. 會彈出「新增地點」表單
3. 填寫資訊：
   - **名稱**：地點的名稱（必填）
   - **描述**：詳細說明（選填）
   - **分類**：如「餐廳」、「景點」、「學校」等（選填）
4. 點擊「儲存」完成新增

**方法 2: 透過地點清單**
1. 點擊右上角「地點清單」按鈕
2. 在清單頁面點擊「新增地點」
3. 填寫地點資訊
4. 點擊「儲存」

### ✏️ 編輯地點
1. 點擊地圖上的標記（紅色圓點）
2. 選擇 「編輯」按鈕
3. 修改資訊
4. 點擊「儲存」

### 🗑️ 刪除地點
1. 點擊地圖上的標記
2. 選擇「刪除」按鈕
3. 確認刪除

### 📋 查看所有地點
1. 點擊右上角「地點清單」按鈕
2. 瀏覽所有已保存的地點
3. 可以：
   - 點擊地點名稱查看詳情
   - 點擊「編輯」修改地點
   - 點擊「刪除」刪除地點

### 🧭 地圖操作
- **拖曳**：移動地圖視角
- **滾輪**：縮放地圖
- **點擊**：新增地點
- **點擊標記**：查看/編輯地點

---

# 🧪 測試工具

## test-simple-react.html 使用說明

`test-simple-react.html` 是一個獨立的測試工具頁面，用於快速診斷和測試地圖應用程式的運行狀態。

### 主要功能
- ✅ **檢查後端服務** - 手動檢查後端服務狀態
- ✅ **快速開啟前端應用** - 一鍵開啟主要應用程式
- ✅ **功能測試清單** - 列出應測試的功能項目
- ✅ **錯誤診斷協助** - 提供詳細的錯誤排查步驟

### 使用方式：直接開啟
```bash
open test-simple-react.html
```

### 測試步驟

1. **確認服務狀態**
   - 頁面會提示「這是安全限制」（正常現象）
   - 直接進行下一步

2. **手動檢查後端**
   - 點擊「檢查後端服務」按鈕
   - 應該在新分頁中看到 JSON 回應：`{"status":"ok",...}`

3. **打開前端應用**
   - 點擊「打開前端應用」按鈕
   - 應該看到登入/註冊頁面

4. **測試前端功能**
   - 註冊/登入帳號
   - 點擊地圖新增地點
   - 編輯或刪除地點
   - 查看地點清單
   - **如果這些功能都正常，代表服務運行正常！**

5. **檢查瀏覽器控制台**（如果需要）
   - 按 `F12` 打開開發者工具
   - 查看 Console 標籤
   - 複製錯誤訊息以便排查

### 故障排除

#### 後端無法連接
- 確認後端服務正在運行：`cd hw4/backend && npm run dev`
- 確認端口 3001 沒有被占用
- 查看終端機中的錯誤訊息

#### 前端應用無法開啟
- 確認前端服務正在運行：`cd hw4/frontend && npm run dev`
- 嘗試強制重新整理頁面：`Cmd + Shift + R` (Mac)
- 檢查瀏覽器控制台的錯誤訊息

---

# 🛠️ 技術棧

## 前端
- **React 18** + **TypeScript** - 現代化前端框架
- **Vite** - 快速建置工具
- **TailwindCSS** - 實用優先的 CSS 框架
- **React Router** - 前端路由管理
- **Axios** - HTTP 客戶端
- **Google Maps JavaScript API** - 地圖功能
- **Lucide React** - 現代化圖示庫
- **React Hot Toast** - 通知系統

## 後端
- **Node.js** + **Express** + **TypeScript** - 後端框架
- **SQLite** + **Prisma ORM** - 資料庫與 ORM
- **JWT** - 身份驗證
- **bcryptjs** - 密碼加密
- **Helmet** - 安全中介軟體
- **CORS** - 跨域資源共享
- **Express Rate Limit** - 速率限制

---

# 📚 API 文檔

## 認證相關
- `POST /api/auth/register` - 註冊新帳號
- `POST /api/auth/login` - 登入

## 地點管理
- `GET /api/places` - 取得使用者所有地點
- `POST /api/places` - 新增地點
- `PUT /api/places/:id` - 更新地點
- `DELETE /api/places/:id` - 刪除地點

## Google Maps 整合
- `GET /api/maps/geocode?address=xxx` - 地址轉座標
- `GET /api/maps/reverse-geocode?lat=x&lng=y` - 座標轉地址

---

## 總結
1. ✅ **功能完整性**：所有要求項目均已實作
2. ✅ **安全性**：密碼雜湊、JWT 認證、權限控管完整
3. ✅ **資料持久化**：使用 SQLite 資料庫，資料不會遺失
4. ✅ **技術棧**：符合現代化全端開發標準
5. ✅ **使用者體驗**：自動回填地址、卡片式展示
6. ✅ **文件完整性**：README 等文件齊全

---

## 📄 License

MIT