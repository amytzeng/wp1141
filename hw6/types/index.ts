// Global type definitions

export interface EnvConfig {
  lineChannelAccessToken: string;
  lineChannelSecret: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiMaxTokens: number;
  openaiTimeout: number;
  mongodbUri: string;
  appUrl: string;
  nodeEnv: string;
  maxRequestsPerMinute?: number;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  error?: string;
}

export interface MessageMetadata {
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
    method: 'keyword' | 'llm' | 'default';
  };
}

