'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationTable from '@/components/admin/ConversationTable';
import { getConversations } from '@/lib/api';
import type { Conversation } from '@/lib/types/admin';
import styles from './conversations.module.css';

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const fetchConversations = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [page, filters]);

  const handleSearch = () => {
    setPage(1);
    fetchConversations();
  };

  const handleViewDetail = (conversationId: string) => {
    router.push(`/admin/conversations/detail?view=users`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
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

