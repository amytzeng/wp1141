import { OpenAIClient } from './providers/openai';
import { GeminiClient } from './providers/gemini';
import { LLMClient, LLMConfig, LLMProvider } from './types';
import BotConfig from '@/lib/db/models/BotConfig';

/**
 * Gets the provider from BotConfig or falls back to environment/default
 */
async function getProvider(): Promise<LLMProvider> {
  try {
    const config = await BotConfig.findOne({ isActive: true }).lean().exec();
    if (config?.responseRules?.provider) {
      return config.responseRules.provider;
    }
  } catch (error) {
    console.error('Error fetching bot config for provider:', error);
  }
  
  // Fallback to environment variable or default to openai
  const envProvider = process.env.LLM_PROVIDER as LLMProvider;
  if (envProvider === 'openai' || envProvider === 'gemini') {
    return envProvider;
  }
  
  // Default to openai for backward compatibility
  return 'openai';
}

/**
 * Creates and returns an LLM client based on provider configuration
 */
export async function createLLMClient(): Promise<LLMClient> {
  const provider = await getProvider();

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5';
    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '500', 10);
    const timeout = parseInt(process.env.GEMINI_TIMEOUT || '10000', 10);

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const config: LLMConfig = {
      provider: 'gemini',
      apiKey,
      model,
      maxTokens,
      timeout,
    };

    return new GeminiClient(config);
  } else {
    // Default to OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
  const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10);
  const timeout = parseInt(process.env.OPENAI_TIMEOUT || '10000', 10);

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  const config: LLMConfig = {
      provider: 'openai',
    apiKey,
    model,
    maxTokens,
    timeout,
  };

  return new OpenAIClient(config);
  }
}

/**
 * Cache for LLM client instances by provider
 */
const clientCache: Map<LLMProvider, LLMClient> = new Map();

/**
 * Gets or creates the LLM client instance
 * Caches clients by provider to support dynamic switching
 */
export async function getLLMClient(): Promise<LLMClient> {
  const provider = await getProvider();
  
  // Return cached client if it exists and matches current provider
  if (clientCache.has(provider)) {
    return clientCache.get(provider)!;
  }

  // Create new client for the provider
  const client = await createLLMClient();
  clientCache.set(provider, client);
  
  return client;
}

/**
 * Clears the client cache (useful when provider changes)
 */
export function clearLLMClientCache(): void {
  clientCache.clear();
}

