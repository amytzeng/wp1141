# 前端測試文件

本文檔說明專案的前端測試架構、測試範圍、執行方式以及測試結果。

## 測試架構概述

本專案使用 Vitest 作為測試框架，搭配 React Testing Library 進行 React 組件測試。測試環境設定為 jsdom，模擬瀏覽器環境以執行前端測試。所有測試相關檔案（包括測試檔案、設定檔、測試資料和文件）統一放置在 `test_frontend` 資料夾中，便於管理和維護。此資料夾是一個自包含的測試模組，包含執行測試所需的所有資源。

### 測試工具與依賴

專案使用以下測試相關套件：

- **Vitest**：核心測試框架，提供快速的測試執行和 watch 模式
- **@testing-library/react**：React 組件測試工具，提供渲染和查詢功能
- **@testing-library/jest-dom**：擴充 DOM 斷言方法，提供語意化的斷言函數
- **@testing-library/user-event**：模擬使用者互動行為，如點擊、輸入等
- **@vitest/coverage-v8**：測試覆蓋率工具，使用 V8 引擎產生覆蓋率報告
- **jsdom**：模擬瀏覽器 DOM 環境，讓測試能在 Node.js 環境中執行

## 測試檔案結構

```
test_frontend/
├── setup/
│   └── test-setup.ts          # 測試環境初始化設定
├── fixtures/
│   ├── conversations.ts        # 對話相關測試資料
│   ├── botConfig.ts            # Bot 配置相關測試資料
│   └── index.ts                # Fixtures 統一匯出
├── lib/
│   ├── utils/
│   │   ├── date.test.ts        # 日期工具函數測試
│   │   └── format.test.ts      # 格式化工具函數測試
│   └── api/
│       └── conversations.test.ts  # API 封裝函數測試
├── components/
│   └── admin/
│       ├── ConversationTable.test.tsx    # 對話列表表格組件測試
│       ├── CategoryBadge.test.tsx       # 分類標籤組件測試
│       ├── StatCard.test.tsx             # 統計卡片組件測試
│       └── BotConfigForm.test.tsx        # Bot 配置表單組件測試
├── app/
│   └── admin/
│       └── conversations/
│           └── page.test.tsx             # 對話列表頁面測試
├── vitest.config.ts            # Vitest 測試設定檔
└── test.md                     # 本測試文件
```

## 測試執行方式

### 基本指令

專案在 `package.json` 中定義了以下測試腳本，所有指令都會自動使用 `test_frontend/vitest.config.ts` 設定檔：

```bash
# 執行測試（watch 模式，檔案變更時自動重新執行）
npm test

# 開啟測試 UI 介面（視覺化測試結果）
npm run test:ui

# 執行一次完整測試（不進入 watch 模式）
npm run test:run

# 執行測試並產生覆蓋率報告
npm run test:coverage
```

所有測試腳本都會自動指向 `test_frontend/vitest.config.ts` 設定檔，因此測試會從 `test_frontend` 資料夾中執行。

### 執行特定測試檔案

如果需要執行特定測試檔案，可以在命令列中指定檔案路徑（相對於專案根目錄）：

```bash
# 執行單一測試檔案
npm run test:run test_frontend/lib/utils/date.test.ts

# 執行特定資料夾下的所有測試
npm run test:run test_frontend/components/admin/

# 執行符合特定模式的測試檔案
npm run test:run -- --grep "formatDate"
```

由於設定檔已指定測試檔案匹配模式，所有測試檔案都會自動被包含在測試範圍內。

### 覆蓋率報告

執行覆蓋率測試後，會產生三種格式的報告，報告檔案會存放在專案根目錄的 `coverage/` 資料夾中：

- **文字報告**：在終端機直接顯示覆蓋率摘要
- **JSON 報告**：`coverage/coverage-summary.json`
- **HTML 報告**：`coverage/index.html`（可在瀏覽器中開啟查看詳細報告）

覆蓋率報告會分析專案原始碼（排除測試檔案、設定檔、型別定義檔等），顯示程式碼被測試覆蓋的比例。

## 測試設定檔說明

### vitest.config.ts

此設定檔位於 `test_frontend/` 資料夾中，定義了 Vitest 的執行環境和測試範圍。主要設定包括：

- **測試環境**：設定為 `jsdom`，模擬瀏覽器 DOM 環境
- **測試檔案匹配**：`./**/*.{test,spec}.{ts,tsx}`（相對於 test_frontend 資料夾）
- **路徑別名解析**：支援 `@/` 路徑別名，對應到專案根目錄（`../`）
- **覆蓋率設定**：使用 V8 引擎，排除 `node_modules`、測試檔案、型別定義檔、設定檔和 fixtures 等

### test_frontend/setup/test-setup.ts

此檔案負責測試環境的初始化設定，包含以下內容：

- **Jest DOM 擴充**：引入 `@testing-library/jest-dom`，提供語意化斷言方法
- **Next.js Router Mock**：模擬 `next/navigation` 模組，提供 `useRouter`、`usePathname` 等 hook 的 mock 實作
- **CSS Modules Mock**：將所有 CSS 類別名稱統一轉換為 mock 字串
- **ResizeObserver Mock**：模擬瀏覽器 ResizeObserver API

## 測試資料（Fixtures）

### test_frontend/fixtures/conversations.ts

此檔案提供對話相關的測試資料，包含：

- **mockConversation**：單一對話物件的範本，包含對話 ID、使用者 ID、會話狀態、訊息數量等完整欄位
- **mockConversations**：多筆不同狀態的對話資料陣列，用於測試列表渲染和篩選功能
- **mockMessage** 和 **mockMessages**：訊息層級的測試資料，包含使用者訊息和 Bot 回覆，以及分類資訊、LLM 使用情況等中繼資料
- **mockConversationDetail**：組合對話和訊息資料的完整物件，用於測試對話詳情頁面
- **createMockConversation** 和 **createMockMessage**：Factory 函數，用於動態產生客製化的測試資料

### test_frontend/fixtures/botConfig.ts

此檔案提供 Bot 配置相關的測試資料，包含：

- **mockBotConfig**：完整的 Bot 配置物件，包含系統提示詞、個性設定、回應規則等
- **mockBotConfigInput**：使用者輸入的配置資料格式
- **defaultBotConfig**：預設配置值，用於測試表單初始化
- **createMockBotConfig**：Factory 函數，用於動態產生測試資料

## 工具函數測試

### test_frontend/lib/utils/date.test.ts

此檔案測試日期相關的工具函數，共包含 17 個測試案例。

**formatDate 函數測試**

測試驗證 `formatDate` 函數能正確將 Date 物件和 ISO 字串轉換為 `yyyy-MM-dd HH:mm:ss` 格式的字串。測試涵蓋不同時區的處理，確保無論在何種時區環境下執行測試都能得到正確的日期格式。

**formatDateOnly 函數測試**

測試驗證 `formatDateOnly` 函數能正確提取日期部分，忽略時間資訊，輸出格式為 `yyyy-MM-dd`。測試同時驗證 Date 物件和 ISO 字串兩種輸入格式的處理。

**formatRelativeTime 函數測試**

此函數的測試涵蓋多種相對時間顯示情境。測試驗證當時間少於 1 分鐘時顯示「剛剛」，少於 1 小時時顯示「X 分鐘前」，今天內顯示「X 小時前」，昨天顯示「昨天」，一週內顯示「X 天前」，超過一週則使用 `date-fns` 的 `formatDistanceToNow` 函數顯示相對時間。測試使用 `vi.useFakeTimers()` 模擬系統時間，確保測試結果的一致性。

**getDateRange 函數測試**

測試驗證 `getDateRange` 函數能正確計算週範圍（從週一開始到週日結束）和月範圍（從月初到月底）。測試同時驗證當傳入無效類型時函數能優雅降級，返回當前日期作為起訖日期。

**formatDateRange 函數測試**

測試驗證 `formatDateRange` 函數能正確格式化日期範圍，同時支援 Date 物件和字串輸入，輸出為 ISO 格式的字串。

### test_frontend/lib/utils/format.test.ts

此檔案測試格式化相關的工具函數，共包含 17 個測試案例。

**formatNumber 函數測試**

測試驗證 `formatNumber` 函數能正確為數字加入千位分隔符，使用繁體中文地區的格式（逗號作為分隔符）。測試涵蓋零值、負數、小數等各種邊界情況的處理。

**formatPercentage 函數測試**

測試驗證 `formatPercentage` 函數能正確格式化百分比，支援預設和自訂小數位數。測試確保零值和負數也能正確處理，輸出格式為「XX.X%」。

**getCategoryDisplayName 函數測試**

此函數的測試涵蓋所有主要分類和子分類的顯示名稱轉換。測試驗證當只提供主要分類時能正確顯示主要分類名稱（如「文史哲」、「商管經濟」等），當提供子分類時能顯示子分類名稱（如「中國文學」、「經濟學」等）。測試包含所有定義的分類組合，並驗證當分類不存在時能優雅降級，顯示原始分類名稱或組合格式。

**truncateText 函數測試**

測試驗證 `truncateText` 函數能正確截斷過長文字並加上省略號。測試確保當文字長度在限制內時返回原始文字，超過限制時截斷並加上「...」。測試涵蓋空字串、剛好等於長度的文字、非常長的文字等邊界情況。

## API 封裝函數測試

### test_frontend/lib/api/conversations.test.ts

此檔案測試對話相關的 API 封裝函數，共包含 13 個測試案例。所有測試都使用 `vi.fn()` 模擬 `fetch` API，確保測試不會發送實際的網路請求。

**getConversations 函數測試**

測試涵蓋多種 API 呼叫情境。測試驗證使用預設參數時能正確呼叫 API，使用分頁參數（page、limit）時 URL 參數能正確組裝，使用篩選參數（lineUserId、search、startDate、endDate）時所有參數都能正確傳遞。測試同時驗證當 API 回傳錯誤狀態碼時能正確拋出錯誤，當發生網路錯誤時也能正確處理。

**getConversationById 函數測試**

測試驗證能正確根據對話 ID 取得對話詳情，URL 路徑能正確組裝。測試特別處理 404 錯誤情況，確保能拋出「Conversation not found」的明確錯誤訊息，其他錯誤情況則拋出通用的錯誤訊息。

**getUsers 函數測試**

測試驗證能正確取得使用者列表，API 端點路徑正確。測試同時驗證當 API 呼叫失敗時能正確拋出錯誤。

**getUserConversations 函數測試**

測試驗證能正確取得特定使用者的對話列表，URL 路徑包含使用者 ID。測試特別處理使用者不存在的情況（404 錯誤），確保能拋出「User not found」的明確錯誤訊息，其他錯誤情況則拋出通用的錯誤訊息。

## 組件測試

### test_frontend/components/admin/ConversationTable.test.tsx

此檔案測試對話列表表格組件，驗證表格的渲染邏輯和使用者互動。

**渲染測試**

測試驗證表格能正確渲染所有表頭欄位，包括使用者 ID、最後訊息時間、訊息數量、建立時間、操作等欄位。測試驗證當提供多筆對話資料時，表格能正確顯示所有對話列，包含使用者 ID、格式化後的時間、訊息數量等資訊。

**空狀態測試**

測試驗證當對話列表為空陣列時，表格能正確顯示「沒有找到對話記錄」的提示訊息，並且該訊息正確跨越所有欄位（使用 `colSpan`）。

**互動測試**

測試驗證點擊「查看詳情」按鈕時能正確呼叫 `onViewDetail` callback 函數，並且傳入正確的對話 ID。測試確保每個對話列都有獨立的按鈕，點擊不同按鈕時能傳入對應的對話 ID。

**資料顯示邏輯測試**

測試驗證訊息數量的顯示邏輯，優先使用 `actualMessageCount` 欄位，如果該欄位不存在則回退到 `messageCount` 欄位。這確保了向後相容性和資料完整性。

### test_frontend/components/admin/CategoryBadge.test.tsx

此檔案測試分類標籤組件，共包含 8 個測試案例。

**主要分類顯示測試**

測試驗證能正確顯示所有主要分類的名稱，包括「文史哲」、「商管經濟」、「數理科學」、「生物醫學」、「其他」等。測試確保分類名稱能正確從英文代碼轉換為中文顯示名稱。

**子分類顯示測試**

測試驗證當提供子分類參數時能正確顯示子分類名稱，而不是主要分類名稱。測試涵蓋所有定義的子分類組合，確保每個子分類都能正確顯示對應的中文名稱。

**數量顯示測試**

測試驗證當提供 `count` 參數時，標籤能正確顯示數量，格式為「分類名稱 (數量)」。測試同時驗證當 `count` 為 `undefined` 時不會顯示數量括號，保持標籤的簡潔性。

**未知分類處理測試**

測試驗證當傳入未知的分類代碼時，組件能優雅降級，顯示原始的分類代碼或組合格式，而不會導致錯誤。

### test_frontend/components/admin/StatCard.test.tsx

此檔案測試統計卡片組件，共包含 8 個測試案例。

**基本渲染測試**

測試驗證組件能正確顯示標籤和數值，同時支援數字和字串類型的值。測試確保標籤和數值都能正確渲染在對應的位置。

**數字格式化測試**

測試驗證數字格式化功能，確保大數字能正確加入千位分隔符。例如 1234567 應顯示為「1,234,567」，使用繁體中文地區的數字格式。

**變化指標測試**

測試驗證當提供 `change` 參數時，組件能正確顯示變化指標（如「+10%」或「-5%」）。測試同時驗證當不提供 `change` 參數時，組件不會顯示變化資訊，保持介面的簡潔性。

**邊界情況測試**

測試涵蓋零值、負數、小數等各種邊界情況的處理，確保組件在各種資料情況下都能正確顯示。

### test_frontend/components/admin/BotConfigForm.test.tsx

此檔案測試 Bot 配置表單組件，共包含 14 個測試案例，是組件測試中最複雜的一個。

**表單初始化測試**

測試驗證當沒有提供 `config` prop 時，表單能正確使用預設配置初始化所有欄位，包括 systemPrompt、personality、enableFallback、maxResponseLength、temperature、customInstructions 等。測試同時驗證當提供 `config` prop 時，表單能正確填入現有配置值，使用 `useEffect` hook 同步配置變更。

**表單欄位更新測試**

測試涵蓋所有表單欄位的更新功能。文字輸入框（systemPrompt、personality）的測試驗證使用者輸入能正確更新表單狀態。數字輸入框（maxResponseLength）的測試驗證數字輸入和格式化。滑桿（temperature）的測試驗證滑動操作能正確更新數值。勾選框（enableFallback）的測試驗證切換功能。文字區域（customInstructions）的測試驗證多行文字輸入。

**表單提交測試**

測試驗證點擊「儲存配置」按鈕時能正確觸發表單提交，呼叫 `onSave` callback 函數並傳入正確的表單資料。測試確保表單資料的結構完整，包含所有必要的欄位和嵌套的 `responseRules` 物件。

**載入狀態測試**

測試驗證當 `loading` prop 為 `true` 時，提交按鈕應顯示「儲存中...」文字並被禁用，防止重複提交。測試確保載入狀態的視覺回饋正確。

**重置功能測試**

測試涵蓋兩種重置功能。「重置表單」按鈕的測試驗證點擊時會顯示確認對話框，確認後表單會還原為原始配置值（如果有提供 `config`）或預設配置值。「還原為預設模式」按鈕的測試驗證點擊時會顯示確認對話框，確認後表單會還原為預設配置。測試同時驗證當使用者取消確認對話框時，表單不會被重置。

**表單驗證測試**

測試驗證表單的 HTML5 驗證功能，確保必填欄位（systemPrompt、personality）在為空時會觸發瀏覽器的原生驗證，阻止表單提交。測試使用 `toBeInvalid()` 斷言驗證欄位的驗證狀態。

## 頁面組件測試

### test_frontend/app/admin/conversations/page.test.tsx

此檔案測試對話列表頁面組件，驗證完整的頁面功能和使用者流程。

**頁面渲染測試**

測試驗證頁面能正確渲染標題「對話列表」和所有篩選輸入框，包括使用者 ID 搜尋框、關鍵字搜尋框、開始日期選擇器、結束日期選擇器，以及搜尋按鈕。測試確保所有 UI 元素都能正確顯示。

**資料載入測試**

測試驗證頁面掛載時（`useEffect` hook 執行）能自動呼叫 `getConversations` API，使用預設的分頁參數。測試驗證載入中狀態能正確顯示「載入中...」提示，載入完成後能正確顯示對話列表資料。測試使用 `waitFor` 確保非同步操作的完成。

**錯誤處理測試**

測試驗證當 API 呼叫失敗時（例如網路錯誤或伺服器錯誤），頁面能正確顯示錯誤訊息，而不會導致應用程式崩潰。測試確保錯誤訊息能正確顯示在使用者可見的位置。

**篩選功能測試**

測試涵蓋多種篩選情境。根據使用者 ID 篩選的測試驗證輸入使用者 ID 並點擊搜尋按鈕時，API 呼叫能包含正確的 `lineUserId` 參數。根據關鍵字篩選的測試驗證輸入關鍵字時能正確傳遞 `search` 參數。根據日期範圍篩選的測試驗證選擇開始日期和結束日期時能正確傳遞 `startDate` 和 `endDate` 參數。測試同時驗證按下 Enter 鍵時也能觸發搜尋功能。

**分頁功能測試**

測試驗證當有多頁資料時，頁面能正確顯示分頁按鈕，包括「上一頁」、「下一頁」和頁碼按鈕。測試驗證點擊「下一頁」按鈕時能正確更新頁碼並重新載入資料，點擊「上一頁」按鈕時也能正確更新頁碼。測試確保在第一頁時「上一頁」按鈕被禁用，在最後一頁時「下一頁」按鈕被禁用，防止使用者導航到無效的頁面。

**導航功能測試**

測試驗證點擊對話表格中的「查看詳情」按鈕時，頁面能正確呼叫 Next.js 的 `router.push` 方法進行頁面導航。測試使用 `vi.mock` 模擬 `useRouter` hook，確保測試不會觸發實際的路由導航。

**Mock 設定**

所有測試都使用 `vi.mock` 模擬 Next.js 的 `useRouter` hook 和 API 模組，確保測試的獨立性和可重複性。測試使用 `vi.spyOn` 監控 API 函數的呼叫，驗證參數傳遞的正確性。

## 測試結果

### 執行統計

根據最新測試執行結果：

- **測試檔案數**：8 個全部通過
- **測試案例數**：97 個全部通過
- **執行時間**：約 2.15 秒
- **Lint 錯誤**：無

```
Test Files  8 passed (8)
Tests       97 passed (97)
Duration    2.15s (transform 424ms, setup 453ms, collect 6.53s, tests 1.24s, environment 2.65s, prepare 41ms)
```

### 測試覆蓋範圍

測試架構涵蓋了以下層面：

1. **工具函數層**：確保核心邏輯的正確性，包括日期格式化、數字格式化、文字處理等
2. **API 封裝層**：驗證與後端 API 的互動邏輯，包括參數組裝、錯誤處理等
3. **組件層**：確保 UI 組件的渲染邏輯和使用者互動的正確性
4. **頁面層**：驗證完整的使用者流程和頁面功能整合

### 測試品質保證

所有測試都遵循以下原則：

- **獨立性**：每個測試都是獨立的，不依賴其他測試的執行順序或狀態
- **可重複性**：使用 mock 技術隔離外部依賴，確保測試結果的一致性
- **可維護性**：使用 fixtures 統一管理測試資料，使用 factory 函數動態產生測試資料
- **語意化**：使用 React Testing Library 的語意化查詢方法，確保測試接近真實使用者行為

## 持續整合建議

建議在 CI/CD 流程中加入測試執行步驟：

```yaml
# 範例 GitHub Actions 設定
- name: Run tests
  run: npm run test:run

- name: Generate coverage report
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

這樣可以確保每次程式碼提交都通過所有測試，並追蹤測試覆蓋率的變化趨勢。

## 維護建議

1. **新增功能時**：應同步新增對應的測試案例，確保新功能的正確性
2. **修改功能時**：應更新相關的測試案例，確保測試反映最新的功能行為
3. **重構程式碼時**：應確保所有測試仍然通過，測試可以作為重構的安全網
4. **定期檢視**：定期檢視測試覆蓋率報告，識別未被測試的程式碼區域

## 疑難排解

### 常見問題

**問題：測試執行時出現路徑別名解析錯誤**

解決方案：確認 `test_frontend/vitest.config.ts` 中的 `resolve.alias` 設定正確，`@` 別名應對應到專案根目錄（`path.resolve(__dirname, '../')`）。

**問題：測試中使用 Next.js hook 時出現錯誤**

解決方案：確認 `test_frontend/setup/test-setup.ts` 中已正確 mock `next/navigation` 模組。

**問題：CSS Modules 類別名稱無法匹配**

解決方案：確認 `test-setup.ts` 中已設定 CSS Modules 的 mock，將所有類別名稱統一轉換。

**問題：測試執行時間過長**

解決方案：檢查是否有不必要的非同步操作，使用 `waitFor` 時設定適當的 timeout，避免無限等待。

## 結論

本專案建立了完整的前端測試架構，涵蓋從工具函數到頁面組件的各個層面。測試使用現代化的測試工具和最佳實踐，確保程式碼品質和功能正確性。透過持續執行測試，可以及早發現問題，提高開發效率和程式碼可靠性。

