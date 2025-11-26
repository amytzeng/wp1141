# LINE Rich Menu 設定指南

本文件說明如何設定 LINE Bot 的 Rich Menu（圖文選單）。

## ⚠️ 重要說明：為什麼必須使用 API 設定

**LINE Developers Console 的圖形介面無法設定 Postback 動作**

LINE Developers Console 的 Rich Menu 管理介面只支援基本的動作類型（如「傳送訊息」、「開啟網頁」等），但**不支援 Postback 動作類型**。

Postback 動作是實現按鈕觸發特定功能的關鍵，要設定 Postback 動作，必須透過 Messaging API 來完成。這就是為什麼我們實作了 API 自動設定功能。

**解決方案：使用我們提供的 API 自動設定（完全不需要在 LINE Developers Console 手動操作）**

## 方法一：使用程式自動設定（推薦且必須）

這是**唯一正確的方式**來設定包含 Postback 動作的 Rich Menu。

### 步驟 1：生成 Rich Menu 圖片

#### 選項 A：使用 HTML 產生器（推薦）

1. 在瀏覽器中開啟 `public/rich-menu-generator.html`
2. 點擊「下載完整大圖」按鈕下載完整的 Rich Menu 圖片
3. 或點擊「下載六張按鈕圖片」分別下載每個按鈕的獨立圖片
4. 將完整的圖片儲存為 `public/rich-menu.png`

**圖片規格**：
- 尺寸：2500 x 1686 像素
- 佈局：3 列 x 2 行
- 按鈕尺寸：前兩列 833x843 像素，第三列 834x843 像素

#### 選項 B：使用 Python 腳本

1. 安裝 Pillow 套件：
```bash
pip install Pillow
```

2. 執行腳本生成圖片：
```bash
python3 scripts/generate-rich-menu-image.py
```

### 步驟 2：初始化 Rich Menu（透過 API 自動設定）

這個步驟會自動建立 Rich Menu、上傳圖片、設定按鈕區域和 Postback 動作，並設為預設選單。

#### 方法 A：透過 API Endpoint（推薦）

確保你的伺服器正在運行，然後執行：

```bash
curl -X POST http://localhost:3000/api/admin/rich-menu \
  -H "Content-Type: application/json" \
  -d '{"imagePath": "public/rich-menu.png"}'
```

或在瀏覽器中：
1. 開啟 Swagger UI（通常是 `http://localhost:3000/api/swagger-ui`）
2. 找到 `/api/admin/rich-menu` 端點
3. 點擊 POST 方法
4. 在 Request body 中輸入：
```json
{
  "imagePath": "public/rich-menu.png"
}
```
5. 點擊「Execute」執行

#### 方法 B：使用獨立腳本

```bash
# 設定環境變數
export LINE_CHANNEL_ACCESS_TOKEN="your-token"
export LINE_CHANNEL_SECRET="your-secret"
export MONGODB_URI="your-connection-string"

# 執行腳本
node -r ts-node/register scripts/init-rich-menu.ts public/rich-menu.png
```

### 步驟 3：驗證設定

執行以下命令檢查 Rich Menu 是否設定成功：

```bash
curl http://localhost:3000/api/admin/rich-menu
```

或在 Swagger UI 中執行 GET 請求，應該會看到：
- Rich Menu 列表
- 預設 Rich Menu ID
- 每個按鈕的配置資訊

### 步驟 4：測試

1. 打開 LINE 應用程式
2. 找到你的 Bot 並開啟對話
3. 檢查聊天室底部是否顯示 Rich Menu（可能需要重新啟動 LINE 應用程式）
4. 點擊各個按鈕測試功能：
   - 重點整理：應該會根據對話內容生成重點整理
   - 快速複習：應該會生成複習內容
   - 例題示範：應該會提供例題
   - 再解釋一次：應該會用不同方式重新解釋
   - 清除：應該會清除對話上下文
   - 幫助：應該會顯示幫助訊息

## Rich Menu 配置詳情

### 按鈕佈局（3 列 x 2 行）

```
┌─────────────┬─────────────┬─────────────┐
│  重點整理    │  快速複習    │  例題示範    │
│  (833x843)  │  (833x843)  │  (834x843)  │
├─────────────┼─────────────┼─────────────┤
│ 再解釋一次   │    清除     │    幫助     │
│  (833x843)  │  (833x843)  │  (834x843)  │
└─────────────┴─────────────┴─────────────┘
```

### 按鈕 Postback 資料

每個按鈕在點擊時會發送對應的 Postback 資料：

| 按鈕 | Postback 資料 | 功能說明 |
|------|--------------|----------|
| 重點整理 | `{"action": "summarize"}` | 根據對話內容生成重點整理 |
| 快速複習 | `{"action": "review"}` | 生成快速複習內容 |
| 例題示範 | `{"action": "example"}` | 提供相關例題 |
| 再解釋一次 | `{"action": "reexplain"}` | 用不同方式重新解釋 |
| 清除 | `{"action": "clear"}` | 清除對話上下文 |
| 幫助 | `{"action": "help"}` | 顯示幫助訊息 |

### 按鈕區域座標

以下是每個按鈕在圖片上的精確位置（用於 API 設定）：

| 按鈕 | X 座標 | Y 座標 | 寬度 | 高度 |
|------|--------|--------|------|------|
| 重點整理 | 0 | 0 | 833 | 843 |
| 快速複習 | 833 | 0 | 833 | 843 |
| 例題示範 | 1666 | 0 | 834 | 843 |
| 再解釋一次 | 0 | 843 | 833 | 843 |
| 清除 | 833 | 843 | 833 | 843 |
| 幫助 | 1666 | 843 | 834 | 843 |

**注意**：這些座標會由我們的 API 自動設定，你不需要手動配置。

## 常見問題

### Q: 為什麼在 LINE Developers Console 中找不到 Postback 選項？

A: LINE Developers Console 的圖形介面確實不支援 Postback 動作。要設定 Postback，必須透過 Messaging API。我們的 API 會自動處理所有設定，包括 Postback 動作。

### Q: 我可以透過 LINE Developers Console 手動設定嗎？

A: 不建議。LINE Developers Console 的圖形介面不支援 Postback 動作，即使你設定了 Rich Menu，按鈕也無法正確觸發功能。必須使用我們的 API 來自動設定。

### Q: Rich Menu 設定後多久會顯示？

A: 通常設定完成後，LINE 會立即更新。如果沒有立即顯示，可能需要：
1. 重新啟動 LINE 應用程式
2. 等待幾分鐘讓更新生效
3. 確認 Rich Menu 已設為預設選單

### Q: 如何確認 Postback 動作是否正確設定？

A: 可以透過以下方式確認：
1. 執行 `GET /api/admin/rich-menu` 查看 Rich Menu 配置
2. 檢查按鈕的 `action.data` 欄位是否包含正確的 JSON 資料
3. 點擊按鈕測試功能是否正常運作

### Q: 如果圖片上傳失敗怎麼辦？

A: 檢查以下事項：
1. 圖片尺寸是否為 2500 x 1686 像素
2. 圖片格式是否為 PNG 或 JPEG
3. 檔案大小是否小於 1MB
4. 圖片路徑是否正確

### Q: 如何更新 Rich Menu？

A: 再次執行初始化 API 即可。系統會自動刪除舊的預設 Rich Menu 並建立新的。

## 技術細節

### API 端點說明

- **POST `/api/admin/rich-menu`**: 初始化 Rich Menu
  - 會自動建立 Rich Menu 定義
  - 上傳圖片
  - 設定所有按鈕的 Postback 動作
  - 設為預設選單

- **GET `/api/admin/rich-menu`**: 查詢 Rich Menu 資訊
  - 返回所有 Rich Menu 列表
  - 顯示預設 Rich Menu ID

- **DELETE `/api/admin/rich-menu`**: 刪除 Rich Menu
  - 刪除當前的預設 Rich Menu

### Postback 事件處理

當使用者點擊 Rich Menu 按鈕時，LINE 會發送 Postback 事件到你的 Webhook。我們的系統會在 `lib/line/handler.ts` 中的 `handlePostbackEvent` 函數處理這些事件，並根據 `action` 類型執行對應的功能。

## 相關檔案

- Rich Menu 管理模組：`lib/line/rich-menu.ts`
- Postback 事件處理：`lib/line/handler.ts`
- 初始化 API：`app/api/admin/rich-menu/route.ts`
- 初始化腳本：`scripts/init-rich-menu.ts`
- 圖片生成腳本：`scripts/generate-rich-menu-image.py`
- HTML 圖片產生器：`public/rich-menu-generator.html`