// Test fixtures for conversations
import type { Conversation, Message, ConversationDetailResponse } from '@/lib/types/admin';

export const mockConversation: Conversation = {
  _id: 'conv-123',
  lineUserId: 'user-456',
  sessionId: 'session-789',
  status: 'active',
  flowStage: 'greeting',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z',
  messageCount: 5,
  lastActivityAt: '2024-01-15T10:30:00.000Z',
  actualMessageCount: 5,
};

export const mockConversations: Conversation[] = [
  mockConversation,
  {
    ...mockConversation,
    _id: 'conv-124',
    lineUserId: 'user-457',
    status: 'completed',
    messageCount: 10,
    actualMessageCount: 10,
    lastActivityAt: '2024-01-15T09:00:00.000Z',
  },
  {
    ...mockConversation,
    _id: 'conv-125',
    lineUserId: 'user-458',
    status: 'paused',
    messageCount: 3,
    actualMessageCount: 3,
    lastActivityAt: '2024-01-14T15:00:00.000Z',
  },
];

export const mockMessage: Message = {
  _id: 'msg-001',
  conversationId: 'conv-123',
  lineUserId: 'user-456',
  type: 'user',
  content: 'Hello, I need help with math',
  timestamp: '2024-01-15T10:00:00.000Z',
  metadata: {
    messageId: 'line-msg-001',
    category: {
      mainCategory: 'stem',
      subCategory: 'mathematics',
      confidence: 0.95,
      method: 'llm',
    },
  },
};

export const mockMessages: Message[] = [
  mockMessage,
  {
    ...mockMessage,
    _id: 'msg-002',
    type: 'bot',
    content: 'I can help you with mathematics. What specific topic are you interested in?',
    timestamp: '2024-01-15T10:00:15.000Z',
    metadata: {
      llmProvider: 'openai',
      llmModel: 'gpt-4',
      tokensUsed: 150,
      processingTime: 1200,
    },
  },
  {
    ...mockMessage,
    _id: 'msg-003',
    type: 'user',
    content: 'I want to learn about calculus',
    timestamp: '2024-01-15T10:01:00.000Z',
  },
];

export const mockConversationDetail: ConversationDetailResponse = {
  conversation: mockConversation,
  messages: mockMessages,
  messageCount: mockMessages.length,
};

export function createMockConversation(overrides?: Partial<Conversation>): Conversation {
  return {
    ...mockConversation,
    ...overrides,
  };
}

export function createMockMessage(overrides?: Partial<Message>): Message {
  return {
    ...mockMessage,
    ...overrides,
  };
}

