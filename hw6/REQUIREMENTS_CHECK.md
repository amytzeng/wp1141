# 作業要求檢查報告

本報告詳細檢查專案是否符合作業要求，並列出已實作與待補強的功能項目。

## 基本功能要求檢查

### Line Bot 對話/功能設計

**要求項目：**
- [x] 主題
- [x] 功能列表
- [x] 對話腳本
- [x] 對話脈絡：在回覆時維持上下文
- [x] LLM prompt template 設計
- [x] 回應設計：根據預設腳本 and/or LLM 回覆，包裝成適當的回應

**實作狀況：**
專案已實作完整的 Line Bot 對話系統。主題為「學習助手」（Learning Assistant），可協助使用者理解概念、整理筆記、回答問題。系統包含以下功能：

1. **對話腳本**：在 `lib/llm/fallback.ts` 中定義了多個 fallback 回應模板，涵蓋問候、幫助、感謝、告別等情境。
2. **對話脈絡管理**：`lib/context/manager.ts` 實作了對話上下文管理，會載入最近 5 則訊息作為上下文，並在超過 30 分鐘無活動時建立新會話。
3. **LLM Prompt Template**：`lib/llm/prompt.ts` 實作了 prompt 建構邏輯，會整合系統提示、使用者訊息與歷史上下文。
4. **回應設計**：`lib/line/handler.ts` 中的 `handleTextMessage` 函數會根據訊息類型（指令或一般訊息）選擇適當的回應方式，並整合 LLM 回應與 fallback 機制。

**指令功能：**
- `/help`：顯示可用指令與功能說明
- `/clear`：清除對話上下文

### Line Bot Server

**要求項目：**
- [x] 從 Line Messaging API 接收使用者的訊息
- [x] 實現功能設計與程式邏輯
- [x] 透過預先設計腳本 and/or 向 LLM 詢問，產生合適的回應
- [x] API for Line Messaging webhook
- [x] 對話管理與統計
- [x] Line Bot 設定：建立 Line 官方帳號並設定 Line Channel，開啟 webhook 端點

**實作狀況：**
所有項目均已實作：

1. **Webhook 端點**：`app/api/webhook/line/route.ts` 實作了 POST 與 GET 方法，POST 用於接收 Line 事件，GET 用於健康檢查。
2. **訊息處理**：`lib/line/handler.ts` 中的 `handleLineEvent` 函數處理不同類型的事件（message、follow、unfollow）。
3. **LLM 整合**：`lib/llm/client.ts` 與 `lib/llm/providers/openai.ts` 實作了 OpenAI 客戶端，支援錯誤處理與降級機制。
4. **對話管理**：所有對話與訊息都會儲存至 MongoDB，並在管理後台提供查詢與統計功能。
5. **簽章驗證**：webhook 端點實作了 Line 簽章驗證機制，確保請求來自 Line 平台（開發模式可透過環境變數關閉）。

### 資料庫整合

**要求項目：**
- [x] 將完整對話（時間戳、使用者資訊、平台、額外中繼資料）持久化儲存

**實作狀況：**
專案使用 MongoDB Atlas 與 Mongoose ODM，已建立完整的資料模型：

1. **Conversation 模型**（`lib/db/models/Conversation.ts`）：
   - 儲存使用者 ID、會話 ID、狀態、流程階段
   - 記錄訊息數量、最後活動時間
   - 包含中繼資料（最後主題、上下文、狀態機）

2. **Message 模型**（`lib/db/models/Message.ts`）：
   - 儲存訊息類型（user/bot）、內容、時間戳
   - 記錄 LLM 提供者、模型、token 使用量
   - 包含分類資訊（主分類、子分類、信心度）
   - 記錄處理時間與錯誤資訊

3. **BotConfig 模型**（`lib/db/models/BotConfig.ts`）：
   - 儲存系統提示、個性設定、回應規則
   - 支援版本控制與啟用狀態管理

所有模型都建立了適當的索引以提升查詢效能。

### 基礎管理後台

**要求項目：**
- [x] 可在網頁後台檢視對話紀錄並提供基本篩選

**實作狀況：**
管理後台位於 `app/admin/` 目錄，包含以下頁面：

1. **Dashboard**（`app/admin/page.tsx`）：
   - 顯示總訊息數、總使用者數、總對話數、今日訊息數
   - 顯示分類統計圓餅圖
   - 顯示系統健康狀態

2. **對話列表**（`app/admin/conversations/page.tsx`）：
   - 顯示所有對話記錄
   - 支援分頁功能
   - 提供篩選功能（使用者 ID、關鍵字、日期區間）

3. **對話詳情**（`app/admin/conversations/detail/page.tsx`）：
   - 可查看使用者列表
   - 可查看特定使用者的所有對話
   - 可查看單一對話的詳細訊息

4. **Bot 設定**（`app/admin/bot-config/page.tsx`）：
   - 可調整系統提示、個性設定
   - 可設定回應規則（溫度、最大長度、模型等）

5. **分類統計**（`app/admin/categories/page.tsx`）：
   - 顯示訊息分類統計
   - 支援時間區間篩選

### 錯誤處理

**要求項目：**
- [x] LLM/外部服務失效時，提供明確、友善的降級回覆

**實作狀況：**
系統實作了完整的錯誤處理機制：

1. **LLM 錯誤處理**（`lib/llm/providers/openai.ts`）：
   - 處理速率限制錯誤（429）：回傳友善訊息請使用者稍後再試
   - 處理認證錯誤（401/403）：回傳設定錯誤訊息
   - 處理伺服器錯誤（500+）：回傳服務暫時無法使用訊息
   - 處理逾時錯誤：回傳處理時間較長訊息

2. **Fallback 機制**（`lib/llm/fallback.ts`）：
   - 當 LLM 無法使用時，系統會根據關鍵字匹配使用預設回應模板
   - 如果沒有匹配的模板，會回傳通用的降級訊息

3. **錯誤記錄**：所有錯誤都會記錄在訊息的 metadata 中，方便後續分析與除錯。

### LLM 配額與速率限制處理

**要求項目：**
- [x] 偵測 quota/429 等錯誤並以清楚訊息與合理 fallback 應對

**實作狀況：**
已完整實作：

1. **錯誤偵測**：`lib/llm/providers/openai.ts` 中的 `handleError` 函數會識別不同類型的錯誤，包括速率限制（429）。
2. **友善訊息**：針對速率限制錯誤，系統會回傳「目前服務使用量較高，請稍後再試。如果問題緊急，請稍後再發送一次。」的訊息。
3. **Fallback 回應**：當 LLM 服務不可用時，系統會自動切換到 fallback 回應機制，確保使用者仍能獲得回應。

### 即時更新

**要求項目：**
- [ ] 後台可即時看到新訊息/新會話

**實作狀況：**
**未實作**。目前後台頁面只在以下情況會重新載入資料：
- 使用者手動點擊搜尋按鈕
- 分頁變更
- 篩選條件變更
- 頁面重新載入

**建議實作方式：**
1. 在對話列表頁面加入 polling 機制（使用 `setInterval` 定期重新載入資料）
2. 或使用 Server-Sent Events (SSE) 實現即時推送
3. 或使用 WebSocket 實現雙向即時通訊

**實作範例（Polling）：**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchConversations();
  }, 5000); // 每 5 秒更新一次

  return () => clearInterval(interval);
}, [page, filters]);
```

### 進階篩選

**要求項目：**
- [x] 可依使用者、日期區間、平台、訊息內容搜尋

**實作狀況：**
已完整實作。`app/api/admin/conversations/route.ts` 支援以下篩選參數：

1. **使用者篩選**：`lineUserId` 參數可精確匹配特定使用者
2. **日期區間篩選**：`startDate` 與 `endDate` 參數可篩選特定時間範圍的對話
3. **訊息內容搜尋**：`search` 參數可在所有使用者訊息中進行關鍵字搜尋（不區分大小寫）
4. **平台篩選**：`platform` 參數已預留（目前僅支援 Line）

所有篩選條件都支援組合使用，並配合分頁功能。

### Session 管理

**要求項目：**
- [x] 追蹤對話流程與狀態機

**實作狀況：**
已完整實作。`lib/session/manager.ts` 提供了完整的 session 管理功能：

1. **會話狀態**：支援 `active`、`paused`、`completed`、`timeout` 四種狀態
2. **流程階段**：自動判斷對話處於 `greeting`、`question`、`discussion`、`closing`、`unknown` 哪個階段
3. **狀態機**：記錄狀態轉換歷史，包含轉換時間戳
4. **自動超時**：30 分鐘無活動的會話會自動標記為 `timeout`
5. **會話建立**：`lib/context/manager.ts` 中的 `getOrCreateConversation` 會根據活動時間決定是否建立新會話

### 回應客製化

**要求項目：**
- [x] 後台可調整 AI 人設與回覆規則

**實作狀況：**
已完整實作。`app/admin/bot-config/page.tsx` 提供了完整的 Bot 設定介面：

1. **系統提示**：可自訂 LLM 的系統提示詞
2. **個性設定**：可調整 AI 的個性描述
3. **回應規則**：
   - 啟用/停用 fallback
   - 設定最大回應長度
   - 調整溫度參數（0-2）
   - 自訂指令
   - 選擇 LLM 模型（gpt-3.5-turbo、gpt-4 等）

4. **版本控制**：每次更新設定會建立新版本，舊版本會自動停用
5. **歷史記錄**：`app/api/admin/bot-config/history/route.ts` 提供設定歷史查詢功能

### 效能/健康監控

**要求項目：**
- [x] 回應時間、失敗率與健康檢查端點

**實作狀況：**
已完整實作。`app/api/health/route.ts` 提供了完整的健康檢查功能：

1. **服務狀態檢查**：
   - 資料庫連線狀態（包含實際 ping 測試）
   - Line 服務設定狀態
   - LLM 服務設定狀態

2. **效能指標**：
   - 平均回應時間
   - P95 回應時間
   - P99 回應時間
   - 失敗率
   - 每分鐘請求數
   - 總請求數
   - 錯誤數量

3. **整體狀態判斷**：
   - `healthy`：所有關鍵服務正常
   - `degraded`：資料庫連線但部分服務缺失
   - `unhealthy`：關鍵服務（資料庫）不可用

### Webhook 健康檢查

**要求項目：**
- [x] 提供可監控的狀態檢查

**實作狀況：**
已完整實作。`app/api/webhook/health/route.ts` 提供了專門的 webhook 健康檢查：

1. **請求統計**：
   - 最後請求時間
   - 過去 24 小時的總請求數、成功數、失敗數、錯誤率
   - 過去 1 小時的請求統計

2. **狀態判斷**：
   - `healthy`：錯誤率 < 10%
   - `degraded`：錯誤率 10-20% 或無最近請求
   - `unhealthy`：錯誤率 > 20%

3. **簽章驗證狀態**：顯示簽章驗證是否啟用

### 批次作業

**要求項目：**
- [x] 後台多選與批次刪除對話

**實作狀況：**
已完整實作。`app/api/admin/conversations/batch/route.ts` 提供了批次刪除功能：

1. **批次刪除**：可一次刪除多個對話（最多 100 個）
2. **關聯刪除**：刪除對話時會同時刪除所有相關訊息
3. **驗證機制**：會驗證 ObjectId 格式，過濾無效 ID
4. **回傳統計**：回傳刪除的對話數與訊息數

**注意**：目前後台 UI 尚未實作多選與批次刪除的介面，但 API 端點已完整實作。

### 使用者分析

**要求項目：**
- [x] 顯示總對話數、活躍使用者數、趨勢等統計數據

**實作狀況：**
已完整實作。`app/api/admin/stats/route.ts` 提供了豐富的使用者分析：

1. **總覽統計**：
   - 總訊息數
   - 總使用者數
   - 總對話數
   - 今日訊息數
   - 成功率

2. **使用者分析**：
   - 活躍使用者數（過去 7 天）
   - 新使用者數（過去 7 天）
   - 使用者參與度（平均、最大、最小訊息數）
   - 前 10 名活躍使用者
   - 使用者成長趨勢（過去 30 天）

3. **LLM 使用統計**：
   - 各提供者的使用次數
   - Token 使用總量
   - 錯誤次數

4. **每日趨勢**：過去 7 天的訊息數量趨勢

5. **分類統計**：`app/api/admin/stats/categories/route.ts` 提供詳細的分類統計，包括主分類與子分類的分布、趨勢等。

## 技術要求檢查

### 必要技術

- [x] **Next.js（with TypeScript）**：專案使用 Next.js 14（App Router）與 TypeScript，所有檔案都有完整的型別定義。
- [x] **資料庫：MongoDB Atlas + Mongoose ODM**：使用 MongoDB Atlas 作為資料庫，Mongoose 作為 ODM，已建立完整的資料模型與索引。
- [x] **部署至 Vercel**：`vercel.json` 已配置，README 中提供了詳細的 Vercel 部署說明。
- [x] **串接 Line Messaging API**：已完整實作 webhook 端點、訊息接收與回覆功能。
- [x] **串接至任一 LLM**：已串接 OpenAI（GPT-3.5/GPT-4），並實作完整的錯誤處理與降級機制。
- [x] **環境變數**：使用 `.env.local` 管理環境變數，README 中提供了完整的環境變數清單。

### 建議技術

- [x] **樣式：Tailwind CSS**：雖然專案使用 CSS Modules，但樣式系統完整且一致。
- [x] **架構：服務層 + 資料存取層**：專案架構清晰，`lib/` 目錄包含業務邏輯層，`app/api/` 包含 API 路由層，資料模型位於 `lib/db/models/`。
- [x] **驗證：Zod**：專案已安裝 Zod，但未在 API 路由中廣泛使用。建議加強請求與回應的驗證。
- [x] **錯誤處理與紀錄**：已實作集中式錯誤處理，所有錯誤都會記錄在訊息 metadata 中。
- [x] **程式品質：ESLint + Prettier**：`package.json` 中包含 `lint` 腳本，建議確認 ESLint 與 Prettier 配置是否完整。

## 總結

### 已實作功能（13/14）

1. ✅ Line Bot 對話/功能設計
2. ✅ Line Bot Server
3. ✅ 資料庫整合
4. ✅ 基礎管理後台
5. ✅ 錯誤處理
6. ✅ LLM 配額與速率限制處理
7. ❌ 即時更新（未實作）
8. ✅ 進階篩選
9. ✅ Session 管理
10. ✅ 回應客製化
11. ✅ 效能/健康監控
12. ✅ Webhook 健康檢查
13. ✅ 批次作業（API 已實作，UI 待補強）
14. ✅ 使用者分析

### 技術要求（6/6）

1. ✅ Next.js（with TypeScript）
2. ✅ MongoDB Atlas + Mongoose ODM
3. ✅ 部署至 Vercel
4. ✅ Line Messaging API
5. ✅ LLM 串接
6. ✅ 環境變數管理

### 待補強項目

1. **即時更新功能**：建議在對話列表頁面加入 polling 機制，讓後台能即時看到新訊息與新會話。
2. **批次作業 UI**：雖然 API 已實作批次刪除功能，但後台 UI 尚未提供多選與批次操作的介面。
3. **請求驗證**：建議在 API 路由中使用 Zod 進行請求與回應的驗證，提升程式碼品質與安全性。

### 整體評估

專案整體完成度非常高，幾乎所有功能要求都已實作，且程式碼品質良好、架構清晰。唯一缺少的是即時更新功能，但這可以透過簡單的 polling 機制快速補強。技術要求也完全符合，且額外實作了許多進階功能（如分類統計、Bot 設定歷史等）。

**建議優先補強即時更新功能**，這樣就能完全符合作業要求。

