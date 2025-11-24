// Tests for ConversationTable component
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversationTable from '@/components/admin/ConversationTable';
import { mockConversations } from '../../fixtures';

describe('ConversationTable', () => {
  const mockOnViewDetail = vi.fn();

  it('should render table with conversations', () => {
    render(<ConversationTable conversations={mockConversations} onViewDetail={mockOnViewDetail} />);

    // Check table headers
    expect(screen.getByText('使用者 ID')).toBeInTheDocument();
    expect(screen.getByText('最後訊息時間')).toBeInTheDocument();
    expect(screen.getByText('訊息數量')).toBeInTheDocument();
    expect(screen.getByText('建立時間')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();

    // Check conversation data
    expect(screen.getByText('user-456')).toBeInTheDocument();
    expect(screen.getByText('user-457')).toBeInTheDocument();
    expect(screen.getByText('user-458')).toBeInTheDocument();
  });

  it('should display empty state when no conversations', () => {
    render(<ConversationTable conversations={[]} onViewDetail={mockOnViewDetail} />);

    expect(screen.getByText('沒有找到對話記錄')).toBeInTheDocument();
  });

  it('should call onViewDetail when view button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConversationTable conversations={mockConversations} onViewDetail={mockOnViewDetail} />);

    const viewButtons = screen.getAllByText('查看詳情');
    await user.click(viewButtons[0]);

    expect(mockOnViewDetail).toHaveBeenCalledWith('conv-123');
    expect(mockOnViewDetail).toHaveBeenCalledTimes(1);
  });

  it('should display message count correctly', () => {
    render(<ConversationTable conversations={mockConversations} onViewDetail={mockOnViewDetail} />);

    // Check that message counts are displayed
    const messageCounts = screen.getAllByText(/^\d+$/);
    expect(messageCounts.length).toBeGreaterThan(0);
  });

  it('should use actualMessageCount when available', () => {
    const conversationsWithActualCount = [
      {
        ...mockConversations[0],
        messageCount: 10,
        actualMessageCount: 5,
      },
    ];

    render(
      <ConversationTable
        conversations={conversationsWithActualCount}
        onViewDetail={mockOnViewDetail}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should fallback to messageCount when actualMessageCount is not available', () => {
    const conversationsWithoutActualCount = [
      {
        ...mockConversations[0],
        messageCount: 10,
        actualMessageCount: undefined,
      },
    ];

    render(
      <ConversationTable
        conversations={conversationsWithoutActualCount}
        onViewDetail={mockOnViewDetail}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should render all conversation rows', () => {
    render(<ConversationTable conversations={mockConversations} onViewDetail={mockOnViewDetail} />);

    // Should have 3 conversation rows + 1 header row
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(4); // 1 header + 3 data rows
  });
});

