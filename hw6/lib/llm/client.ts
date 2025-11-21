import { OpenAIClient } from './providers/openai';
import { LLMClient, LLMConfig } from './types';

/**
 * Creates and returns an LLM client based on environment configuration
 */
export function createLLMClient(): LLMClient {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10);
  const timeout = parseInt(process.env.OPENAI_TIMEOUT || '10000', 10);

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  const config: LLMConfig = {
    apiKey,
    model,
    maxTokens,
    timeout,
  };

  // For now, we only support OpenAI
  // In the future, we can add other providers here
  return new OpenAIClient(config);
}

/**
 * Singleton instance of LLM client
 */
let llmClientInstance: LLMClient | null = null;

/**
 * Gets or creates the LLM client instance
 */
export function getLLMClient(): LLMClient {
  if (!llmClientInstance) {
    llmClientInstance = createLLMClient();
  }
  return llmClientInstance;
}

