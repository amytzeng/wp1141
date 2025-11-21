/**
 * Validates required environment variables
 * Throws an error if any required variable is missing
 */
export function validateEnv(): void {
  const required = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'OPENAI_API_KEY',
    'MONGODB_URI',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
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
    openaiApiKey: process.env.OPENAI_API_KEY!,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    openaiMaxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
    openaiTimeout: parseInt(process.env.OPENAI_TIMEOUT || '10000', 10),
    mongodbUri: process.env.MONGODB_URI!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    maxRequestsPerMinute: parseInt(
      process.env.MAX_REQUESTS_PER_MINUTE || '10',
      10
    ),
  };
}

