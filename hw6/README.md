# Line AI Chatbot - Learning Assistant

A Next.js-based intelligent chatbot system integrated with Line Messaging API, featuring AI-powered responses and a management dashboard.

## Features

- **Line Bot Integration**: Receives and responds to messages from Line users
- **AI-Powered Responses**: Uses OpenAI GPT models to generate contextual responses
- **Conversation Management**: Maintains conversation context and history
- **Database Persistence**: Stores all conversations and messages in MongoDB
- **Admin Dashboard**: View conversations, statistics, and manage chat history
- **Error Handling**: Graceful degradation when LLM services are unavailable
- **Rate Limiting**: Handles API quota and rate limit errors

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **AI Provider**: OpenAI (GPT-3.5/GPT-4)
- **Messaging API**: Line Messaging API
- **Deployment**: Vercel (Serverless Functions)

## Project Structure

```
hw6/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── webhook/line/  # Line Webhook endpoint
│   │   └── admin/         # Admin API endpoints
│   └── admin/             # Admin dashboard pages
├── lib/                   # Core business logic
│   ├── db/               # Database connection and models
│   ├── line/             # Line API integration
│   ├── llm/              # LLM service integration
│   └── context/          # Conversation context management
└── types/                # TypeScript type definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Line Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# LLM Provider (OpenAI)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TIMEOUT=10000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Line Channel Setup

1. Go to [Line Developers Console](https://developers.line.biz/console/)
2. Create a new provider and channel
3. Get your Channel Access Token and Channel Secret
4. Set the Webhook URL to: `https://your-domain.vercel.app/api/webhook/line`
5. Enable Webhook in the channel settings

### 4. MongoDB Atlas Setup

MongoDB Atlas 是 MongoDB 的雲端託管服務，提供免費層級，非常適合開發和小型專案使用。

#### 步驟一：建立 MongoDB Atlas 帳號

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 點擊 "Try Free" 建立免費帳號
3. 完成註冊流程

#### 步驟二：建立 Cluster

1. 登入後，點擊 "Build a Database"
2. 選擇免費層級（Free Tier - M0）
3. 選擇雲端服務提供商和區域（建議選擇離您最近的區域，例如 AWS 的 ap-northeast-1 適合台灣）
4. 為 Cluster 命名（例如：`line-chatbot-cluster`）
5. 點擊 "Create" 建立 Cluster（需要等待幾分鐘）

#### 步驟三：設定資料庫使用者

1. 在 Cluster 建立完成後，會出現設定精靈
2. 在 "Database Access" 頁面，點擊 "Add New Database User"
3. 選擇 "Password" 認證方式
4. 設定使用者名稱和密碼（請妥善保存，稍後會用到）
5. 設定權限為 "Atlas admin" 或 "Read and write to any database"
6. 點擊 "Add User"

#### 步驟四：設定網路存取權限

為了讓 Vercel 的 serverless functions 能夠連線到 MongoDB Atlas，需要設定 IP 白名單。

1. 在 "Network Access" 頁面，點擊 "Add IP Address"
2. 為了方便開發，可以暫時點擊 "Allow Access from Anywhere"（這會允許所有 IP 連線）
   - 生產環境建議只允許特定 IP 範圍
   - Vercel 的 IP 是動態的，所以允許所有 IP 是常見做法
3. 點擊 "Confirm"

#### 步驟五：取得連線字串

1. 回到 "Database" 頁面，點擊 "Connect" 按鈕
2. 選擇 "Connect your application"
3. 選擇 Driver 為 "Node.js"，Version 為最新版本
4. 複製連線字串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. 將連線字串中的 `<username>` 和 `<password>` 替換為您剛才建立的使用者名稱和密碼
6. 在連線字串的最後，加上資料庫名稱，例如：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/line_chatbot?retryWrites=true&w=majority
   ```
   其中 `line_chatbot` 是資料庫名稱，您可以自行命名

#### 步驟六：更新環境變數

將完整的連線字串複製到 `.env.local` 檔案中的 `MONGODB_URI` 變數。

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Documentation

### Swagger UI

The API documentation is available through Swagger UI:

- **Swagger UI**: `http://localhost:3000/api/swagger-ui`
- **OpenAPI Spec (JSON)**: `http://localhost:3000/api/swagger`

You can use Swagger UI to:
- View all available API endpoints
- See request/response schemas
- Test API endpoints directly from the browser
- Understand parameter requirements and response formats

### API Endpoints

#### Webhook

- `POST /api/webhook/line` - Receives events from Line Messaging API
- `GET /api/webhook/line` - Health check for webhook endpoint

#### Admin APIs

- `GET /api/admin/conversations` - Get list of conversations
  - Query params: `page`, `limit`, `lineUserId`, `startDate`, `endDate`
- `GET /api/admin/conversations/[id]` - Get conversation details
- `GET /api/admin/stats` - Get statistics
  - Query params: `startDate`, `endDate`

#### Health Check

- `GET /api/health` - Check system health and service status

#### Documentation

- `GET /api/swagger` - OpenAPI specification (JSON)
- `GET /api/swagger-ui` - Swagger UI interface

## Deployment to Vercel

Vercel 是 Next.js 的官方推薦部署平台，提供免費層級，並且與 MongoDB Atlas 整合良好。

### 步驟一：準備 Git Repository

1. 確保所有程式碼都已提交到 Git
2. 推送到 GitHub、GitLab 或 Bitbucket 等 Git 託管服務

### 步驟二：在 Vercel 建立專案

1. 前往 [Vercel](https://vercel.com) 並登入（可以使用 GitHub 帳號登入）
2. 點擊 "Add New Project"
3. 選擇您的 Git repository
4. 在專案設定中：
   - Framework Preset: 選擇 "Next.js"（通常會自動偵測）
   - Root Directory: 如果專案在子目錄，請指定路徑
   - Build Command: 通常使用預設值 `npm run build`
   - Output Directory: 使用預設值 `.next`
   - Install Command: 使用預設值 `npm install`

### 步驟三：設定環境變數

在 Vercel 專案設定中，需要設定所有必要的環境變數。這是部署成功的關鍵步驟。

1. 在專案設定頁面，點擊 "Environment Variables"
2. 逐一新增以下環境變數：

   **Line Messaging API 變數：**
   - `LINE_CHANNEL_ACCESS_TOKEN`: 您的 Line Channel Access Token
   - `LINE_CHANNEL_SECRET`: 您的 Line Channel Secret

   **OpenAI API 變數：**
   - `OPENAI_API_KEY`: 您的 OpenAI API Key
   - `OPENAI_MODEL`: 模型名稱（例如：`gpt-3.5-turbo`，可選，有預設值）
   - `OPENAI_MAX_TOKENS`: 最大 token 數（例如：`500`，可選，有預設值）
   - `OPENAI_TIMEOUT`: 逾時時間（例如：`10000`，可選，有預設值）

   **MongoDB 連線變數：**
   - `MONGODB_URI`: 您的 MongoDB Atlas 連線字串
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/line_chatbot?retryWrites=true&w=majority
     ```

   **應用程式變數：**
   - `NEXT_PUBLIC_APP_URL`: 部署後的網址（例如：`https://your-project.vercel.app`）
   - `NODE_ENV`: 設定為 `production`
   - `MAX_REQUESTS_PER_MINUTE`: 每分鐘最大請求數（例如：`10`，可選，有預設值）

3. 對於每個環境變數，選擇要套用的環境：
   - Production: 生產環境
   - Preview: 預覽環境（Pull Request 部署）
   - Development: 開發環境

4. 點擊 "Save" 儲存所有環境變數

### 步驟四：部署

1. 點擊 "Deploy" 開始部署
2. Vercel 會自動執行以下步驟：
   - 安裝依賴套件（`npm install`）
   - 建置專案（`npm run build`）
   - 部署到 CDN
3. 等待部署完成（通常需要 1-3 分鐘）
4. 部署完成後，您會看到部署成功的訊息和網址

### 步驟五：驗證部署

1. 訪問部署後的網址，例如：`https://your-project.vercel.app`
2. 測試 Health Check API：`https://your-project.vercel.app/api/health`
   - 應該會看到 `status: "healthy"` 和 `database: "connected"`
   - 如果資料庫連線失敗，請檢查 `MONGODB_URI` 是否正確設定
3. 檢查 Vercel 的 Function Logs：
   - 在 Vercel Dashboard 中，點擊 "Functions" 標籤
   - 查看是否有任何錯誤訊息

### 步驟六：更新 Line Webhook URL

部署完成後，需要更新 Line Developers Console 中的 Webhook URL。

1. 前往 [Line Developers Console](https://developers.line.biz/console/)
2. 選擇您的 Channel
3. 在 "Messaging API" 頁面，找到 "Webhook URL" 設定
4. 將 Webhook URL 更新為：`https://your-project.vercel.app/api/webhook/line`
5. 點擊 "Verify" 驗證 Webhook 是否正常運作
6. 啟用 "Use webhook" 選項

### 常見問題排除

#### MongoDB 連線失敗

如果 Health Check API 顯示資料庫連線失敗，請檢查：

1. **MONGODB_URI 格式是否正確**：確保連線字串包含正確的使用者名稱、密碼和資料庫名稱
2. **MongoDB Atlas 網路存取設定**：確認已允許所有 IP 或 Vercel 的 IP 範圍
3. **資料庫使用者權限**：確認資料庫使用者有讀寫權限
4. **連線字串中的特殊字元**：如果密碼包含特殊字元，需要進行 URL 編碼

#### 環境變數未生效

1. 確認環境變數已正確設定在 Vercel Dashboard
2. 確認選擇了正確的環境（Production/Preview/Development）
3. 重新部署專案以套用新的環境變數

#### 部署後無法連線資料庫

1. 檢查 Vercel Function Logs 中的錯誤訊息
2. 確認 MongoDB Atlas Cluster 狀態正常
3. 測試本地環境的連線是否正常（使用相同的 MONGODB_URI）

### 後續維護

部署完成後，每次推送程式碼到 Git repository 的主分支，Vercel 會自動觸發新的部署。您也可以在 Vercel Dashboard 中手動觸發重新部署。

建議定期檢查：
- Vercel Function Logs 是否有錯誤
- MongoDB Atlas 的使用量和效能
- Health Check API 的狀態

## Usage

### Bot Commands

- `/help` - Show available commands
- `/clear` - Clear conversation context

### Conversation Flow

1. User sends a message to the Line bot
2. Bot receives the message via webhook
3. Bot loads conversation context from database
4. Bot generates response using LLM or fallback templates
5. Bot sends response to user
6. Bot saves both messages to database

## Error Handling

The system includes comprehensive error handling:

- **Rate Limit Errors (429)**: Returns user-friendly message asking to try again later
- **Server Errors (500+)**: Returns message indicating temporary unavailability
- **Timeout Errors**: Returns message asking user to try again
- **Authentication Errors**: Logs error and returns configuration error message
- **Fallback Responses**: Uses predefined templates when LLM is unavailable

## Development Notes

- The system uses serverless functions, so database connections are cached globally
- Conversation context is limited to the last 5-10 messages to manage token usage
- Sessions timeout after 30 minutes of inactivity
- All messages are persisted to MongoDB for analytics and debugging

## License

This project is created for educational purposes.

