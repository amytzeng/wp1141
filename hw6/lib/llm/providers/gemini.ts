import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMClient, LLMResponse, LLMErrorInfo, LLMConfig } from '../types';
import BotConfig from '@/lib/db/models/BotConfig';

export class GeminiClient implements LLMClient {
  private genAI: GoogleGenerativeAI;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  /**
   * Gets the model from BotConfig or falls back to config
   */
  private async getModel(): Promise<string> {
    try {
      const config = await BotConfig.findOne({ isActive: true }).lean().exec();
      if (config?.responseRules?.model) {
        return config.responseRules.model;
      }
    } catch (error) {
      console.error('Error fetching bot config for model:', error);
    }
    // Fallback to config model (from environment variable or default)
    return this.config.model;
  }

  /**
   * Generates a response using Gemini API
   */
  async generateResponse(
    prompt: string,
    context?: string[],
    options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const systemPrompt =
        options?.systemPrompt ||
        'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.';
      const temperature = options?.temperature ?? 0.7;
      const maxTokens = options?.maxTokens ?? this.config.maxTokens;

      // Get model from BotConfig or fallback to config
      const modelName = await this.getModel();
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      // Combine system prompt with user prompt
      // Gemini doesn't have a separate system message, so we prepend it to the user message
      const fullPrompt = context && context.length > 0
        ? `${systemPrompt}\n\nContext:\n${context.join('\n')}\n\nUser: ${prompt}`
        : `${systemPrompt}\n\nUser: ${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const content = response.text() || 'Sorry, I could not generate a response.';

      // Try to get token usage from response
      let tokensUsed: number | undefined;
      if (response.usageMetadata) {
        tokensUsed = (response.usageMetadata.promptTokenCount || 0) +
                     (response.usageMetadata.candidatesTokenCount || 0) +
                     (response.usageMetadata.totalTokenCount || 0);
        // Use totalTokenCount if available, otherwise sum
        if (response.usageMetadata.totalTokenCount) {
          tokensUsed = response.usageMetadata.totalTokenCount;
        }
      } else {
        // Fallback estimation
        tokensUsed = estimateTokens(fullPrompt + content);
      }

      return {
        content,
        provider: 'gemini',
        model: modelName,
        tokensUsed,
      };
    } catch (error) {
      const errorInfo = this.handleError(error);
      // Use config model as fallback for error response
      return {
        content: getFallbackMessage(errorInfo.type),
        provider: 'gemini',
        model: this.config.model,
        error: errorInfo.message,
      };
    }
  }

  /**
   * Checks if API quota is available (simplified check)
   */
  async checkQuota(): Promise<boolean> {
    // In a real implementation, you might check usage from Gemini API
    // For now, we'll assume quota is available if API key is set
    return !!this.config.apiKey;
  }

  /**
   * Handles different types of errors from Gemini API
   */
  handleError(error: unknown): LLMErrorInfo {
    // Check for Google API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;

      // Rate limit error
      if (status === 429) {
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again later.',
          retryable: true,
        };
      }

      // Authentication error
      if (status === 401 || status === 403) {
        return {
          type: 'auth_error',
          message: 'Authentication failed. Please check API key.',
          retryable: false,
        };
      }

      // Server error
      if (status >= 500) {
        return {
          type: 'server_error',
          message: 'Gemini service is temporarily unavailable.',
          retryable: true,
        };
      }
    }

    // Check for error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Rate limit in message
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please try again later.',
          retryable: true,
        };
      }

      // Authentication in message
      if (errorMessage.includes('api key') || errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        return {
          type: 'auth_error',
          message: 'Authentication failed. Please check API key.',
          retryable: false,
        };
      }

      // Timeout error
      if (errorMessage.includes('timeout')) {
        return {
          type: 'timeout',
          message: 'Request timed out. Please try again.',
          retryable: true,
        };
      }
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

