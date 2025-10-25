# 快速啟動指南

## ✅ 目前狀態

後端和前端都已正確配置並運行！

## 🚀 訪問網址

- **後端 API**: http://localhost:5000
- **前端應用**: http://localhost:5173 或 http://localhost:5174

## 📝 使用說明

### 1. 首次訪問

在瀏覽器打開前端網址（http://localhost:5173 或 http://localhost:5174）

### 2. 註冊新帳號

- 點擊「立即註冊」
- 填寫：
  - 姓名（可選）
  - 電子郵件
  - 密碼
- 點擊「註冊」

### 3. 使用地圖功能

- 註冊成功後會自動登入並顯示地圖
- **在地圖上點擊**可以新增地點標記
- **點擊標記**可以編輯或刪除地點
- 點擊右上角「地點清單」查看所有地點

### 4. 地點管理

- 新增地點：在地圖上點擊位置
- 編輯地點：點擊地圖上的標記，然後點擊「編輯」按鈕
- 刪除地點：在編輯表單中點擊「刪除」按鈕
- 查看清單：點擊右上角「地點清單」按鈕

## 🔧 如果遇到問題

### 前端空白頁面

1. 清除瀏覽器快取（Cmd+Shift+R 或 Ctrl+Shift+R）
2. 檢查瀏覽器控制台（F12 → Console）
3. 確認前端正在運行：
   ```bash
   ps aux | grep vite
   ```

### 後端無法連接

1. 檢查後端是否運行：
   ```bash
   curl http://localhost:5000/health
   ```
2. 如果沒有運行，重啟後端：
   ```bash
   cd backend
   npm run dev
   ```

### TypeScript 錯誤

1. 清除前端快取：
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

## 🔄 重新啟動

如果需要重新啟動整個應用：

```bash
# 停止所有服務
pkill -f "nodemon"
pkill -f "vite"

# 重新啟動後端
cd backend && npm run dev &

# 重新啟動前端
cd frontend && npm run dev &
```

## 🎯 功能確認

系統應包含以下功能：

- ✅ 使用者註冊/登入
- ✅ Google Maps 地圖顯示
- ✅ 地圖點擊新增地點
- ✅ 地點標記編輯/刪除
- ✅ 地點清單檢視
- ✅ 地點分類標籤

如果任何功能無法正常運作，請檢查瀏覽器控制台錯誤訊息。
