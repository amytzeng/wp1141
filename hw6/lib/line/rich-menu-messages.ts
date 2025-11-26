/**
 * Rich Menu button action messages
 * These messages will be displayed in the chat when users click buttons
 */

import { RichMenuAction } from './types';

/**
 * Action messages that will appear in chat when button is clicked
 */
export const ACTION_MESSAGES: Record<RichMenuAction, string> = {
  summarize: '📝 重點整理',
  review: '⚡ 快速複習',
  example: '📚 例題示範',
  reexplain: '🔄 再解釋一次',
  clear: '🗑️ 清除',
  help: '❓ 幫助',
};

/**
 * Action descriptions for better UX
 * These can be used as prompts or confirmation messages
 */
export const ACTION_DESCRIPTIONS: Record<RichMenuAction, string> = {
  summarize: '正在為您整理重點...',
  review: '正在為您生成快速複習內容...',
  example: '正在為您準備例題示範...',
  reexplain: '正在用不同的方式重新解釋...',
  clear: '已清除對話上下文',
  help: '顯示幫助資訊',
};

