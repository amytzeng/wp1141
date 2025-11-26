'use client';

import { useState } from 'react';
import { formatRelativeTime, formatDate } from '@/lib/utils/date';
import type { Conversation } from '@/lib/types/admin';
import styles from './ConversationTable.module.css';

interface ConversationTableProps {
  conversations: Conversation[];
  onViewDetail: (conversation: Conversation) => void;
  onDelete?: (ids: string[]) => Promise<void>;
  isDeleting?: boolean;
  showRestoreButton?: boolean; // If true, show restore button instead of delete
}

export default function ConversationTable({
  conversations,
  onViewDetail,
  onDelete,
  isDeleting = false,
  showRestoreButton = false,
}: ConversationTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(conversations.map((conv) => conv._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!onDelete || selectedIds.size === 0) return;

    const idsArray = Array.from(selectedIds);
    const actionText = showRestoreButton ? '還原' : '刪除';
    const confirmed = window.confirm(
      showRestoreButton
        ? `確定要還原 ${idsArray.length} 個對話嗎？還原後對話將重新出現在對話列表中。`
        : `確定要刪除 ${idsArray.length} 個對話嗎？對話將移至垃圾桶。`
    );

    if (confirmed) {
      try {
        await onDelete(idsArray);
        setSelectedIds(new Set());
      } catch (error) {
        console.error(`Failed to ${actionText} conversations:`, error);
        alert(`${actionText}失敗，請稍後再試。`);
      }
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!onDelete) return;

    const actionText = showRestoreButton ? '還原' : '刪除';
    const confirmed = window.confirm(
      showRestoreButton
        ? '確定要還原這個對話嗎？還原後對話將重新出現在對話列表中。'
        : '確定要刪除這個對話嗎？對話將移至垃圾桶。'
    );

    if (confirmed) {
      try {
        await onDelete([id]);
      } catch (error) {
        console.error(`Failed to ${actionText} conversation:`, error);
        alert(`${actionText}失敗，請稍後再試。`);
      }
    }
  };

  const allSelected = conversations.length > 0 && selectedIds.size === conversations.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < conversations.length;

  return (
    <div className={styles.tableContainer}>
      {/* Action Bar - shown when items are selected */}
      {selectedIds.size > 0 && onDelete && (
        <div className={styles.actionBar}>
          <span className={styles.selectedCount}>
            已選中 {selectedIds.size} 個對話
          </span>
          <button
            className={showRestoreButton ? styles.restoreButton : styles.deleteButton}
            onClick={handleDeleteSelected}
            disabled={isDeleting}
          >
            {isDeleting 
              ? (showRestoreButton ? '還原中...' : '刪除中...') 
              : showRestoreButton 
                ? `批次還原 (${selectedIds.size})` 
                : `批次刪除 (${selectedIds.size})`}
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => setSelectedIds(new Set())}
            disabled={isDeleting}
          >
            取消選擇
          </button>
        </div>
      )}

      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr className={styles.tableRow}>
            <th className={styles.tableHeader}>
              {onDelete && (
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  disabled={isDeleting}
                />
              )}
            </th>
            <th className={styles.tableHeader}>使用者 ID</th>
            <th className={styles.tableHeader}>最後訊息時間</th>
            <th className={styles.tableHeader}>訊息數量</th>
            <th className={styles.tableHeader}>建立時間</th>
            <th className={styles.tableHeader}>操作</th>
          </tr>
        </thead>
        <tbody>
          {conversations.length === 0 ? (
            <tr className={styles.tableRow}>
              <td colSpan={onDelete ? 6 : 5} className={`${styles.tableCell} ${styles.emptyCell}`}>
                沒有找到對話記錄
              </td>
            </tr>
          ) : (
            conversations.map((conv) => (
              <tr key={conv._id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  {onDelete && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(conv._id)}
                      onChange={() => handleSelectOne(conv._id)}
                      disabled={isDeleting}
                    />
                  )}
                </td>
                <td className={styles.tableCell}>{conv.lineUserId}</td>
                <td className={styles.tableCell}>{formatRelativeTime(conv.lastActivityAt)}</td>
                <td className={styles.tableCell}>{conv.actualMessageCount || conv.messageCount}</td>
                <td className={styles.tableCell}>{formatDate(conv.createdAt)}</td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.viewButton}
                      onClick={() => onViewDetail(conv)}
                      disabled={isDeleting}
                    >
                      查看詳情
                    </button>
                    {onDelete && (
                      <button
                        className={showRestoreButton ? styles.restoreOneButton : styles.deleteOneButton}
                        onClick={() => handleDeleteOne(conv._id)}
                        disabled={isDeleting}
                        title={showRestoreButton ? "還原對話" : "刪除對話"}
                      >
                        {showRestoreButton ? '還原' : '刪除'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

