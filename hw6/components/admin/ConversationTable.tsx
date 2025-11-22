'use client';

import { formatRelativeTime, formatDate } from '@/lib/utils/date';
import type { Conversation } from '@/lib/types/admin';
import styles from './ConversationTable.module.css';

interface ConversationTableProps {
  conversations: Conversation[];
  onViewDetail: (conversationId: string) => void;
}

export default function ConversationTable({
  conversations,
  onViewDetail,
}: ConversationTableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr className={styles.tableRow}>
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
              <td colSpan={5} className={`${styles.tableCell} ${styles.emptyCell}`}>
                沒有找到對話記錄
              </td>
            </tr>
          ) : (
            conversations.map((conv) => (
              <tr key={conv._id} className={styles.tableRow}>
                <td className={styles.tableCell}>{conv.lineUserId}</td>
                <td className={styles.tableCell}>{formatRelativeTime(conv.lastActivityAt)}</td>
                <td className={styles.tableCell}>{conv.actualMessageCount || conv.messageCount}</td>
                <td className={styles.tableCell}>{formatDate(conv.createdAt)}</td>
                <td className={styles.tableCell}>
                  <button
                    className={styles.viewButton}
                    onClick={() => onViewDetail(conv._id)}
                  >
                    查看詳情
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

