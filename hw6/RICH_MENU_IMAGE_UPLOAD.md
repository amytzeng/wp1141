# Rich Menu 圖片上傳指南

## 目前的方式：放在伺服器檔案系統

根據目前的設計，Rich Menu 圖片需要放在**伺服器的檔案系統**中，然後由 API 讀取並上傳到 LINE。

### 圖片位置

圖片應該放在專案的 `public/` 目錄下：

```
your-project/
├── public/
│   └── rich-menu.png    ← 圖片放在這裡
├── app/
├── lib/
└── ...
```

### 上傳方式（根據你的環境）

#### 情況 1：本地開發環境

如果你的應用程式在本地運行：

1. **將圖片放到 `public/` 目錄**
   ```bash
   # 在專案根目錄
   cp /path/to/your/rich-menu.png public/rich-menu.png
   ```

2. **確認檔案存在**
   ```bash
   ls -lh public/rich-menu.png
   ```

3. **執行初始化**
   - 透過 Admin 頁面初始化
   - 或透過 API

#### 情況 2：部署環境（Vercel、Netlify 等）

如果你的應用程式部署在雲端平台：

**方法 A：透過 Git 上傳（推薦）**

1. **將圖片加入專案**
   ```bash
   # 在本地
   cp /path/to/your/rich-menu.png public/rich-menu.png
   git add public/rich-menu.png
   git commit -m "Add Rich Menu image"
   git push
   ```

2. **等待部署完成**
   - 平台會自動重新部署
   - 圖片會包含在部署中

3. **執行初始化**
   - 透過部署的 Admin 頁面初始化

**方法 B：透過 SSH/FTP 上傳**

如果你的伺服器支援檔案上傳：

1. **連接到伺服器**
   ```bash
   ssh user@your-server.com
   ```

2. **找到專案目錄**
   ```bash
   cd /path/to/your/project
   ```

3. **上傳圖片**
   ```bash
   # 使用 scp 或其他工具
   scp rich-menu.png user@your-server.com:/path/to/project/public/
   ```

**方法 C：透過部署平台的檔案管理**

某些平台（如 Railway、Render）提供檔案管理功能：

1. 登入平台控制台
2. 找到檔案管理或檔案瀏覽功能
3. 上傳圖片到 `public/` 目錄
4. 執行初始化

### 確認圖片已上傳

你可以透過以下方式確認圖片是否在正確位置：

1. **檢查檔案是否存在**
   - 在伺服器上：`ls public/rich-menu.png`
   - 透過網頁：訪問 `https://your-domain.com/rich-menu.png`（應該能看到圖片）

2. **檢查檔案大小**
   - 必須小於 1MB
   - 建議使用 PNG 格式

3. **檢查檔案尺寸**
   - 必須是 2500 x 1686 像素

### 如果找不到圖片

API 會自動搜尋以下位置：
- `public/rich-menu.png`
- `public/rich-menu.jpg`
- 你指定的路徑
- 專案根目錄下的相對路徑

如果都找不到，會建立沒有圖片的 Rich Menu（但按鈕仍可正常運作）。

## 改進方案：支援網頁上傳（可選）

如果你想要更便利的上傳方式，我可以為你實作一個檔案上傳功能，讓你可以直接透過 Admin 頁面上傳圖片。

這樣就不需要手動上傳到伺服器了。如果你需要這個功能，告訴我，我可以幫你實作。
