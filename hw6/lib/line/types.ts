// Line Messaging API type definitions

/**
 * Action types for Rich Menu buttons
 */
export type RichMenuAction = 
  | 'summarize'      // 重點整理
  | 'review'         // 快速複習
  | 'example'        // 例題示範
  | 'reexplain'      // 再解釋一次
  | 'clear'          // 清除上下文
  | 'help';          // 幫助

/**
 * Postback data structure
 */
export interface PostbackData {
  action: RichMenuAction;
}

export interface LineEvent {
  type: string;
  replyToken?: string;
  source: {
    type: string;
    userId: string;
  };
  message?: {
    type: string;
    id: string;
    text?: string;
  };
  postback?: {
    data: string; // JSON string of PostbackData
    params?: {
      datetime?: string;
      date?: string;
      time?: string;
    };
  };
  timestamp: number;
}

export interface LineWebhookBody {
  events: LineEvent[];
}

