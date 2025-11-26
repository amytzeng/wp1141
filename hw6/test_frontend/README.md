# 前端測試資料夾

此資料夾包含所有前端測試相關的檔案，包括測試檔案、設定檔、測試資料和文件。

## 資料夾結構

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
│   └── api/                  # API 封裝函數測試
│       └── conversations.test.ts
├── components/                # 組件測試
│   └── admin/                # 管理後臺組件測試
│       ├── ConversationTable.test.tsx
│       ├── CategoryBadge.test.tsx
│       ├── StatCard.test.tsx
│       └── BotConfigForm.test.tsx
├── app/                       # 頁面組件測試
│   └── admin/
│       └── conversations/
│           └── page.test.tsx
├── vitest.config.ts          # Vitest 測試設定檔
├── test.md                   # 詳細測試文件
└── README.md                 # 本檔案
```

## 執行測試

從專案根目錄執行以下指令：

```bash
# Watch 模式（檔案變更時自動重新執行）
npm test

# 開啟測試 UI
npm run test:ui

# 執行一次完整測試
npm run test:run

# 執行測試並產生覆蓋率報告
npm run test:coverage
```

所有測試腳本都會自動使用 `test_frontend/vitest.config.ts` 設定檔。

## 覆蓋率報告

執行 `npm run test:coverage` 後，覆蓋率報告會產生在專案根目錄的 `coverage/` 資料夾中。

## 詳細文件

請參考 `test.md` 檔案以獲取完整的測試文件，包括：
- 測試架構說明
- 各測試檔案的詳細說明
- 測試執行方式
- 疑難排解指南

