/**
 * Fallback response templates for when LLM is unavailable
 */

interface FallbackTemplate {
  keywords: string[];
  response: string;
}

const FALLBACK_TEMPLATES: FallbackTemplate[] = [
  {
    keywords: ['你好', 'hello', 'hi', '嗨', '您好'],
    response: '你好！我是你的學習助手，可以幫助你理解概念、整理筆記、回答問題。有什麼我可以幫你的嗎？',
  },
  {
    keywords: ['help', '幫助', '說明', '如何使用'],
    response: '我可以幫助你：\n1. 回答學習相關的問題\n2. 解釋概念\n3. 整理筆記\n\n直接問我問題就可以了！',
  },
  {
    keywords: ['謝謝', 'thank', '感謝'],
    response: '不客氣！如果還有其他問題，隨時可以問我。',
  },
  {
    keywords: ['再見', 'bye', 'bye bye', '拜拜'],
    response: '再見！祝你學習順利，有問題隨時回來找我。',
  },
];

/**
 * Finds a matching fallback response based on user message
 */
export function getFallbackResponse(userMessage: string): string | null {
  const lowerMessage = userMessage.toLowerCase().trim();

  for (const template of FALLBACK_TEMPLATES) {
    if (template.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return template.response;
    }
  }

  // Default fallback if no match found
  return '抱歉，目前服務暫時無法使用，請稍後再試。如果是緊急問題，請稍後再發送一次。';
}

/**
 * Checks if a message matches any fallback template
 */
export function hasFallbackMatch(userMessage: string): boolean {
  return getFallbackResponse(userMessage) !== null;
}

