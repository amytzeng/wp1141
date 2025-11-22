// Conversations API wrapper
import type {
  ConversationListResponse,
  ConversationDetailResponse,
  UserListResponse,
  UserConversationsResponse,
} from '@/lib/types/admin';

const API_BASE = '/api/admin';

/**
 * Get list of conversations with filtering
 */
export async function getConversations(params: {
  page?: number;
  limit?: number;
  lineUserId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ConversationListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.lineUserId) searchParams.set('lineUserId', params.lineUserId);
  if (params.search) searchParams.set('search', params.search);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`${API_BASE}/conversations?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get conversation details by ID
 */
export async function getConversationById(id: string): Promise<ConversationDetailResponse> {
  const response = await fetch(`${API_BASE}/conversations/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Conversation not found');
    }
    throw new Error(`Failed to fetch conversation: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get list of all users
 */
export async function getUsers(): Promise<UserListResponse> {
  const response = await fetch(`${API_BASE}/conversations/users`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get conversations for a specific user
 */
export async function getUserConversations(userId: string): Promise<UserConversationsResponse> {
  const response = await fetch(`${API_BASE}/conversations/users/${userId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`Failed to fetch user conversations: ${response.statusText}`);
  }

  return response.json();
}

