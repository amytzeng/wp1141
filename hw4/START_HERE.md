# 🚀 啟動指引

## 當前狀態

系統已完全配置好，現在只需要啟動服務。

## 📋 啟動步驟

### 1. 停止舊進程（如果需要）

```bash
pkill -f "nodemon"
pkill -f "vite"
```

### 2. 啟動後端

```bash
cd hw4/backend
npm run dev
```

保持這個終端視窗打開，後端運行在：**http://localhost:5000**

### 3. 啟動前端（新終端視窗）

打開新的終端視窗：

```bash
cd hw4/frontend
npm run dev
```

前端運行在：**http://localhost:5173** 或 **http://localhost:5174**

### 4. 開啟瀏覽器

打開瀏覽器，訪問：**http://localhost:5173** （或 5174）

## 🎯 使用應用

### 首次使用

1. **註冊帳號**
   - 點擊「立即註冊」
   - 填寫：
     - 姓名（可選）
     - 電子郵件
     - 密碼
   - 點擊「註冊」

2. **開始使用地圖**
   - 註冊成功後自動登入
   - 點擊地圖上的任意位置新增地點
   - 點擊地圖上的標記編輯或刪除地點
   - 點擊右上角「地點清單」查看所有地點

### 地點管理

- **新增地點**：在地圖上點擊
- **編輯地點**：點擊標記，然後點擊編輯按鈕
- **刪除地點**：在編輯表單中點擊刪除按鈕
- **查看清單**：點擊右上角「地點清單」按鈕

## ⚠️ 常見問題

### 後端無法啟動

```bash
cd backend
npx prisma generate
npm run dev
```

### 前端無法啟動

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### 瀏覽器顯示空白

1. 按 `Cmd+Shift+R`（Mac）或 `Ctrl+Shift+R`（Windows）強制重新整理
2. 按 `F12` 打開開發者工具查看錯誤

## ✅ 檢查服務

### 檢查後端

```bash
curl http://localhost:5000/health
```

應該返回：
```json
{"status":"ok","timestamp":"..."}
```

### 檢查前端

在瀏覽器訪問：http://localhost:5173

## 📚 更多資訊

- `README.md` - 專案說明
- `SETUP.md` - 環境設定
- `QUICKSTART.md` - 快速使用
- `TROUBLESHOOTING.md` - 故障排除

## 🎉 準備就緒！

按照以上步驟啟動服務後，就可以開始使用 My MapBook 了！
