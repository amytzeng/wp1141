/**
 * Validates required environment variables
 * Throws an error if any required variable is missing
 * Note: At least one LLM provider API key (OPENAI_API_KEY or GEMINI_API_KEY) must be set
 */
export function validateEnv(): void {
  const required = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'MONGODB_URI',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // At least one LLM provider API key must be set
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasOpenAI && !hasGemini) {
    missing.push('OPENAI_API_KEY or GEMINI_API_KEY (at least one required)');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Gets environment configuration with defaults
 */
export function getEnvConfig() {
  return {
    lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    lineChannelSecret: process.env.LINE_CHANNEL_SECRET!,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4.0',
    openaiMaxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
    openaiTimeout: parseInt(process.env.OPENAI_TIMEOUT || '10000', 10),
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5',
    geminiMaxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '500', 10),
    geminiTimeout: parseInt(process.env.GEMINI_TIMEOUT || '10000', 10),
    mongodbUri: process.env.MONGODB_URI!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    maxRequestsPerMinute: parseInt(
      process.env.MAX_REQUESTS_PER_MINUTE || '10',
      10
    ),
  };
}

