# 管理後台使用說明

## 訪問方式

啟動開發伺服器後，訪問以下網址：

- **首頁**: http://localhost:3000
- **管理後台 Dashboard**: http://localhost:3000/admin
- **對話列表**: http://localhost:3000/admin/conversations
- **對話詳情**: http://localhost:3000/admin/conversations/detail
- **分類統計**: http://localhost:3000/admin/categories
- **Bot 配置**: http://localhost:3000/admin/bot-config

## 功能說明

### 1. Dashboard (`/admin`)
- 顯示系統統計總覽（總訊息數、總使用者數、總對話數、今日訊息）
- 五大方向分類圓餅圖（文史哲、商管經濟、數理科學、生物醫學、其他）
- 系統健康狀態監控

### 2. 對話列表 (`/admin/conversations`)
- 支援多種篩選條件：
  - 使用者 ID 搜尋
  - 關鍵字搜尋（搜尋訊息內容）
  - 日期範圍篩選（開始日期、結束日期）
- 分頁顯示對話記錄
- 點擊「查看詳情」可前往對話詳情頁面

### 3. 對話詳情 (`/admin/conversations/detail`)
三層結構設計：
- **第一層**：使用者列表（預設顯示）
  - 顯示所有有對話的使用者
  - 每個使用者卡片顯示：使用者 ID、對話數、最後活動時間
- **第二層**：該使用者的對話列表
  - 顯示該使用者的所有對話
  - 每個對話項目顯示：第一條使用者訊息作為預覽、時間戳記、訊息數量
- **第三層**：對話詳情彈出視窗
  - 顯示完整訊息列表
  - 使用者訊息：日期時間、內容、分類標籤
  - Bot 訊息：日期時間、回覆內容、LLM 模型、Token 使用量、處理時間

### 4. 分類統計 (`/admin/categories`)
- 統計卡片：總訊息數、已分類、未分類、分類率
- 時間篩選：支援按日期、週、月篩選
- 五大方向圓餅圖：動態顯示分類比例
- 細分類別統計：顯示所有 25 個子分類
- 每日趨勢圖表：顯示最近 7 天的分類趨勢

### 5. Bot 配置管理 (`/admin/bot-config`)
- 當前配置編輯：
  - System Prompt
  - Personality
  - Response Rules（Enable Fallback、Max Response Length、Temperature、Custom Instructions）
- 查看歷史紀錄：顯示所有配置版本
- 還原為預設模式：一鍵還原為預設配置

## 技術架構

- **框架**: Next.js 14 (App Router) + TypeScript
- **圖表庫**: Recharts
- **日期處理**: date-fns
- **樣式**: CSS Modules
- **狀態管理**: React Hooks

## API 端點

所有前端頁面使用以下 API 端點：

- `GET /api/admin/stats` - 取得統計數據
- `GET /api/admin/stats/categories` - 取得分類統計
- `GET /api/admin/conversations` - 取得對話列表
- `GET /api/admin/conversations/users` - 取得使用者列表
- `GET /api/admin/conversations/users/[userId]` - 取得使用者對話列表
- `GET /api/admin/conversations/[id]` - 取得對話詳情
- `GET /api/admin/bot-config` - 取得 Bot 配置
- `PUT /api/admin/bot-config` - 更新 Bot 配置
- `GET /api/admin/bot-config/history` - 取得配置歷史紀錄

## 設計規範

- **主色調**: #065758（深青綠色）
- **次要色調**: #82c3c5（淺青綠色）
- **背景色**: #e2f0ef
- **圓餅圖尺寸**: Dashboard 350x350px，分類統計頁面 450x450px

