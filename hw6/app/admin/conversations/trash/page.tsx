'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConversationTable from '@/components/admin/ConversationTable';
import { getTrashConversations, restoreConversations } from '@/lib/api';
import type { Conversation } from '@/lib/types/admin';
import styles from '../conversations.module.css';

export default function TrashPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [filters, setFilters] = useState({
    lineUserId: '',
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
      const response = await getTrashConversations({
        page,
        limit: pagination.limit,
        lineUserId: filters.lineUserId || undefined,
      });
      setConversations(response.conversations);
      setPagination({
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        limit: response.pagination.limit,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trash conversations');
      console.error('Error fetching trash conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [page, filters.lineUserId]);

  const handleSearch = () => {
    setPage(1);
    fetchConversations();
  };

  const handleViewDetail = (conversation: Conversation) => {
    router.push(`/admin/conversations/detail?view=conversations&userId=${encodeURIComponent(conversation.lineUserId)}&fromList=true`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleRestore = async (ids: string[]) => {
    if (ids.length === 0) return;

    const confirmed = window.confirm(
      `確定要還原 ${ids.length} 個對話嗎？還原後對話將重新出現在對話列表中。`
    );

    if (!confirmed) return;

    try {
      setIsRestoring(true);
      const result = await restoreConversations(ids);
      
      // Show success message
      alert(`成功還原 ${result.restored} 個對話！`);
      
      // Refresh the list
      await fetchConversations();
      
      // If current page becomes empty after restoration, go to previous page
      if (conversations.length === ids.length && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error('Error restoring conversations:', err);
      alert(err instanceof Error ? err.message : '還原失敗，請稍後再試。');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={styles.conversations}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>🗑️ 垃圾桶</h1>
        <Link href="/admin/conversations" className={styles.trashButton}>
          ← 返回對話列表
        </Link>
      </div>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffc107', 
        borderRadius: '8px',
        marginBottom: '1.5rem',
        color: '#856404'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>
          ⚠️ 重要提示：此頁面顯示已刪除的對話。所有資料都已保留，您可以隨時還原對話。
          <strong style={{ display: 'block', marginTop: '0.5rem' }}>
            此系統不支援永久刪除功能，所有資料都會被保留。
          </strong>
        </p>
      </div>

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
            onDelete={handleRestore}
            isDeleting={isRestoring}
            showRestoreButton={true}
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

