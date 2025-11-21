import OpenAI from 'openai';
import { LLMClient, LLMResponse, LLMErrorInfo, LLMConfig } from '../types';

export class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout,
    });
  }

  /**
   * Generates a response using OpenAI API
   */
  async generateResponse(
    prompt: string,
    context?: string[]
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.7,
      });

      const content =
        completion.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';

      const tokensUsed =
        completion.usage?.total_tokens || estimateTokens(prompt + content);

      return {
        content,
        provider: 'openai',
        model: this.config.model,
        tokensUsed,
      };
    } catch (error) {
      const errorInfo = this.handleError(error);
      return {
        content: getFallbackMessage(errorInfo.type),
        provider: 'openai',
        model: this.config.model,
        error: errorInfo.message,
      };
    }
  }

  /**
   * Checks if API quota is available (simplified check)
   */
  async checkQuota(): Promise<boolean> {
    // In a real implementation, you might check usage from OpenAI dashboard API
    // For now, we'll assume quota is available if API key is set
    return !!this.config.apiKey;
  }

  /**
   * Handles different types of errors from OpenAI API
   */
  handleError(error: unknown): LLMErrorInfo {
    if (error instanceof OpenAI.APIError) {
      // Rate limit error
      if (error.status === 429) {
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again later.',
          retryable: true,
        };
      }

      // Authentication error
      if (error.status === 401 || error.status === 403) {
        return {
          type: 'auth_error',
          message: 'Authentication failed. Please check API key.',
          retryable: false,
        };
      }

      // Server error
      if (error.status >= 500) {
        return {
          type: 'server_error',
          message: 'OpenAI service is temporarily unavailable.',
          retryable: true,
        };
      }
    }

    // Timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timed out. Please try again.',
        retryable: true,
      };
    }

    // Unknown error
    return {
      type: 'unknown',
      message:
        error instanceof Error ? error.message : 'An unknown error occurred.',
      retryable: false,
    };
  }
}

/**
 * Estimates token count (rough approximation)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Returns a fallback message based on error type
 */
function getFallbackMessage(errorType: LLMErrorInfo['type']): string {
  switch (errorType) {
    case 'rate_limit':
      return '目前服務使用量較高，請稍後再試。如果問題緊急，請稍後再發送一次。';
    case 'server_error':
      return '服務暫時無法使用，請稍後再試。';
    case 'auth_error':
      return '服務設定有誤，請聯絡管理員。';
    case 'timeout':
      return '處理時間較長，請稍後再試。';
    default:
      return '抱歉，目前無法處理您的請求，請稍後再試。';
  }
}

