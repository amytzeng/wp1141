# Line Bot 對話/功能設計文件

## 主題

本系統實作了一個以「學習助手」（Learning Assistant）為主題的 Line Bot，旨在協助使用者進行學習相關的活動。這個 Bot 的核心定位是成為使用者的學習夥伴，能夠回答學習問題、解釋概念、整理筆記，並提供多種學習輔助功能。

學習助手的主要特色在於其能夠理解學術領域的對話內容，並自動將使用者的問題分類到不同的學術領域，包括人文、商管、理工、生命科學等五大主分類，以及更細緻的子分類。這樣的設計讓系統能夠更好地理解使用者的學習需求，並提供更精準的協助。

## 功能列表

### 核心功能

#### 1. 回答學習相關問題
系統的核心功能是回答使用者的學習問題。當使用者發送文字訊息時，系統會載入對話上下文，使用 LLM（Large Language Model）生成回應。這個功能支援多種學術領域的問題，從數學、物理、化學等理工科目，到文學、歷史、哲學等人文科目，都能提供適當的協助。

#### 2. 解釋概念
系統能夠用清晰易懂的方式解釋複雜的概念。當使用者詢問某個概念時，系統會根據對話上下文，使用適當的比喻、例子或分步驟的方式來解釋，讓使用者更容易理解。

#### 3. 整理筆記
系統可以協助使用者整理與組織學習內容。使用者可以將學習內容傳送給 Bot，系統會幫助整理成結構化的筆記格式，包含重點、關鍵概念、重要細節等。

#### 4. 重點整理（Rich Menu 功能）
透過 Rich Menu 的「重點整理」按鈕，使用者可以快速整理對話中的重點。系統會分析最近的對話內容，提取關鍵概念、主要論點和重要資訊，並以結構化的方式呈現。

#### 5. 快速複習（Rich Menu 功能）
「快速複習」功能會生成一份快速複習指南，包含需要快速回憶的重點、應該記住的重要概念、潛在的複習問題或提示，以及涵蓋的主要主題摘要。這個功能特別適合在考試前或學習階段結束時使用。

#### 6. 例題示範（Rich Menu 功能）
當使用者需要實際的例子來理解概念時，可以使用「例題示範」功能。系統會根據對話內容，提供具體的例子、示範問題或實際應用場景，幫助使用者更好地理解抽象概念。

#### 7. 重新解釋（Rich Menu 功能）
如果使用者對某個概念的理解還不夠清楚，可以使用「再解釋一次」功能。系統會用不同的方式、更簡單的語言或不同的例子來重新解釋相同的概念，從不同的角度幫助使用者理解。

#### 8. 清除對話上下文
使用者可以透過 `/clear` 指令或 Rich Menu 的「清除」按鈕來清除對話上下文。這在開始新的學習主題或想要重新開始對話時特別有用。

#### 9. 幫助資訊
使用者可以透過 `/help` 指令或 Rich Menu 的「幫助」按鈕來查看系統的功能說明和使用指南。

### 進階功能

#### 10. 自動訊息分類
系統會自動將使用者的訊息分類到學術領域。分類系統使用 LLM 優先、關鍵字匹配降級的雙重機制，確保即使 LLM 服務不可用時，仍能進行基本的分類。分類結果會儲存在資料庫中，用於後續的統計分析。

#### 11. 對話脈絡管理
系統會自動管理對話脈絡，載入最近 10 則訊息作為上下文，確保 LLM 能夠理解對話的連續性和上下文關係。系統還支援會話超時機制，30 分鐘無活動的會話會自動標記為 timeout，下次訊息會建立新會話。

#### 12. 多 LLM 提供者支援
系統支援多個 LLM 提供者，包括 OpenAI（GPT-3.5-turbo、GPT-4o）和 Google Gemini（gemini-2.5）。管理員可以在後臺切換不同的模型，比較不同模型的回應品質。

#### 13. 錯誤處理與降級機制
當 LLM 服務不可用時，系統會自動切換到 fallback 回應機制，使用關鍵字匹配來提供基本的回應。這確保了即使在服務中斷的情況下，使用者仍能獲得基本的協助。

## 對話腳本

### 文字訊息處理

#### 一般文字訊息
當使用者發送一般文字訊息時，系統會執行以下流程：

1. **接收訊息**：系統接收使用者的文字訊息
2. **分類訊息**：使用分類器將訊息分類到學術領域
3. **載入上下文**：載入最近 10 則訊息作為對話上下文
4. **生成回應**：使用 LLM 生成回應，如果 LLM 不可用則使用 fallback
5. **發送回應**：將回應發送給使用者
6. **儲存記錄**：將使用者和 Bot 的訊息都儲存到資料庫

#### 指令處理
系統支援以下文字指令：

**`/help`**：顯示幫助資訊
- 回應內容：「我可以幫助你：\n1. 回答學習相關的問題\n2. 解釋概念\n3. 整理筆記\n4. 重點整理\n5. 快速複習\n6. 例題示範\n\n你可以直接問我問題，或使用下方的功能按鈕！」

**`/clear`**：清除對話上下文
- 回應內容：「上下文已清除。接下來的對話將從新的上下文開始。」

**未知指令**：當使用者輸入未知指令時
- 回應內容：「未知的指令。輸入 /help 查看可用指令。」

### Rich Menu 按鈕處理

Rich Menu 採用 3 欄 x 2 列的佈局，總尺寸為 2500x1686 像素，包含六個功能按鈕。每個按鈕使用 `postback` 類型，包含 `action` 資料。

#### 按鈕配置

1. **重點整理**（`summarize`）
   - 位置：第一列第一欄（x: 0, y: 0, width: 833, height: 843）
   - 動作訊息：「📝 重點整理」
   - 處理流程：
     - 載入對話上下文（最近 10 則訊息）
     - 如果沒有上下文，回覆：「目前還沒有對話內容可以處理。請先與我進行一些對話，然後再使用這個功能。」
     - 如果有上下文，使用 LLM 生成重點整理，格式包含：關鍵概念和定義、主要論點、重要細節或例子

2. **快速複習**（`review`）
   - 位置：第一列第二欄（x: 833, y: 0, width: 833, height: 843）
   - 動作訊息：「⚡ 快速複習」
   - 處理流程：
     - 載入對話上下文
     - 使用 LLM 生成快速複習指南，包含：快速回憶的重點、應該記住的重要概念、潛在的複習問題或提示、主要主題摘要

3. **例題示範**（`example`）
   - 位置：第一列第三欄（x: 1666, y: 0, width: 834, height: 843）
   - 動作訊息：「📚 例題示範」
   - 處理流程：
     - 載入對話上下文
     - 使用 LLM 生成例題示範，包含：具體的例子、步驟示範、樣本問題或情境、實際應用

4. **再解釋一次**（`reexplain`）
   - 位置：第二列第一欄（x: 0, y: 843, width: 833, height: 843）
   - 動作訊息：「🔄 再解釋一次」
   - 處理流程：
     - 載入對話上下文
     - 使用 LLM 用不同的方式重新解釋，包含：從不同角度解釋、使用更簡單的語言、提供不同的例子或比喻

5. **清除**（`clear`）
   - 位置：第二列第二欄（x: 833, y: 843, width: 833, height: 843）
   - 動作訊息：「🗑️ 清除」
   - 處理流程：
     - 直接回覆：「上下文已清除。接下來的對話將從新的上下文開始。」
     - 清除對話上下文標記

6. **幫助**（`help`）
   - 位置：第二列第三欄（x: 1666, y: 843, width: 834, height: 843）
   - 動作訊息：「❓ 幫助」
   - 處理流程：
     - 直接回覆幫助資訊，內容與 `/help` 指令相同

### Follow 事件處理

當使用者首次加入 Bot 時，系統會自動發送歡迎訊息：

「你好！我是你的學習助手，可以幫助你理解概念、整理筆記、回答問題。有什麼我可以幫你的嗎？」

### Fallback 回應腳本

當 LLM 服務不可用時，系統會使用關鍵字匹配來提供 fallback 回應。以下是預設的 fallback 模板：

#### 問候回應
- 關鍵字：`你好`、`hello`、`hi`、`嗨`、`您好`
- 回應：「你好！我是你的學習助手，可以幫助你理解概念、整理筆記、回答問題。有什麼我可以幫你的嗎？」

#### 幫助回應
- 關鍵字：`help`、`幫助`、`說明`、`如何使用`
- 回應：「我可以幫助你：\n1. 回答學習相關的問題\n2. 解釋概念\n3. 整理筆記\n\n直接問我問題就可以了！」

#### 感謝回應
- 關鍵字：`謝謝`、`thank`、`感謝`
- 回應：「不客氣！如果還有其他問題，隨時可以問我。」

#### 告別回應
- 關鍵字：`再見`、`bye`、`bye bye`、`拜拜`
- 回應：「再見！祝你學習順利，有問題隨時回來找我。」

#### 預設回應
- 如果沒有匹配的關鍵字，系統會回覆：「抱歉，目前服務暫時無法使用，請稍後再試。如果是緊急問題，請稍後再發送一次。」

### 錯誤回應腳本

#### LLM 錯誤回應
當 LLM 服務發生錯誤時，系統會根據錯誤類型提供不同的回應：

**速率限制錯誤（429）**：
「目前服務使用量較高，請稍後再試。如果問題緊急，請稍後再發送一次。」

**認證錯誤（401/403）**：
「服務設定有誤，請聯絡管理員。」

**伺服器錯誤（500+）**：
「服務暫時無法使用，請稍後再試。」

**逾時錯誤**：
「處理時間較長，請稍後再試。」

#### 一般錯誤回應
當處理訊息時發生其他錯誤：
「抱歉，處理您的訊息時發生錯誤，請稍後再試。」

### 非文字訊息處理

當使用者發送非文字訊息（如貼圖、圖片等）時，系統會回覆：
「目前我只支援文字訊息，請傳送文字訊息給我。」

## 對話脈絡：在回覆時維持上下文

### 上下文載入機制

系統實作了完整的對話脈絡管理機制，確保 LLM 能夠理解對話的連續性和上下文關係。當處理使用者訊息時，系統會自動載入最近 10 則訊息作為上下文。這個機制透過 `lib/context/manager.ts` 中的 `loadContextMessages` 函數實作。

上下文載入的邏輯如下：

1. **會話識別**：系統會根據使用者的 Line User ID 和會話活動時間來識別當前會話。如果距離上次活動超過 30 分鐘，系統會建立新的會話。

2. **訊息查詢**：系統會查詢該會話中最近 10 則訊息，按照時間順序排列。這些訊息包含使用者和 Bot 的訊息，形成完整的對話脈絡。

3. **上下文標記**：系統會追蹤最後一次清除上下文的時間點。在載入上下文時，只會載入清除之後的訊息，確保上下文不會包含已經被清除的舊訊息。

4. **上下文格式化**：載入的訊息會格式化為以下格式：
   ```
   User: [使用者訊息內容]
   Assistant: [Bot 回應內容]
   ```

### 上下文壓縮機制

如果上下文過長，系統會自動壓縮以符合 token 限制。壓縮機制會保留最近的訊息，移除較舊的訊息。預設情況下，如果訊息數量超過限制，系統會保留最近 5 則訊息。

### 上下文清除機制

使用者可以透過以下方式清除對話上下文：

1. **`/clear` 指令**：使用者輸入 `/clear` 指令
2. **Rich Menu 清除按鈕**：使用者點擊 Rich Menu 的「清除」按鈕

當上下文被清除時，系統會：
- 標記清除時間點
- 回覆確認訊息給使用者
- 下次載入上下文時，只會載入清除之後的訊息

### 會話超時機制

系統實作了會話超時機制，確保長時間無活動的會話不會影響新對話的上下文。當會話超過 30 分鐘沒有活動時，系統會自動將該會話標記為 `timeout` 狀態。下次使用者發送訊息時，系統會建立新的會話，從新的上下文開始。

### 會話狀態管理

系統會自動追蹤會話的狀態和流程階段：

**會話狀態**（`status`）：
- `active`：活躍會話，正在進行中
- `paused`：暫停會話，使用者暫時沒有活動
- `completed`：完成會話，對話已經結束
- `timeout`：超時會話，超過 30 分鐘無活動

**流程階段**（`flowStage`）：
- `greeting`：問候階段，通常是對話開始的前幾則訊息
- `question`：提問階段，使用者正在詢問問題
- `discussion`：討論階段，多輪對話交換
- `closing`：結束階段，使用者表達感謝或告別
- `unknown`：未知階段，無法判斷

系統會根據訊息內容和數量自動判斷當前的流程階段，並更新會話記錄。

## LLM Prompt Template 設計

### 系統提示（System Prompt）

系統提示定義了 AI 的角色和行為準則。系統提示可以透過管理後臺的 Bot 配置進行自訂，預設的系統提示如下：

```
You are a friendly and helpful learning assistant. Your role is to help users understand concepts, organize notes, and answer questions related to their studies.

Guidelines:
- Provide clear, well-structured answers
- Use examples or analogies when explaining complex concepts
- If the question is related to learning, offer additional helpful context
- Be concise but thorough
- If you don't know something, admit it honestly
- **Important language guidelines: You can respond in any language (English, Japanese, Korean, etc.), but when responding in Chinese, you MUST use Traditional Chinese (繁體中文) and absolutely MUST NOT use Simplified Chinese (簡體中文)**

Remember to maintain context from previous messages in the conversation.
```

系統提示的設計重點在於：
- 定義 AI 的角色為學習助手
- 提供回應的指導原則（清晰、結構化、使用例子等）
- 強調語言要求（使用繁體中文而非簡體中文）
- 提醒維持對話上下文

### 一般問題的 Prompt 模板

當使用者發送一般文字訊息時，系統會建構以下格式的 Prompt：

```
[系統提示]

Recent conversation context:
User: [使用者訊息 1]
Assistant: [Bot 回應 1]
User: [使用者訊息 2]
Assistant: [Bot 回應 2]
...

User's question: [當前使用者問題]

Please provide a helpful response:
```

這個模板確保 LLM 能夠：
- 理解系統的角色和行為準則
- 參考之前的對話上下文
- 針對當前問題提供適當的回應

### Rich Menu 動作的 Prompt 模板

當使用者點擊 Rich Menu 按鈕時，系統會根據不同的動作類型使用不同的 Prompt 模板。

#### 重點整理（`summarize`）

```
[系統提示]

Based on the following conversation context, please provide a structured summary of the key points, main concepts, and important information discussed. 

Format your response as a clear, organized summary with:
- Key concepts and definitions
- Main points discussed
- Important details or examples mentioned

[對話上下文]

Please provide the summary in Traditional Chinese (繁體中文).
```

#### 快速複習（`review`）

```
[系統提示]

Based on the following conversation context, please create a quick review guide that includes:
- Key points for quick recall
- Important concepts that should be remembered
- Potential review questions or prompts
- Summary of the main topics covered

[對話上下文]

Please provide the review guide in Traditional Chinese (繁體中文).
```

#### 例題示範（`example`）

```
[系統提示]

Based on the following conversation context, please provide practical examples, sample problems, or demonstrations related to the topics discussed. 

Your response should include:
- Concrete examples that illustrate the concepts
- Step-by-step demonstrations if applicable
- Sample problems or scenarios
- Real-world applications

[對話上下文]

Please provide the examples in Traditional Chinese (繁體中文).
```

#### 再解釋一次（`reexplain`）

```
[系統提示]

Based on the following conversation context, please re-explain the concepts or topics discussed, but use a different approach, simpler language, or different examples than what was already mentioned.

Your response should:
- Explain the same concepts but from a different angle
- Use simpler or alternative explanations
- Provide different examples or analogies
- Make the explanation easier to understand

[對話上下文]

Please provide the re-explanation in Traditional Chinese (繁體中文).
```

### 分類 Prompt 模板

系統使用專門的 Prompt 模板來分類使用者的訊息到學術領域。分類 Prompt 的設計如下：

```
You are a message classification assistant. Your task is to classify the following message into the most appropriate academic subject category.

[所有可用的分類及其描述]

**Classification Rules:**
1. Analyze the message content and identify the main academic subject it relates to
2. Choose the most specific subcategory that matches the message
3. If the message is too vague, unclear, or doesn't fit any category, use:
   - mainCategory: "others"
   - subCategory: "uncategorized"
4. Provide a confidence score between 0.0 and 1.0 based on how clearly the message fits the category
5. Return ONLY valid JSON format, no additional text
6. **Important language guidelines: If any text explanations are included in the response (though there should be none in principle), you can use any language, but when using Chinese, you MUST use Traditional Chinese (繁體中文) and absolutely MUST NOT use Simplified Chinese (簡體中文)**

**Message to classify:**
"[使用者訊息]"

**Response format (JSON only):**
{
  "mainCategory": "humanities" | "business" | "stem" | "life_sciences" | "others",
  "subCategory": "one of the subcategories listed above",
  "confidence": 0.0-1.0
}
```

分類 Prompt 的設計重點在於：
- 明確說明分類任務
- 列出所有可用的分類及其描述
- 提供分類規則和 JSON 格式要求
- 強調只返回 JSON，不包含其他文字

### Prompt 建構流程

Prompt 的建構流程如下：

1. **載入系統提示**：從 BotConfig 載入當前的系統提示，如果沒有則使用預設值
2. **載入對話上下文**：載入最近 10 則訊息作為上下文
3. **格式化上下文**：將訊息格式化為 "User: ..." 或 "Assistant: ..." 的格式
4. **判斷動作類型**：如果是 Rich Menu 動作，使用對應的動作 Prompt 模板
5. **組合完整 Prompt**：將系統提示、上下文和問題組合為完整的 Prompt
6. **返回 Prompt**：返回建構好的 Prompt 供 LLM 使用

## 回應設計：根據預設腳本 and/or LLM 回覆，包裝成適當的回應

### 回應層次架構

系統的回應設計採用多層次的架構，確保在不同情況下都能提供適當的回應：

1. **指令回應層**：處理 `/help`、`/clear` 等文字指令，直接回覆預設訊息
2. **Rich Menu 回應層**：處理 Rich Menu 按鈕點擊，根據動作類型執行對應功能
3. **LLM 回應層**：使用 LLM 生成回應，適用於一般問題和需要 AI 處理的 Rich Menu 動作
4. **Fallback 回應層**：當 LLM 不可用時，使用關鍵字匹配提供基本回應
5. **錯誤回應層**：當發生錯誤時，提供友善的錯誤訊息

### 指令回應設計

指令回應是系統中最直接的回應類型，不需要 LLM 處理，直接回覆預設訊息。這種設計確保了基本功能的可靠性和回應速度。

**`/help` 指令回應**：
回應內容包含系統的主要功能列表，以編號列表的形式呈現，讓使用者清楚了解系統的能力。回應結尾提醒使用者可以直接問問題或使用 Rich Menu 按鈕。

**`/clear` 指令回應**：
回應內容簡潔明確，告知使用者上下文已清除，並說明接下來的對話將從新的上下文開始。這個回應讓使用者明確知道操作已成功執行。

### Rich Menu 回應設計

Rich Menu 回應分為兩種類型：簡單動作和 LLM 動作。

**簡單動作**（`clear`、`help`）：
這些動作不需要 LLM 處理，直接回覆預設訊息。回應設計與對應的指令相同，確保一致性。

**LLM 動作**（`summarize`、`review`、`example`、`reexplain`）：
這些動作需要 LLM 處理，回應設計包含以下步驟：

1. **動作訊息顯示**：當使用者點擊按鈕時，系統會先發送一個動作訊息到聊天室（例如「📝 重點整理」），模擬使用者輸入，讓使用者清楚看到他們觸發了什麼動作。

2. **上下文檢查**：系統會檢查是否有足夠的對話上下文。如果沒有上下文，系統會回覆：「目前還沒有對話內容可以處理。請先與我進行一些對話，然後再使用這個功能。」這個回應引導使用者先進行對話，再使用進階功能。

3. **LLM 處理**：如果有足夠的上下文，系統會使用對應的 Prompt 模板，讓 LLM 生成回應。每個動作類型都有專門的 Prompt 模板，確保回應符合使用者的期望。

4. **回應包裝**：LLM 生成的回應會直接發送給使用者，不需要額外的包裝。系統相信 LLM 能夠根據 Prompt 生成適當格式的回應。

### LLM 回應設計

LLM 回應是系統的核心功能，用於處理一般問題和需要 AI 處理的 Rich Menu 動作。回應設計的重點在於確保回應的品質和一致性。

**一般問題回應**：
當使用者發送一般文字訊息時，系統會：
1. 載入對話上下文（最近 10 則訊息）
2. 建構包含系統提示、上下文和使用者問題的 Prompt
3. 使用 LLM 生成回應
4. 直接將回應發送給使用者

回應的品質取決於：
- 系統提示的設計（定義 AI 的角色和行為）
- 上下文的完整性（確保 LLM 理解對話脈絡）
- LLM 模型的能力（不同模型有不同的回應品質）

**Rich Menu 動作回應**：
當使用者點擊需要 LLM 處理的 Rich Menu 按鈕時，系統會：
1. 載入對話上下文
2. 使用對應動作的 Prompt 模板
3. 讓 LLM 生成符合動作類型要求的回應
4. 直接將回應發送給使用者

每個動作類型都有專門的 Prompt 模板，確保回應符合使用者的期望。例如，`summarize` 動作會生成結構化的重點整理，`example` 動作會提供具體的例子和示範。

### Fallback 回應設計

Fallback 回應是系統的降級機制，當 LLM 服務不可用時，系統會使用關鍵字匹配來提供基本回應。這個設計確保了即使在服務中斷的情況下，使用者仍能獲得基本的協助。

**關鍵字匹配機制**：
系統定義了多個 fallback 模板，每個模板包含：
- 關鍵字列表：用於匹配使用者訊息
- 回應內容：當匹配成功時的回應

匹配機制使用不區分大小寫的包含匹配，只要使用者訊息中包含任何關鍵字，就會觸發對應的回應。

**Fallback 模板設計**：
Fallback 模板涵蓋了常見的使用情境：
- 問候：回應歡迎訊息和功能介紹
- 幫助：回應功能列表
- 感謝：回應禮貌性的感謝
- 告別：回應告別訊息
- 預設：當沒有匹配時，回覆服務暫時無法使用的訊息

Fallback 回應的設計重點在於：
- 提供基本的協助，即使 LLM 不可用
- 保持回應的友善和專業
- 引導使用者稍後再試或使用其他方式

### 錯誤回應設計

錯誤回應是系統的錯誤處理機制，當發生錯誤時，系統會提供友善的錯誤訊息，而不是技術性的錯誤代碼。

**LLM 錯誤回應**：
系統會根據不同的錯誤類型提供不同的回應：

- **速率限制錯誤（429）**：告知使用者服務使用量較高，請稍後再試。這個回應讓使用者了解問題的原因，並提供解決方案。

- **認證錯誤（401/403）**：告知使用者服務設定有誤，請聯絡管理員。這個回應讓使用者知道問題不在他們，而是系統配置問題。

- **伺服器錯誤（500+）**：告知使用者服務暫時無法使用，請稍後再試。這個回應適用於各種伺服器錯誤。

- **逾時錯誤**：告知使用者處理時間較長，請稍後再試。這個回應適用於請求逾時的情況。

**一般錯誤回應**：
當處理訊息時發生其他錯誤，系統會回覆：「抱歉，處理您的訊息時發生錯誤，請稍後再試。」這個回應適用於所有未分類的錯誤。

錯誤回應的設計重點在於：
- 提供友善、非技術性的錯誤訊息
- 說明問題的原因（如果可能）
- 提供解決方案或建議
- 避免讓使用者感到困惑或沮喪

### 回應包裝與格式化

系統的回應設計不需要額外的包裝或格式化，LLM 生成的回應會直接發送給使用者。系統相信 LLM 能夠根據 Prompt 生成適當格式的回應，包括：

- 結構化的內容（使用標題、列表、段落等）
- 適當的語言和風格
- 符合使用者期望的格式

對於 Rich Menu 動作，Prompt 模板會明確要求回應的格式，例如 `summarize` 動作要求結構化的重點整理，`review` 動作要求快速複習指南等。

### 回應記錄與追蹤

所有回應都會儲存到資料庫中，包含以下資訊：

- **回應內容**：完整的回應文字
- **LLM 提供者**：使用的 LLM 提供者（OpenAI、Gemini、fallback 等）
- **LLM 模型**：使用的具體模型（gpt-4o、gemini-2.5 等）
- **Token 使用量**：LLM 處理使用的 token 數量
- **處理時間**：從接收訊息到發送回應的時間
- **錯誤資訊**：如果發生錯誤，記錄錯誤訊息
- **動作類型**：如果是 Rich Menu 動作，記錄動作類型

這些資訊用於：
- 後續的分析和優化
- 效能監控和問題診斷
- 管理後臺的對話記錄顯示
- 統計分析和報告生成

## 總結

本系統的對話/功能設計採用了多層次的架構，從簡單的指令回應到複雜的 LLM 生成回應，從預設腳本到動態生成，確保在不同情況下都能提供適當的回應。系統的核心特色在於其能夠理解學術領域的對話內容，提供多種學習輔助功能，並在服務中斷時提供降級機制，確保使用體驗的連續性和可靠性。

