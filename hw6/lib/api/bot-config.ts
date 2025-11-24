// Bot configuration API wrapper
import type {
  BotConfigResponse,
  BotConfigInput,
  BotConfigHistoryResponse,
} from '@/lib/types/admin';

const API_BASE = '/api/admin';

/**
 * Get current bot configuration
 */
export async function getBotConfig(): Promise<BotConfigResponse> {
  const response = await fetch(`${API_BASE}/bot-config`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bot config: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update bot configuration
 */
export async function updateBotConfig(
  config: BotConfigInput
): Promise<BotConfigResponse> {
  const response = await fetch(`${API_BASE}/bot-config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    // Try to get detailed error message from response
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If response is not JSON, use statusText
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get bot configuration history
 */
export async function getBotConfigHistory(): Promise<BotConfigHistoryResponse> {
  const response = await fetch(`${API_BASE}/bot-config/history`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bot config history: ${response.statusText}`);
  }

  return response.json();
}

