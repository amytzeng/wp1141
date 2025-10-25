# 快速設定指南

## 問題修復

### 已修復的問題

1. ✅ **後端 Prisma Client 導入錯誤**
   - 使用相對路徑：`import { PrismaClient } from '../../node_modules/.prisma/client'`
   - 確保 `@prisma/client` 在 dependencies 而非 devDependencies

2. ✅ **前端 Tailwind CSS 配置錯誤**
   - 安裝了 `@tailwindcss/postcss` 套件
   - 更新 `postcss.config.js` 使用 `'@tailwindcss/postcss'` 而非 `'tailwindcss'`

## 獲取 Google Maps API Key

### 步驟詳解

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

6. **填入專案**
   - 編輯 `backend/.env`，填入：
     ```env
     GOOGLE_MAPS_API_KEY=你的API_Key_這裡
     ```
   - 編輯 `frontend/.env`，填入：
     ```env
     VITE_GOOGLE_MAPS_API_KEY=你的API_Key_這裡
     ```

### 免費額度

- Google Maps 每月提供 **$200 免費額度**
- 對於這個專案，足以應付數千次 API 呼叫
- 不需要擔心費用問題

## 啟動步驟

### 1. 確認環境變數

**後端** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=my_super_secret_jwt_key_12345_change_in_production
GOOGLE_MAPS_API_KEY=你的API_Key_這裡
FRONTEND_URL=http://localhost:5173
```

**前端** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=你的API_Key_這裡
```

### 2. 啟動後端

```bash
cd backend
npm run dev
```

後端應該在 http://localhost:5000 運行

### 3. 啟動前端

開啟新的終端機：

```bash
cd frontend
npm run dev
```

前端應該在 http://localhost:5173 運行

### 4. 使用應用

1. 開啟瀏覽器前往 http://localhost:5173
2. 註冊新帳號或登入
3. 在地圖上點擊新增地點
4. 查看地點清單

## 常見問題

### 後端無法啟動

檢查：
1. 資料庫是否已建立：`ls backend/dev.db`
2. Prisma Client 是否已生成：`cd backend && npx prisma generate`
3. 環境變數是否正確設定

### 前端 Tailwind 錯誤

如果仍有 Tailwind 錯誤：
```bash
cd frontend
npm install @tailwindcss/postcss
```

### Google Maps API 錯誤

確保：
1. 在 Google Cloud Console 啟用 Maps JavaScript API 和 Geocoding API
2. 正確填入 API Key 到 `.env` 檔案
3. 檢查 API Key 是否有適當的限制設定
