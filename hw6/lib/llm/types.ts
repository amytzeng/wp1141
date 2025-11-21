// LLM service type definitions

export interface LLMClient {
  generateResponse(
    prompt: string,
    context?: string[]
  ): Promise<LLMResponse>;
  checkQuota(): Promise<boolean>;
  handleError(error: unknown): LLMErrorInfo;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  error?: string;
}

export interface LLMErrorInfo {
  type: 'rate_limit' | 'server_error' | 'auth_error' | 'timeout' | 'unknown';
  message: string;
  retryable: boolean;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  timeout: number;
}

