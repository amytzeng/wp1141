# 🔧 解決 Google 登入「沒有權限」錯誤

## 問題原因

Google OAuth 應用程式預設是「測試模式」，只有被加入測試使用者名單的帳號才能登入。

---

## ✅ 解決方法（3 選 1）

### 方法 1：加入測試使用者（最快）

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案（Echo）
3. 左側選單：**APIs & Services** → **OAuth consent screen**
4. 在 **Test users** 區塊，點擊 **+ ADD USERS**
5. 輸入你要登入的 **Google 帳號 email**
6. 點擊 **SAVE**
7. 重新嘗試登入

✅ **適合：** 開發測試階段，只有少數人使用

---

### 方法 2：發布應用程式（推薦給正式環境）

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的專案
3. 左側選單：**APIs & Services** → **OAuth consent screen**
4. 點擊 **PUBLISH APP** 按鈕
5. 確認發布

⚠️ **注意：**
- 如果應用程式使用了敏感權限，需要經過 Google 審核（可能需要數天）
- 目前 Echo 只要求基本資料（email, profile），通常不需要審核
- 發布後任何 Google 帳號都可以登入

✅ **適合：** 正式上線、公開使用

---

### 方法 3：使用內部應用程式類型

1. 前往 **OAuth consent screen**
2. 將 **User Type** 改為 **Internal**
3. 點擊 **SAVE**

⚠️ **限制：** 只適用於 Google Workspace 組織內部使用

---

## 📸 操作截圖參考

### 加入測試使用者的位置：

```
OAuth consent screen 頁面
├── App information
├── App domain  
├── Authorized domains
└── Test users  ← 點擊這裡的 + ADD USERS
```

---

## 🔍 確認設定

登入後應該會看到：

1. **測試使用者列表** 顯示你的 email
2. 或者 **Publishing status** 顯示為 "In production"

---

## 💡 開發建議

**開發階段：**
- 使用「方法 1」加入測試使用者
- 可以加入多個開發團隊成員

**上線前：**
- 使用「方法 2」發布應用程式
- 確保所有功能正常運作

---

## ❓ 其他可能的錯誤

如果加入測試使用者後仍然無法登入，請檢查：

1. **redirect_uri 是否正確**
   - 應該是：`http://localhost:3000/api/auth/callback/google`
   - 檢查位置：Credentials → OAuth 2.0 Client IDs → Authorized redirect URIs

2. **環境變數是否正確**
   ```bash
   # .env
   GOOGLE_CLIENT_ID="你的 Client ID"
   GOOGLE_CLIENT_SECRET="你的 Client Secret"
   ```

3. **重新啟動開發伺服器**
   ```bash
   npm run dev
   ```

---

## 🎯 快速解決（90秒）

```
1. 打開 Google Cloud Console
2. OAuth consent screen
3. Test users → + ADD USERS
4. 輸入你的 Gmail
5. SAVE
6. 重新登入
```

搞定！🎉

