# Line AI Chatbot - Learning Assistant

## 很重要！！一定要看完！！！

以下是作者的話：

我做的是學習助手，基本上就是可以問他（任何）問題，然後他會解答。我沒有花太多心力在弄 chat bot 的東西，但我的管理者頁面可以做很多事（位階很大！），主要有實作的東西都跟管理者的權限有關。

進入底下提供的部署網址以後，會看到兩個可以進入的連結，一個是後端 swagger 的測試，另一個是（這次作業要的）管理者後臺。

管理後臺有幾個頁面，下面 cursor 都有提供詳細說明，我就不一一贅述，講幾個比較特別的功能就好。

首先是對話的分類功能，因為是學習助理，每一筆對話我都有請 AI 在回覆的同時進行分類，管理者可以在後臺看到大家普遍問的內容是什麼類別。但因為模型可以切換，有些模型比較笨（？分的類不一定是對的。

再來是

以下是 Cursor 同學的話：

一個整合 Line Messaging API 的智慧聊天機器人系統，使用 Next.js 與 TypeScript 開發，提供 AI 驅動的學習助手功能，並包含完整的管理後臺與 API 文件系統。

## 專案概述

本專案實作了一個完整的 Line Bot 系統，包含兩大核心組件：

1. **Webhook 式的 AI Bot 後端**：接收 Line 訊息、呼叫 LLM、回覆使用者
2. **Chat 管理後臺**：監控對話、檢視統計、管理歷程

系統主題為「學習助手」（Learning Assistant），可協助使用者理解概念、整理筆記、回答問題，並提供重點整理、快速複習、例題示範等進階功能。

## 快速開始

### 首頁導覽

當您訪問專案首頁（`https://wp1141-hw6-five.vercel.app/`）時，您會看到以下選項：

#### 1. Swagger UI 文件

點擊首頁的「View Swagger UI Documentation」連結，或直接訪問 `/api/swagger-ui`，即可進入 Swagger UI 介面。

Swagger UI 提供了完整的 API 文件，包含：

- **所有 API 端點的詳細說明**：包括請求參數、回應格式、錯誤碼等
- **互動式 API 測試**：可以直接在瀏覽器中測試 API 端點
- **OpenAPI 規格**：符合 OpenAPI 3.0 標準的 API 規格文件

在 Swagger UI 中，您可以：

- 查看所有可用的 API 端點（Webhook、Admin、Health Check 等）
- 測試 API 功能，包括發送測試請求並查看回應
- 了解每個端點的參數要求和回應格式
- 查看系統的健康狀態和效能指標

#### 2. 管理後臺

點擊首頁的「前往管理後臺 Dashboard」連結，或直接訪問 `/admin`，即可進入管理後臺。

管理後臺提供以下功能模組：

- **Dashboard**：統計總覽與五大方向分類圓餅圖
- **對話列表**：搜尋與篩選對話記錄，支援使用者 ID、關鍵字、日期區間篩選
- **對話詳情**：查看使用者列表、特定使用者的所有對話、單一對話的詳細訊息
- **分類統計**：分類分析與趨勢圖表，支援時間區間篩選
- **Bot 配置**：管理 AI 回覆設定，包括系統提示、個性設定、回應規則等
- **Rich Menu 管理**：管理 Line Rich Menu 設定

## 前端測試

本專案使用 Vitest 作為測試框架，並使用 React Testing Library 進行組件測試。

### 測試檔案結構

測試檔案位於 `test_frontend/` 目錄，結構如下：

```
test_frontend/
├── setup/                    # 測試環境設定
│   └── test-setup.ts         # 測試初始化設定檔
├── fixtures/                  # 測試資料
│   ├── conversations.ts     # 對話相關測試資料
│   ├── botConfig.ts          # Bot 配置相關測試資料
│   └── index.ts              # Fixtures 統一匯出
├── lib/                       # 工具函數和 API 測試
│   ├── utils/                # 工具函數測試
│   │   ├── date.test.ts      # 日期工具函數測試
│   │   └── format.test.ts    # 格式化工具函數測試
│   └── api/                   # API 封裝函數測試
│       └── conversations.test.ts
├── components/                # 組件測試
│   └── admin/                # 管理後臺組件測試
│       ├── ConversationTable.test.tsx
│       ├── CategoryBadge.test.tsx
│       ├── StatCard.test.tsx
│       └── BotConfigForm.test.tsx
└── app/                       # 頁面組件測試
    └── admin/
        └── conversations/
            └── page.test.tsx
```

### 執行測試

從專案根目錄執行以下指令：

```bash
# Watch 模式（檔案變更時自動重新執行）
npm test

# 開啟測試 UI（互動式測試介面）
npm run test:ui

# 執行一次完整測試
npm run test:run

# 執行測試並產生覆蓋率報告
npm run test:coverage
```

所有測試腳本都會自動使用 `test_frontend/vitest.config.ts` 設定檔。

### 測試覆蓋率

執行 `npm run test:coverage` 後，覆蓋率報告會產生在專案根目錄的 `coverage/` 資料夾中。報告包含：

- 行覆蓋率（Line Coverage）
- 函數覆蓋率（Function Coverage）
- 分支覆蓋率（Branch Coverage）
- 語句覆蓋率（Statement Coverage）

### 測試內容

目前測試涵蓋以下範圍：

1. **工具函數測試**：日期格式化、文字處理等工具函數
2. **API 封裝測試**：前端 API 呼叫函數的測試
3. **組件測試**：管理後臺組件的渲染與互動測試
4. **頁面測試**：完整頁面的功能測試

## Rich Menu 實作機制

Rich Menu 是 Line Bot 提供的一種圖形化選單介面，讓使用者可以透過點擊按鈕快速觸發特定功能。本專案實作了完整的 Rich Menu 系統。

### Rich Menu 架構

#### 按鈕配置

Rich Menu 採用 3 欄 x 2 列的佈局，總尺寸為 2500x1686 像素，包含六個功能按鈕：

1. **重點整理**（summarize）：整理對話內容的重點
2. **快速複習**（review）：生成快速複習內容
3. **例題示範**（example）：提供例題示範
4. **再解釋一次**（reexplain）：用不同方式重新解釋
5. **清除**（clear）：清除對話上下文
6. **幫助**（help）：顯示幫助資訊

每個按鈕的座標與尺寸都經過精確計算，確保按鈕區域與圖片中的按鈕位置完全對應。

#### 實作流程

Rich Menu 的實作包含以下步驟：

1. **建立 Rich Menu 定義**（`lib/line/rich-menu.ts`）：
   - 定義 Rich Menu 的尺寸、名稱、按鈕配置
   - 每個按鈕使用 `postback` 類型，包含 `action` 資料

2. **上傳 Rich Menu 圖片**：
   - 支援 JPEG 或 PNG 格式
   - 圖片必須符合 Line 的規格要求（2500x1686 像素）
   - 圖片路徑可在 `public/rich-menu-full.png` 找到

3. **設定為預設選單**：
   - 將建立的 Rich Menu 設定為所有使用者的預設選單

4. **處理 Postback 事件**（`lib/line/handler.ts`）：
   - 當使用者點擊 Rich Menu 按鈕時，Line 會發送 `postback` 事件
   - 系統解析 `postback.data` 中的 `action` 欄位
   - 根據不同的 `action` 執行對應的功能

#### 自動初始化機制

系統實作了自動初始化機制（`lib/line/rich-menu-auto-init.ts`），會在以下情況自動初始化 Rich Menu：

1. **Webhook 首次請求時**：當 Line 發送第一個 webhook 請求時，系統會在背景自動檢查 Rich Menu 是否存在，如果不存在則自動建立。

2. **手動初始化**：可以透過管理後臺的 Rich Menu 頁面手動初始化，或使用 `scripts/init-rich-menu.ts` 腳本。

自動初始化機制具有以下特點：

- **冪等性**：多次呼叫不會重複建立 Rich Menu
- **錯誤處理**：如果初始化失敗，會記錄錯誤但不會影響 webhook 的正常運作
- **非阻塞**：初始化過程在背景執行，不會阻塞 webhook 請求

#### 按鈕動作處理

當使用者點擊 Rich Menu 按鈕時，系統會執行以下流程：

1. **接收 Postback 事件**：`handlePostbackEvent` 函數接收 postback 事件
2. **解析動作類型**：從 `postback.data` 中解析出 `action` 類型
3. **發送動作訊息**：先發送一個訊息到聊天室，模擬使用者輸入（例如「📝 重點整理」）
4. **執行對應功能**：
   - 簡單動作（`clear`、`help`）：直接回覆預設訊息
   - LLM 動作（`summarize`、`review`、`example`、`reexplain`）：載入對話上下文，使用 LLM 生成回應
5. **儲存記錄**：將使用者的動作和 Bot 的回應都儲存到資料庫

#### Rich Menu 訊息定義

系統在 `lib/line/rich-menu-messages.ts` 中定義了：

- **ACTION_MESSAGES**：按鈕點擊時顯示在聊天室的訊息
- **ACTION_DESCRIPTIONS**：動作的描述文字，可用於提示或確認訊息

這些訊息確保使用者在點擊按鈕時，能夠清楚看到他們觸發了什麼動作。

## 專案架構

### 目錄結構

```
hw6/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── webhook/          # Webhook 端點
│   │   │   ├── line/         # Line Webhook
│   │   │   └── health/       # Webhook 健康檢查
│   │   ├── admin/            # 管理後臺 API
│   │   │   ├── conversations/ # 對話管理 API
│   │   │   ├── stats/        # 統計 API
│   │   │   ├── bot-config/   # Bot 配置 API
│   │   │   └── rich-menu/    # Rich Menu API
│   │   ├── health/            # 系統健康檢查
│   │   ├── swagger/          # OpenAPI 規格
│   │   └── swagger-ui/       # Swagger UI 頁面
│   ├── admin/                # 管理後臺頁面
│   │   ├── page.tsx          # Dashboard
│   │   ├── conversations/    # 對話列表與詳情
│   │   ├── categories/       # 分類統計
│   │   ├── bot-config/       # Bot 配置
│   │   └── rich-menu/        # Rich Menu 管理
│   └── page.tsx              # 首頁
├── components/               # React 組件
│   └── admin/               # 管理後臺組件
│       ├── ConversationTable.tsx
│       ├── CategoryBadge.tsx
│       ├── StatCard.tsx
│       └── BotConfigForm.tsx
├── lib/                      # 核心業務邏輯
│   ├── db/                   # 資料庫
│   │   ├── connect.ts        # 資料庫連線
│   │   └── models/          # Mongoose 模型
│   │       ├── Conversation.ts
│   │       ├── Message.ts
│   │       └── BotConfig.ts
│   ├── line/                 # Line API 整合
│   │   ├── client.ts         # Line Client
│   │   ├── handler.ts        # 事件處理器
│   │   ├── rich-menu.ts      # Rich Menu 功能
│   │   ├── rich-menu-auto-init.ts # 自動初始化
│   │   └── rich-menu-messages.ts  # 訊息定義
│   ├── llm/                  # LLM 服務整合
│   │   ├── client.ts         # LLM Client 工廠
│   │   ├── prompt.ts          # Prompt 建構
│   │   ├── fallback.ts        # Fallback 回應
│   │   └── providers/        # LLM 提供者
│   │       ├── openai.ts     # OpenAI 實作
│   │       └── gemini.ts     # Gemini 實作
│   ├── context/              # 對話上下文管理
│   │   └── manager.ts        # 上下文管理器
│   ├── session/              # Session 管理
│   │   └── manager.ts        # Session 管理器
│   ├── classification/       # 訊息分類
│   │   ├── classifier.ts     # 分類器
│   │   ├── keywords.ts       # 關鍵字定義
│   │   └── prompt.ts         # 分類 Prompt
│   ├── api/                  # API 封裝函數
│   │   ├── conversations.ts
│   │   ├── stats.ts
│   │   ├── bot-config.ts
│   │   └── rich-menu.ts
│   └── utils/                # 工具函數
│       ├── date.ts           # 日期處理
│       ├── format.ts          # 格式化
│       └── env.ts             # 環境變數
├── test_frontend/            # 前端測試
│   ├── setup/                # 測試設定
│   ├── fixtures/             # 測試資料
│   ├── components/           # 組件測試
│   └── lib/                  # 工具函數測試
└── scripts/                  # 工具腳本
    ├── init-rich-menu.ts     # Rich Menu 初始化
    └── test-db-connection.ts  # 資料庫連線測試
```

### 核心模組說明

#### 資料庫層（`lib/db/`）

使用 MongoDB Atlas 與 Mongoose ODM，定義了三個主要模型：

- **Conversation**：儲存對話會話資訊，包括使用者 ID、會話 ID、狀態、流程階段、訊息數量等
- **Message**：儲存每則訊息，包括類型（user/bot）、內容、時間戳、LLM 提供者、模型、token 使用量、分類資訊等
- **BotConfig**：儲存 Bot 配置，包括系統提示、個性設定、回應規則，支援版本控制

#### Line 整合層（`lib/line/`）

處理所有與 Line Messaging API 的互動：

- **client.ts**：封裝 Line Client，提供訊息發送、Rich Menu 操作等功能
- **handler.ts**：處理 Line 事件（message、postback、follow、unfollow）
- **rich-menu.ts**：Rich Menu 的建立、上傳、設定等功能
- **rich-menu-auto-init.ts**：自動初始化 Rich Menu 的機制

#### LLM 整合層（`lib/llm/`）

提供統一的 LLM 介面，支援多個提供者：

- **client.ts**：LLM Client 工廠，根據配置選擇提供者（OpenAI 或 Gemini）
- **providers/openai.ts**：OpenAI 實作，包含錯誤處理與降級機制
- **providers/gemini.ts**：Gemini 實作
- **prompt.ts**：Prompt 建構邏輯，整合系統提示、使用者訊息與歷史上下文
- **fallback.ts**：當 LLM 無法使用時的 fallback 回應模板

#### 上下文管理層（`lib/context/`）

管理對話上下文，確保 LLM 能夠理解對話脈絡：

- **manager.ts**：提供上下文載入、會話建立、訊息計數等功能
- 支援自動清除上下文（當使用者執行 `/clear` 指令時）
- 支援會話超時（30 分鐘無活動自動建立新會話）

#### 分類系統（`lib/classification/`）

自動分類使用者訊息到學術領域：

- **classifier.ts**：分類器，優先使用 LLM 分類，失敗時降級到關鍵字匹配
- **keywords.ts**：定義各類別的關鍵字
- **prompt.ts**：分類用的 Prompt 模板
- 支援五大主分類：人文、商管、理工、生命科學、其他

## 安裝與設定

### 環境需求

- Node.js 18+ 
- npm 或 yarn
- MongoDB Atlas 帳號（免費層級即可）
- Line Developers 帳號
- OpenAI API Key 或 Google Gemini API Key

### 安裝步驟

1. **安裝依賴套件**

```bash
npm install
```

2. **設定環境變數**

建立 `.env.local` 檔案，並填入以下環境變數：

```env
# Line Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# LLM Provider (OpenAI)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=500
OPENAI_TIMEOUT=10000

# LLM Provider (Gemini) - 可選
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5
GEMINI_MAX_TOKENS=500
GEMINI_TIMEOUT=10000

# 選擇 LLM 提供者 (openai 或 gemini)
LLM_PROVIDER=openai

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Webhook 設定（開發模式可關閉簽章驗證）
DISABLE_WEBHOOK_SIGNATURE_CHECK=false
```

3. **設定 Line Channel**

前往 [Line Developers Console](https://developers.line.biz/console/)：

- 建立新的 Provider 和 Channel
- 取得 Channel Access Token 和 Channel Secret
- 設定 Webhook URL：`https://your-domain.vercel.app/api/webhook/line`
- 啟用 Webhook

4. **設定 MongoDB Atlas**

- 建立 MongoDB Atlas 帳號
- 建立免費層級的 Cluster
- 設定資料庫使用者與密碼
- 設定網路存取權限（允許所有 IP 或特定 IP 範圍）
- 取得連線字串並填入 `MONGODB_URI`

5. **執行開發伺服器**

```bash
npm run dev
```

應用程式將在 `http://localhost:3000` 啟動。

## 功能實作詳情

### Line Bot 對話/功能設計

#### 主題與功能

系統主題為「學習助手」，提供以下核心功能：

1. **回答學習相關問題**：使用 LLM 回答使用者的學習問題
2. **解釋概念**：用清晰易懂的方式解釋複雜概念
3. **整理筆記**：協助使用者整理與組織學習內容
4. **重點整理**：透過 Rich Menu 按鈕快速整理對話重點
5. **快速複習**：生成快速複習內容
6. **例題示範**：提供相關例題示範
7. **重新解釋**：用不同方式重新解釋概念

#### 對話腳本

系統在 `lib/llm/fallback.ts` 中定義了多種情境的 fallback 回應模板：

- **問候**：當使用者打招呼時的回應
- **幫助**：當使用者需要幫助時的回應
- **感謝**：當使用者表達感謝時的回應
- **告別**：當使用者告別時的回應
- **未知指令**：當使用者輸入未知指令時的回應

這些模板確保即使在 LLM 服務不可用時，系統仍能提供基本的回應。

#### 對話脈絡管理

系統實作了完整的對話脈絡管理機制：

1. **上下文載入**：每次處理訊息時，會載入最近 10 則訊息作為上下文
2. **上下文壓縮**：如果上下文過長，會自動壓縮以符合 token 限制
3. **清除上下文**：當使用者執行 `/clear` 指令或點擊「清除」按鈕時，會清除上下文
4. **會話超時**：30 分鐘無活動的會話會自動標記為 `timeout`，下次訊息會建立新會話

#### LLM Prompt Template 設計

系統在 `lib/llm/prompt.ts` 中實作了 Prompt 建構邏輯：

1. **系統提示**：從 BotConfig 載入系統提示，定義 AI 的角色與行為
2. **歷史上下文**：整合最近 10 則訊息作為上下文
3. **使用者訊息**：當前使用者的訊息
4. **動作類型**：如果是 Rich Menu 動作，會加入動作類型的說明

Prompt 的建構會根據不同的動作類型（summarize、review、example、reexplain）調整，確保 LLM 能夠理解使用者的意圖。

#### 回應設計

系統的回應設計包含以下層次：

1. **指令回應**：`/help`、`/clear` 等指令直接回覆預設訊息
2. **LLM 回應**：一般訊息和 Rich Menu 動作使用 LLM 生成回應
3. **Fallback 回應**：當 LLM 無法使用時，使用關鍵字匹配的 fallback 回應
4. **錯誤回應**：當發生錯誤時，回覆友善的錯誤訊息

### Line Bot Server

#### Webhook 端點

`app/api/webhook/line/route.ts` 實作了 Line Webhook 端點：

- **POST**：接收 Line 事件，驗證簽章，處理事件
- **GET**：健康檢查端點，用於驗證 Webhook 是否正常運作

Webhook 端點包含以下安全機制：

- **簽章驗證**：驗證請求是否來自 Line（開發模式可關閉）
- **錯誤處理**：即使處理失敗也回傳 200，避免 Line 重試
- **非阻塞處理**：Rich Menu 自動初始化在背景執行，不阻塞 webhook

#### 訊息處理流程

當使用者發送訊息時，系統執行以下流程：

1. **接收事件**：Webhook 端點接收 Line 事件
2. **驗證簽章**：驗證請求的簽章（生產環境）
3. **處理事件**：根據事件類型（message、postback、follow、unfollow）執行對應處理
4. **儲存訊息**：將使用者訊息儲存到資料庫
5. **分類訊息**：使用分類器分類訊息到學術領域
6. **載入上下文**：載入對話上下文
7. **生成回應**：使用 LLM 或 fallback 生成回應
8. **發送回應**：透過 Line API 發送回應給使用者
9. **儲存回應**：將 Bot 回應儲存到資料庫

#### 對話管理與統計

所有對話與訊息都會儲存到 MongoDB，包含：

- **對話資訊**：使用者 ID、會話 ID、狀態、流程階段、訊息數量、最後活動時間
- **訊息資訊**：類型、內容、時間戳、LLM 提供者、模型、token 使用量、分類資訊、處理時間、錯誤資訊

這些資料用於：

- **管理後臺顯示**：在管理後臺查看對話記錄
- **統計分析**：計算總訊息數、活躍使用者數、分類統計等
- **效能監控**：計算平均回應時間、失敗率等指標

### 資料庫整合

#### 資料模型設計

系統使用 Mongoose ODM 定義了三個主要模型：

**Conversation 模型**（`lib/db/models/Conversation.ts`）：

- `lineUserId`：Line 使用者 ID
- `sessionId`：會話 ID
- `status`：會話狀態（active、paused、completed、timeout）
- `flowStage`：流程階段（greeting、question、discussion、closing、unknown）
- `messageCount`：訊息數量
- `lastActivityAt`：最後活動時間
- `metadata`：中繼資料（最後主題、上下文、狀態機等）

**Message 模型**（`lib/db/models/Message.ts`）：

- `conversationId`：對話 ID（關聯到 Conversation）
- `lineUserId`：Line 使用者 ID
- `type`：訊息類型（user 或 bot）
- `content`：訊息內容
- `timestamp`：時間戳
- `metadata`：中繼資料（LLM 提供者、模型、token 使用量、分類資訊、處理時間、錯誤資訊等）

**BotConfig 模型**（`lib/db/models/BotConfig.ts`）：

- `version`：版本號
- `systemPrompt`：系統提示
- `personality`：個性設定
- `responseRules`：回應規則（溫度、最大長度、模型、提供者等）
- `isActive`：是否啟用
- `createdAt`：建立時間

#### 索引設計

為了提升查詢效能，系統在以下欄位建立了索引：

- `Conversation.lineUserId`：快速查詢使用者的對話
- `Conversation.lastActivityAt`：快速排序對話
- `Message.conversationId`：快速查詢對話的訊息
- `Message.lineUserId`：快速查詢使用者的訊息
- `Message.timestamp`：快速查詢時間範圍的訊息
- `Message.metadata.category.mainCategory`：快速查詢分類統計

### 錯誤處理

#### LLM 錯誤處理

系統在 `lib/llm/providers/openai.ts` 中實作了完整的錯誤處理：

1. **速率限制錯誤（429）**：
   - 偵測到 429 錯誤時，回傳友善訊息：「目前服務使用量較高，請稍後再試。如果問題緊急，請稍後再發送一次。」
   - 標記為可重試錯誤

2. **認證錯誤（401/403）**：
   - 偵測到認證錯誤時，回傳設定錯誤訊息：「服務設定有誤，請聯絡管理員。」
   - 標記為不可重試錯誤

3. **伺服器錯誤（500+）**：
   - 偵測到伺服器錯誤時，回傳服務暫時無法使用訊息：「服務暫時無法使用，請稍後再試。」
   - 標記為可重試錯誤

4. **逾時錯誤**：
   - 偵測到逾時錯誤時，回傳處理時間較長訊息：「處理時間較長，請稍後再試。」
   - 標記為可重試錯誤

#### Fallback 機制

當 LLM 無法使用時，系統會自動切換到 fallback 回應機制：

1. **關鍵字匹配**：`lib/llm/fallback.ts` 中定義了多種關鍵字模式
2. **模板回應**：根據匹配的關鍵字選擇對應的回應模板
3. **通用回應**：如果沒有匹配的模板，回傳通用的降級訊息

所有錯誤都會記錄在訊息的 `metadata.error` 欄位中，方便後續分析與除錯。

### LLM 配額與速率限制處理

系統實作了完整的配額與速率限制處理機制：

1. **錯誤偵測**：`lib/llm/providers/openai.ts` 中的 `handleError` 函數會識別不同類型的錯誤，包括速率限制（429）

2. **友善訊息**：針對速率限制錯誤，系統會回傳清楚的訊息，告知使用者服務使用量較高，請稍後再試

3. **Fallback 回應**：當 LLM 服務不可用時，系統會自動切換到 fallback 回應機制，確保使用者仍能獲得回應

4. **錯誤記錄**：所有錯誤都會記錄在資料庫中，方便後續分析與監控

### 進階篩選

管理後臺的對話列表支援多種篩選條件：

1. **使用者篩選**：`lineUserId` 參數可精確匹配特定使用者
2. **日期區間篩選**：`startDate` 與 `endDate` 參數可篩選特定時間範圍的對話
3. **訊息內容搜尋**：`search` 參數可在所有使用者訊息中進行關鍵字搜尋（不區分大小寫）
4. **平臺篩選**：`platform` 參數已預留（目前僅支援 Line）

所有篩選條件都支援組合使用，並配合分頁功能。

### Session 管理

系統在 `lib/session/manager.ts` 中實作了完整的 Session 管理：

1. **會話狀態**：支援 `active`、`paused`、`completed`、`timeout` 四種狀態
2. **流程階段**：自動判斷對話處於 `greeting`、`question`、`discussion`、`closing`、`unknown` 哪個階段
3. **狀態機**：記錄狀態轉換歷史，包含轉換時間戳
4. **自動超時**：30 分鐘無活動的會話會自動標記為 `timeout`
5. **會話建立**：`lib/context/manager.ts` 中的 `getOrCreateConversation` 會根據活動時間決定是否建立新會話

### 回應客製化

管理後臺提供了完整的 Bot 設定介面（`app/admin/bot-config/page.tsx`）：

1. **系統提示**：可自訂 LLM 的系統提示詞，定義 AI 的角色與行為
2. **個性設定**：可調整 AI 的個性描述，影響回應的風格
3. **回應規則**：
   - 啟用/停用 fallback
   - 設定最大回應長度
   - 調整溫度參數（0-2）
   - 自訂指令
   - 選擇 LLM 模型（gpt-3.5-turbo、gpt-4o、gemini-2.5 等）
   - 選擇 LLM 提供者（OpenAI 或 Gemini）

4. **版本控制**：每次更新設定會建立新版本，舊版本會自動停用
5. **歷史記錄**：`app/api/admin/bot-config/history/route.ts` 提供設定歷史查詢功能

### 效能/健康監控

系統在 `app/api/health/route.ts` 中提供了完整的健康檢查功能：

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

系統在 `app/api/webhook/health/route.ts` 中提供了專門的 webhook 健康檢查：

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

系統在 `app/api/admin/conversations/batch/route.ts` 中實作了批次刪除功能：

1. **批次刪除**：可一次刪除多個對話（最多 100 個）
2. **關聯刪除**：刪除對話時會同時刪除所有相關訊息
3. **驗證機制**：會驗證 ObjectId 格式，過濾無效 ID
4. **回傳統計**：回傳刪除的對話數與訊息數

**注意**：目前後臺 UI 尚未實作多選與批次刪除的介面，但 API 端點已完整實作。

### 使用者分析

系統在 `app/api/admin/stats/route.ts` 中提供了豐富的使用者分析：

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

5. **分類統計**：`app/api/admin/stats/categories/route.ts` 提供詳細的分類統計，包括主分類與子分類的分布、趨勢等

## 部署

### 部署至 Vercel

1. **準備 Git Repository**：
   - 確保所有程式碼都已提交到 Git
   - 推送到 GitHub、GitLab 或 Bitbucket

2. **在 Vercel 建立專案**：
   - 前往 [Vercel](https://vercel.com) 並登入
   - 點擊 "Add New Project"
   - 選擇您的 Git repository
   - Framework Preset 選擇 "Next.js"

3. **設定環境變數**：
   在 Vercel 專案設定中，新增所有必要的環境變數（參考「安裝與設定」章節）

4. **部署**：
   - 點擊 "Deploy" 開始部署
   - Vercel 會自動執行建置與部署

5. **更新 Line Webhook URL**：
   - 前往 Line Developers Console
   - 將 Webhook URL 更新為：`https://your-project.vercel.app/api/webhook/line`
   - 點擊 "Verify" 驗證 Webhook

### 部署後驗證

1. **檢查 Health Check**：
   - 訪問 `https://your-project.vercel.app/api/health`
   - 確認 `status: "healthy"` 和 `database: "connected"`

2. **檢查 Webhook**：
   - 訪問 `https://your-project.vercel.app/api/webhook/health`
   - 確認 webhook 狀態正常

3. **測試 Line Bot**：
   - 在 Line 中發送訊息給 Bot
   - 確認 Bot 能夠正常回應

## 技術棧

### 必要技術

- **Next.js 14**（App Router）with TypeScript
- **MongoDB Atlas** + **Mongoose ODM**
- **Line Messaging API**
- **OpenAI API** 或 **Google Gemini API**
- **Vercel**（部署平臺）

### 建議技術

- **CSS Modules**：樣式管理
- **Vitest**：測試框架
- **React Testing Library**：組件測試
- **Swagger UI**：API 文件
- **Zod**：資料驗證（已安裝，建議加強使用）

## 開發指南

### 本地開發

1. **啟動開發伺服器**：
```bash
npm run dev
```

2. **執行測試**：
```bash
npm test
```

3. **檢查程式碼品質**：
```bash
npm run lint
```

### 資料庫操作

系統使用 Mongoose ODM，所有資料模型定義在 `lib/db/models/` 目錄。資料庫連線在 `lib/db/connect.ts` 中管理，使用全域快取避免重複連線。

### API 開發

所有 API 端點定義在 `app/api/` 目錄，遵循 Next.js App Router 的 Route Handler 規範。API 文件使用 Swagger JSDoc 註解自動生成。

### 新增 LLM 提供者

要新增新的 LLM 提供者：

1. 在 `lib/llm/providers/` 中建立新的提供者實作
2. 實作 `LLMClient` 介面
3. 在 `lib/llm/client.ts` 中註冊新提供者
4. 更新環境變數與 BotConfig 以支援新提供者

## 常見問題

### Rich Menu 無法顯示

1. 確認 Rich Menu 圖片已上傳到 `public/rich-menu-full.png`
2. 檢查 Line Channel Access Token 是否正確
3. 使用管理後臺的 Rich Menu 頁面手動初始化
4. 檢查 Vercel Function Logs 是否有錯誤訊息

### LLM 回應失敗

1. 檢查 API Key 是否正確設定
2. 檢查配額是否用盡
3. 查看 Health Check API 確認 LLM 服務狀態
4. 檢查錯誤日誌中的詳細錯誤訊息

### 資料庫連線失敗

1. 確認 `MONGODB_URI` 格式正確
2. 檢查 MongoDB Atlas 網路存取設定
3. 確認資料庫使用者權限
4. 測試本地環境的連線是否正常

## 授權

本專案為教育用途專案。

## 聯絡資訊

如有問題或建議，請透過 GitHub Issues 提出

