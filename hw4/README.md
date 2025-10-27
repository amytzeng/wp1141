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

### 目錄結構

```
hw4/
├── README.md                    # 專案主要說明文件
├── CHECKLIST.md                 # 專案檢查清單
├── TEST_PAGE_README.md          # 測試頁面使用說明
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

### 核心檔案說明

#### 根目錄檔案
| 檔案名稱 | 說明 |
|---------|------|
| `README.md` | 專案主要說明文件，包含安裝、設定、使用說明 |
| `CHECKLIST.md` | 專案檢查清單，驗證是否符合所有要求 |
| `TEST_PAGE_README.md` | 測試頁面使用說明 |
| `test-simple-react.html` | 整合測試工具頁面 |

#### 後端核心檔案
| 檔案/目錄 | 說明 |
|----------|------|
| `src/app.ts` | Express 應用程式主檔案，設定中間件和路由 |
| `src/db/client.ts` | Prisma Client 實例化 |
| `src/middleware/auth.ts` | JWT 認證中間件 |
| `src/controllers/` | 業務邏輯處理（authController, placeController, mapsController） |
| `src/routes/` | API 路由定義（authRoutes, placeRoutes, mapsRoutes） |
| `prisma/schema.prisma` | 資料庫 Schema 定義 |

#### 前端核心檔案
| 檔案/目錄 | 說明 |
|----------|------|
| `src/App.tsx` | React 主應用組件和路由配置 |
| `src/pages/` | 各個頁面組件（Login, Signup, Map, Places） |
| `src/components/` | 可重用組件（MapView, PlaceForm） |
| `src/api/` | API 呼叫封裝 |
| `src/contexts/` | React Context（認證狀態管理） |

## 🚀 安裝與啟動

### 前置需求
- Node.js 18+
- npm 或 yarn
- Google Maps API Key（詳見下方設定說明）

### 1. 安裝依賴套件

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

### 2. Google Maps API Key 設定

#### 獲取 API Key 步驟：

1. **前往 Google Cloud Console**
   - 開啟 https://console.cloud.google.com/
   - 登入你的 Google 帳號

2. **建立或選擇專案**
   - 點擊左上角「專案」下拉選單
   - 選擇現有專案或點擊「新增專案」
   - 為新專案命名（例如：my-mapbook）

3. **啟用所需 API**
   - 在左側選單找到「API 和服務」→「程式庫」
   - 搜尋並啟用以下 API：
     - **Maps JavaScript API** (必須)
     - **Geocoding API** (必須)
   - 等待啟用完成（通常幾秒鐘）

4. **建立 API Key**
   - 前往「API 和服務」→「憑證」
   - 點擊上方「建立憑證」→「API 金鑰」
   - 複製生成的 API Key（格式類似：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`）

5. **設定 API Key 限制（強烈建議）**
   - 點擊剛建立的 API Key
   - **應用程式限制**：選擇「HTTP 參照網址」
   - 新增以下網址：
     - `localhost:5173`
     - `http://localhost:5173`
   - **API 限制**：選擇「限制金鑰」
   - 勾選以下 API：
     - Maps JavaScript API
     - Geocoding API
   - 點擊「儲存」

#### 環境變數設定：

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

> **⚠️ 重要提醒**：兩邊都需要 `.env` 和 `.env.example` 檔案！`.env` 不要提交到 Git。

### 3. 啟動服務

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

### 4. 使用測試頁面（可選）

開啟整合測試工具頁面：
```bash
open test-simple-react.html
```

測試頁面功能：
- 自動檢查後端服務狀態
- 手動測試 API 連接
- 快速開啟前端應用
- 查看系統資訊

詳細使用說明請參考 `TEST_PAGE_README.md`

## 🌐 使用說明

### 首次使用步驟

1. **打開瀏覽器**
   訪問：http://localhost:5173

2. **註冊帳號**
   - 點擊「立即註冊」按鈕
   - 填寫電子郵件（例如：test@example.com）
   - 設置密碼（至少6個字符）
   - 點擊「註冊」

3. **開始使用地圖**
   註冊成功後，您將看到：
   - Google Maps 地圖
   - 可以在地圖上點擊新增地點標記
   - 可以編輯或刪除地點
   - 查看地點清單

### 主要功能操作

#### 🗺️ 新增地點

**方法 1: 在地圖上點擊（最簡單）**
1. **點擊地圖上的任意位置**
2. 會彈出「新增地點」表單
3. **填寫資訊**：
   - **名稱**：地點的名稱（必填）
   - **描述**：詳細說明（選填）
   - **分類**：如「餐廳」、「景點」、「學校」等（選填）
4. **點擊「儲存」** 完成新增

**方法 2: 透過地點清單**
1. 點擊右上角 **「地點清單」** 按鈕
2. 在清單頁面點擊 **「新增地點」**
3. 填寫地點資訊
4. 點擊「儲存」

#### ✏️ 編輯地點
1. **點擊地圖上的標記**（紅色圓點）
2. 選擇 **「編輯」** 按鈕
3. 修改資訊
4. 點擊 **「儲存」**

#### 🗑️ 刪除地點
1. **點擊地圖上的標記**
2. 選擇 **「刪除」** 按鈕
3. 確認刪除

#### 📋 查看所有地點
1. 點擊右上角 **「地點清單」** 按鈕
2. 瀏覽所有已保存的地點
3. 可以：
   - 點擊地點名稱查看詳情
   - 點擊「編輯」修改地點
   - 點擊「刪除」刪除地點

#### 🧭 地圖操作
- **拖曳**：移動地圖視角
- **滾輪**：縮放地圖
- **點擊**：新增地點
- **點擊標記**：查看/編輯地點

### 使用技巧

#### 分類建議
- 🍴 餐廳
- 🏛️ 景點
- 🏫 學校
- 🏥 醫院
- 🏪 商店
- 🏠 住家
- 🎮 娛樂
- 🚗 交通

#### 地點描述建議
寫清楚為什麼保存這個地點，例如：
- 「最好吃的義大利餐廳」
- 「風景優美的觀景台」
- 「朋友推薦的咖啡廳」

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

## 🔄 資料流程

1. 使用者操作 → 前端組件
2. 前端組件 → API 呼叫 (Axios)
3. API 呼叫 → 後端路由
4. 後端路由 → 控制器
5. 控制器 → 資料庫 (Prisma)
6. 資料庫回應 → 控制器 → 前端
7. 前端更新 UI

## 🎯 重要配置

- **後端端口**：3001
- **前端端口**：5173
- **資料庫**：SQLite (dev.db)
- **JWT 有效期**：7天
- **CORS 允許**：http://localhost:5173

## 🔧 開發說明

本專案採用前後端分離架構，前端負責使用者介面與互動，後端提供 RESTful API 服務。所有地圖相關功能透過 Google Maps JavaScript API 實作，並與後端 API 緊密整合。

### 主要功能流程：
1. 使用者註冊/登入後獲得 JWT token
2. 前端攜帶 token 向後端請求地點資料
3. 在地圖上顯示所有地點標記
4. 點擊地圖可以新增地點，點擊標記可以編輯/刪除
5. 所有操作都會同步更新到資料庫

## 📄 其他文件

- **CHECKLIST.md** - 專案檢查清單，驗證是否符合所有要求
- **TEST_PAGE_README.md** - 測試頁面詳細使用說明

## 📄 License

MIT