# 故障排除指南

## 常見問題

### 1. 前端顯示空白頁面

**可能原因：**
- 前端未正確啟動
- 瀏覽器控制台有錯誤

**解決方法：**
1. 檢查前端是否在運行：
   ```bash
   ps aux | grep vite
   ```

2. 檢查瀏覽器控制台錯誤（F12 → Console）

3. 重新啟動前端：
   ```bash
   cd frontend
   npm run dev
   ```

### 2. 後端無法啟動

**錯誤訊息：** `Cannot find module '../../node_modules/.prisma/client'`

**解決方法：**
```bash
cd backend
npx prisma generate
npm run dev
```

### 3. 後端顯示空白 / 無響應

**檢查步驟：**
1. 確認後端正在運行：
   ```bash
   curl http://localhost:5000/health
   ```

2. 檢查後端日誌：
   ```bash
   tail -f /tmp/backend.log
   ```

3. 確認資料庫已建立：
   ```bash
   ls backend/dev.db
   ```

4. 重新初始化資料庫：
   ```bash
   cd backend
   rm dev.db
   npx prisma migrate dev
   ```

### 4. Google Maps 無法顯示

**可能原因：**
- API Key 未正確設定
- API Key 無效或被限制

**解決方法：**
1. 確認 API Key 正確填寫：
   ```bash
   cat backend/.env | grep GOOGLE
   cat frontend/.env | grep GOOGLE
   ```

2. 確認 Google Cloud Console 已啟用：
   - Maps JavaScript API
   - Geocoding API

3. 檢查瀏覽器控制台的錯誤訊息

### 5. 登入後還是空白

**可能原因：**
- React Router 路由問題
- Context 提供者問題

**解決方法：**
1. 檢查瀏覽器 Console 錯誤
2. 清除瀏覽器 localStorage：
   ```javascript
   localStorage.clear()
   ```
3. 重新載入頁面

## 完整重設步驟

如果以上方法都無法解決，請執行完整重設：

```bash
# 1. 停止所有進程
pkill -f "nodemon"
pkill -f "vite"

# 2. 清除後端資料庫
cd backend
rm -f dev.db
npx prisma migrate dev

# 3. 重新生成 Prisma Client
npx prisma generate

# 4. 重新安裝依賴（如果需要）
cd ../frontend
npm install

# 5. 啟動服務
cd ../backend && npm run dev &
cd ../frontend && npm run dev &
```

## 測試頁面

如果 React 應用無法正常載入，可以測試簡單的 HTML 頁面：

1. 在瀏覽器開啟：
   ```
   http://localhost:5173/src/test.html
   ```

2. 測試後端連線（點擊按鈕）

## 聯繫支援

如果問題仍然存在，請提供：
1. 瀏覽器控制台錯誤訊息
2. 後端終端機輸出
3. 執行的具體步驟
