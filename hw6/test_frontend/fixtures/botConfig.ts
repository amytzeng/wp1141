// Test fixtures for bot configuration
import type { BotConfig, BotConfigInput } from '@/lib/types/admin';

export const mockBotConfig: BotConfig = {
  _id: 'config-001',
  systemPrompt: 'You are a friendly and helpful learning assistant.',
  personality: 'Friendly, helpful, and encouraging learning assistant.',
  responseRules: {
    enableFallback: true,
    maxResponseLength: 500,
    temperature: 0.7,
    customInstructions: 'Always provide examples when explaining concepts.',
  },
  isActive: true,
  version: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

export const mockBotConfigInput: BotConfigInput = {
  systemPrompt: 'You are a helpful assistant.',
  personality: 'Professional and concise.',
  responseRules: {
    enableFallback: false,
    maxResponseLength: 300,
    temperature: 0.5,
    customInstructions: '',
  },
};

export const defaultBotConfig: BotConfigInput = {
  systemPrompt: 'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.',
  personality: 'Friendly, helpful, and encouraging learning assistant.',
  responseRules: {
    enableFallback: true,
    maxResponseLength: 500,
    temperature: 0.7,
    customInstructions: '',
  },
};

export function createMockBotConfig(overrides?: Partial<BotConfig>): BotConfig {
  return {
    ...mockBotConfig,
    ...overrides,
  };
}

