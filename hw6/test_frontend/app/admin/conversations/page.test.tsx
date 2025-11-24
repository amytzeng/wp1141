// Tests for ConversationsPage component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversationsPage from '@/app/admin/conversations/page';
import { mockConversations } from '../../../fixtures';
import * as apiModule from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  getConversations: vi.fn(),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ConversationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', () => {
    vi.spyOn(apiModule, 'getConversations').mockResolvedValue({
      conversations: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    render(<ConversationsPage />);
    expect(screen.getByText('對話列表')).toBeInTheDocument();
  });

  it('should render filter inputs', () => {
    vi.spyOn(apiModule, 'getConversations').mockResolvedValue({
      conversations: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    render(<ConversationsPage />);

    expect(screen.getByPlaceholderText('搜尋使用者 ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜尋訊息內容')).toBeInTheDocument();
    expect(screen.getByText('開始日期')).toBeInTheDocument();
    expect(screen.getByText('結束日期')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /搜尋/i })).toBeInTheDocument();
  });

  it('should fetch and display conversations on mount', async () => {
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: mockConversations.length,
        totalPages: 1,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    expect(screen.getByText('user-456')).toBeInTheDocument();
    expect(screen.getByText('user-457')).toBeInTheDocument();
  });

  it('should show loading state while fetching', async () => {
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        conversations: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }), 100))
    );

    render(<ConversationsPage />);

    expect(screen.getByText('載入中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('載入中...')).not.toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails', async () => {
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockRejectedValue(new Error('Failed to fetch'));

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/錯誤:/i)).toBeInTheDocument();
    });
  });

  it('should filter conversations when search button is clicked', async () => {
    const user = userEvent.setup();
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: [mockConversations[0]],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    render(<ConversationsPage />);

    const userIdInput = screen.getByPlaceholderText('搜尋使用者 ID');
    await user.type(userIdInput, 'user-456');

    const searchButton = screen.getByRole('button', { name: /搜尋/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        lineUserId: 'user-456',
      });
    });
  });

  it('should filter by search keyword', async () => {
    const user = userEvent.setup();
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: mockConversations.length,
        totalPages: 1,
      },
    });

    render(<ConversationsPage />);

    const searchInput = screen.getByPlaceholderText('搜尋訊息內容');
    await user.type(searchInput, 'math');

    const searchButton = screen.getByRole('button', { name: /搜尋/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'math',
        })
      );
    });
  });

  it('should filter by date range', async () => {
    const user = userEvent.setup();
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: mockConversations.length,
        totalPages: 1,
      },
    });

    render(<ConversationsPage />);

    const startDateInput = screen.getByText('開始日期').nextElementSibling as HTMLInputElement;
    await user.type(startDateInput, '2024-01-01');

    const endDateInput = screen.getByText('結束日期').nextElementSibling as HTMLInputElement;
    await user.type(endDateInput, '2024-01-31');

    const searchButton = screen.getByRole('button', { name: /搜尋/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      );
    });
  });

  it('should trigger search on Enter key press', async () => {
    const user = userEvent.setup();
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: mockConversations.length,
        totalPages: 1,
      },
    });

    render(<ConversationsPage />);

    const userIdInput = screen.getByPlaceholderText('搜尋使用者 ID');
    await user.type(userIdInput, 'user-456{Enter}');

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          lineUserId: 'user-456',
        })
      );
    });
  });

  it('should render pagination when there are multiple pages', async () => {
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(screen.getByText('上一頁')).toBeInTheDocument();
      expect(screen.getByText('下一頁')).toBeInTheDocument();
    });
  });

  it('should navigate to next page when next button is clicked', async () => {
    const user = userEvent.setup();
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(screen.getByText('下一頁')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('下一頁');
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockGetConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it('should disable previous button on first page', async () => {
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      const prevButton = screen.getByText('上一頁');
      expect(prevButton).toBeDisabled();
    });
  });

  it('should call router.push when view detail is clicked', async () => {
    const user = userEvent.setup();
    const mockGetConversations = vi.spyOn(apiModule, 'getConversations');
    mockGetConversations.mockResolvedValue({
      conversations: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: mockConversations.length,
        totalPages: 1,
      },
    });

    render(<ConversationsPage />);

    await waitFor(() => {
      expect(screen.getByText('user-456')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('查看詳情');
    await user.click(viewButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/admin/conversations/detail?view=users');
  });
});

