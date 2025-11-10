# 🗄️ PostgreSQL 設定指南

## 為什麼要用 PostgreSQL？

作業要求使用 **PostgreSQL 或 MongoDB**，本專案使用 PostgreSQL。

---

## 🚀 快速設定（推薦方案）

### 選項 A：Supabase（最簡單，免費）

**優點：**
- ✅ 完全免費
- ✅ 無需安裝
- ✅ 5 分鐘完成設定
- ✅ 包含資料庫管理介面

**設定步驟：**

1. **註冊帳號**
   - 訪問 https://supabase.com/
   - 點擊「Start your project」
   - 使用 GitHub 登入

2. **建立專案**
   - 點擊「New project」
   - 專案名稱：`echo`
   - Database Password：設定一個密碼（記下來）
   - Region：選擇 **Northeast Asia (Tokyo)**（最近）
   - 點擊「Create new project」（等待 2-3 分鐘）

3. **取得連接字串**
   - 專案建立完成後，點擊左側「Project Settings」
   - 點擊「Database」
   - 在「Connection string」區域，選擇「URI」
   - 複製連接字串（格式：`postgresql://postgres:密碼@...`）

4. **填入 .env**
   ```bash
   DATABASE_URL="postgresql://postgres.[ref]:[密碼]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

5. **初始化資料庫**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **啟動專案**
   ```bash
   npm run dev
   ```

---

### 選項 B：Neon（Serverless PostgreSQL）

**優點：**
- ✅ 免費額度大
- ✅ Serverless，自動擴展
- ✅ 連接快速

**設定步驟：**

1. **註冊**
   - 訪問 https://neon.tech/
   - 使用 GitHub 登入

2. **建立專案**
   - 點擊「Create a project」
   - 專案名稱：`echo`
   - Region：選擇 **Asia Pacific (Singapore)**
   - PostgreSQL version：16（預設）
   - 點擊「Create project」

3. **取得連接字串**
   - 複製顯示的連接字串
   - 格式：`postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb`

4. **填入 .env 並初始化**
   ```bash
   DATABASE_URL="你的neon連接字串"
   npx prisma db push
   npx prisma generate
   npm run dev
   ```

---

### 選項 C：本地 PostgreSQL（需安裝）

**適合：** 想要完全掌控資料庫的開發者

**安裝步驟（macOS）：**

```bash
# 1. 安裝 PostgreSQL
brew install postgresql@15

# 2. 啟動 PostgreSQL 服務
brew services start postgresql@15

# 3. 建立資料庫
createdb echo_dev

# 4. 測試連接
psql echo_dev
# 成功的話會進入 psql shell，輸入 \q 退出

# 5. 設定 .env
DATABASE_URL="postgresql://你的使用者名稱@localhost:5432/echo_dev"

# 6. 初始化
npx prisma db push
npx prisma generate
npm run dev
```

**常見問題：**

```bash
# 如果找不到 createdb 指令
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# 如果連接被拒絕
brew services restart postgresql@15

# 檢查 PostgreSQL 狀態
brew services list | grep postgresql
```

---

## 🔄 從 SQLite 遷移到 PostgreSQL

如果你已經在用 SQLite 開發，想要切換到 PostgreSQL：

**步驟：**

1. **備份現有資料（可選）**
   ```bash
   # 使用 Prisma Studio 匯出資料
   npx prisma studio
   # 手動複製重要資料
   ```

2. **修改 schema**
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"  // 改這裡
     url      = env("DATABASE_URL")
   }
   ```

3. **更新 .env**
   ```bash
   # 改為 PostgreSQL 連接字串
   DATABASE_URL="postgresql://..."
   ```

4. **推送新 schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **重新啟動**
   ```bash
   npm run dev
   ```

6. **重新註冊測試帳號**
   - 資料庫已經清空
   - 需要重新用 OAuth 登入並設定 userId

---

## 🧪 驗證 PostgreSQL 連接

**測試連接：**

```bash
# 方法 1：使用 Prisma Studio
npx prisma studio
# 如果能開啟 http://localhost:5555 就成功了

# 方法 2：建立測試資料
# 訪問 http://localhost:3000
# 登入並發一篇貼文
# 在 Prisma Studio 看是否有資料
```

---

## 📊 三種方案比較

| 方案 | 設定時間 | 費用 | 適合 |
|------|---------|------|------|
| **Supabase** | 5 分鐘 | 免費 | 🌟 最推薦 |
| **Neon** | 5 分鐘 | 免費 | 適合追求速度 |
| **本地 PostgreSQL** | 15 分鐘 | 免費 | 適合進階開發者 |

---

## 🎯 推薦順序

1. **第一選擇：Supabase**
   - 最簡單
   - 有完整管理介面
   - 適合作業和學習

2. **第二選擇：Neon**
   - 快速
   - Serverless 架構

3. **第三選擇：本地 PostgreSQL**
   - 需要安裝
   - 適合已有經驗的開發者

---

**建議：** 如果是第一次使用，直接選 **Supabase**，5 分鐘就能設定完成！

