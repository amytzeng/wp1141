// Tests for conversations API wrapper
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getConversations,
  getConversationById,
  getUsers,
  getUserConversations,
} from '@/lib/api/conversations';
import type {
  ConversationListResponse,
  ConversationDetailResponse,
  UserListResponse,
  UserConversationsResponse,
} from '@/lib/types/admin';
import { mockConversations, mockConversationDetail } from '../../fixtures';

// Mock fetch globally
global.fetch = vi.fn();

describe('conversations API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations with default parameters', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: mockConversations,
        pagination: {
          page: 1,
          limit: 20,
          total: mockConversations.length,
          totalPages: 1,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getConversations({});

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/conversations?');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch conversations with pagination parameters', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: mockConversations,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getConversations({ page: 2, limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/conversations?page=2&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch conversations with filter parameters', async () => {
      const mockResponse: ConversationListResponse = {
        conversations: [mockConversations[0]],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getConversations({
        lineUserId: 'user-456',
        search: 'math',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      const expectedUrl = '/api/admin/conversations?lineUserId=user-456&search=math&startDate=2024-01-01&endDate=2024-01-31';
      expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(getConversations({})).rejects.toThrow('Failed to fetch conversations: Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(getConversations({})).rejects.toThrow('Network error');
    });
  });

  describe('getConversationById', () => {
    it('should fetch conversation by ID', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversationDetail,
      });

      const result = await getConversationById('conv-123');

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/conversations/conv-123');
      expect(result).toEqual(mockConversationDetail);
    });

    it('should throw error when conversation not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getConversationById('non-existent')).rejects.toThrow('Conversation not found');
    });

    it('should throw error for other fetch failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getConversationById('conv-123')).rejects.toThrow('Failed to fetch conversation: Internal Server Error');
    });
  });

  describe('getUsers', () => {
    it('should fetch list of users', async () => {
      const mockResponse: UserListResponse = {
        users: [
          {
            lineUserId: 'user-456',
            conversationCount: 5,
            messageCount: 50,
            lastActivityAt: '2024-01-15T10:00:00.000Z',
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getUsers();

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/conversations/users');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(getUsers()).rejects.toThrow('Failed to fetch users: Internal Server Error');
    });
  });

  describe('getUserConversations', () => {
    it('should fetch conversations for a specific user', async () => {
      const mockResponse: UserConversationsResponse = {
        userId: 'user-456',
        conversations: [
          {
            _id: 'conv-123',
            sessionId: 'session-789',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
            messageCount: 5,
            firstUserMessage: 'Hello',
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getUserConversations('user-456');

      expect(global.fetch).toHaveBeenCalledWith('/api/admin/conversations/users/user-456');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when user not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getUserConversations('non-existent')).rejects.toThrow('User not found');
    });

    it('should throw error for other fetch failures', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getUserConversations('user-456')).rejects.toThrow('Failed to fetch user conversations: Internal Server Error');
    });
  });
});

