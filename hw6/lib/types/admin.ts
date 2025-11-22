// Admin dashboard type definitions

export interface Conversation {
  _id: string;
  lineUserId: string;
  sessionId: string;
  status: 'active' | 'paused' | 'completed' | 'timeout';
  flowStage?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastActivityAt: string;
  actualMessageCount?: number;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Message {
  _id: string;
  conversationId: string;
  lineUserId: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  metadata: {
    messageId?: string;
    replyToken?: string;
    llmProvider?: string;
    llmModel?: string;
    tokensUsed?: number;
    error?: string;
    processingTime?: number;
    category?: {
      mainCategory: string;
      subCategory: string;
      confidence: number;
      method: string;
    };
  };
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
  messageCount: number;
}

export interface User {
  lineUserId: string;
  conversationCount: number;
  messageCount: number;
  lastActivityAt: string;
}

export interface UserListResponse {
  users: User[];
}

export interface UserConversationsResponse {
  userId: string;
  conversations: Array<{
    _id: string;
    sessionId: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    firstUserMessage: string;
  }>;
}

export interface StatsResponse {
  overview: {
    totalMessages: number;
    totalUsers: number;
    totalConversations: number;
    todayMessages: number;
    successRate: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
    engagement: {
      avgMessagesPerUser: number;
      maxMessagesPerUser: number;
      minMessagesPerUser: number;
    };
    topUsers: Array<{
      lineUserId: string;
      messageCount: number;
      lastActivity: string;
    }>;
    growthTrend: Array<{
      date: string;
      newUsers: number;
    }>;
  };
  llmUsage: Array<{
    _id: string;
    count: number;
    totalTokens: number;
    errors: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface CategoryStats {
  count: number;
  percentage: number;
}

export interface CategoryStatsResponse {
  overview: {
    total: number;
    categorized: number;
    uncategorized: number;
    categorizationRate: number;
  };
  byMainCategory: Record<string, CategoryStats>;
  bySubCategory: Record<string, CategoryStats & { mainCategory: string }>;
  trends: Array<{
    date: string;
    categories: Record<string, number>;
  }>;
  categoryDefinitions: Array<{
    mainCategory: string;
    subCategory: string;
    displayName: {
      zh: string;
      en: string;
    };
  }>;
}

export interface BotConfig {
  _id: string;
  systemPrompt: string;
  personality: string;
  responseRules: {
    enableFallback: boolean;
    maxResponseLength?: number;
    temperature?: number;
    customInstructions?: string;
  };
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface BotConfigResponse {
  config: BotConfig;
}

export interface BotConfigInput {
  systemPrompt: string;
  personality: string;
  responseRules: {
    enableFallback: boolean;
    maxResponseLength?: number;
    temperature?: number;
    customInstructions?: string;
  };
}

export interface BotConfigHistoryItem extends BotConfig {}

export interface BotConfigHistoryResponse {
  configs: BotConfigHistoryItem[];
}

