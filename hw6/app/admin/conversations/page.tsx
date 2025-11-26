'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ConversationTable from '@/components/admin/ConversationTable';
import { getConversations, deleteConversations } from '@/lib/api';
import type { Conversation } from '@/lib/types/admin';
import styles from './conversations.module.css';

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    lineUserId: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 20,
  });
  
  // Ref to track if polling should be active
  const pollingEnabledRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef(false);
  const isDeletingRef = useRef(false);

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        loadingRef.current = true;
      }
      setError(null);
      const response = await getConversations({
        page,
        limit: pagination.limit,
        lineUserId: filters.lineUserId || undefined,
        search: filters.search || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setConversations(response.conversations);
      setPagination({
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        limit: response.pagination.limit,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      if (!silent) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [page, filters]);

  // Set up polling (every 5 seconds)
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up polling (every 5 seconds)
    // Since this effect runs whenever page or filters change,
    // the interval will always use the latest values
    if (pollingEnabledRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        if (pollingEnabledRef.current && !loadingRef.current && !isDeletingRef.current) {
          // Fetch with current page and filters
          // This will use the latest values because the effect re-runs when they change
          fetchConversations(true); // Silent fetch (no loading indicator)
        }
      }, 5000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [page, filters]); // Re-run when page or filters change to use latest values

  // Update refs when state changes
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    isDeletingRef.current = isDeleting;
  }, [isDeleting]);

  // Disable polling when page loses focus, re-enable when it gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      pollingEnabledRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchConversations();
  };

  const handleViewDetail = (conversation: Conversation) => {
    // Directly navigate to the user's conversation list with fromList flag
    router.push(`/admin/conversations/detail?view=conversations&userId=${encodeURIComponent(conversation.lineUserId)}&fromList=true`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      setIsDeleting(true);
      const result = await deleteConversations(ids);
      
      // Show success message
      alert(`成功刪除 ${result.deleted} 個對話（包含 ${result.messagesDeleted} 則訊息）`);
      
      // Refresh the list
      await fetchConversations();
      
      // If current page becomes empty after deletion, go to previous page
      if (conversations.length === ids.length && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error('Error deleting conversations:', err);
      alert(err instanceof Error ? err.message : '刪除失敗，請稍後再試。');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.conversations}>
      <h1 className={styles.pageTitle}>對話列表</h1>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>使用者 ID</label>
          <input
            type="text"
            placeholder="搜尋使用者 ID"
            value={filters.lineUserId}
            onChange={(e) => setFilters({ ...filters, lineUserId: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>關鍵字</label>
          <input
            type="text"
            placeholder="搜尋訊息內容"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>開始日期</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>結束日期</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <div className={styles.filterGroup} style={{ justifyContent: 'flex-end' }}>
          <label className={styles.filterLabel} style={{ opacity: 0 }}>
            搜尋
          </label>
          <button className={styles.searchButton} onClick={handleSearch}>
            搜尋
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>錯誤: {error}</p>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <p>載入中...</p>
        </div>
      ) : (
        <>
          <ConversationTable
            conversations={conversations}
            onViewDetail={handleViewDetail}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                上一頁
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${page === pageNum ? styles.active : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
              >
                下一頁
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

