# 🎯 最終啟動步驟

## ⚠️ 重要：請按照以下步驟操作

### 第一步：清理所有進程

在終端執行：
```bash
pkill -f "nodemon"
pkill -f "vite"
sleep 2
```

### 第二步：啟動後端

```bash
cd hw4/backend
npm run dev
```

**等待看到以下訊息**：
```
Server is running on port 5000
```

### 第三步：啟動前端（新終端視窗）

打開**新的終端視窗**：

```bash
cd hw4/frontend
npm run dev
```

**等待看到以下訊息**：
```
Local:   http://localhost:5173/
```

### 第四步：訪問應用

在瀏覽器打開：**http://localhost:5173**

## 🔍 如果還是空白

### 檢查項目

1. **確認後端運行**
   ```bash
   curl http://localhost:5000/health
   ```
   應該返回：`{"status":"ok",...}`

2. **確認前端運行**
   ```bash
   ps aux | grep vite
   ```
   應該看到 vite 進程

3. **檢查瀏覽器控制台**
   - 按 `F12` 打開開發者工具
   - 切換到 "Console" 標籤
   - 查看是否有紅色錯誤訊息

### 可能的問題

#### 問題 1：後端沒有啟動
**解決方法**：
```bash
cd backend
npx prisma generate
npm run dev
```

#### 問題 2：前端無法連接後端
**檢查**：
- 打開瀏覽器開發者工具（F12）
- 查看 Console 錯誤
- 查看 Network 標籤的請求

#### 問題 3：Google Maps 無法載入
**確認**：
- `.env` 檔案中的 Google Maps API Key 已正確設定
- API Key 在 Google Cloud Console 已啟用必要服務

## 🆘 需要幫助？

請提供以下資訊：

1. 瀏覽器 Console 的完整錯誤訊息
2. 後端終端機的輸出
3. 前端終端機的輸出
4. Network 標籤顯示的錯誤請求

## ✅ 正常運作時

您應該看到：
1. 登入頁面（藍色漸層背景）
2. 有「登入」和「註冊」按鈕
3. 可以點擊「立即註冊」註冊新帳號
