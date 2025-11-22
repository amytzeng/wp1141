'use client';

import { useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';
import { truncateText } from '@/lib/utils/format';
import type { BotConfigHistoryItem } from '@/lib/types/admin';
import styles from './ConfigHistoryModal.module.css';

interface ConfigHistoryModalProps {
  configs: BotConfigHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onViewDetail: (config: BotConfigHistoryItem) => void;
}

export default function ConfigHistoryModal({
  configs,
  isOpen,
  onClose,
  onViewDetail,
}: ConfigHistoryModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.modalTitle}>配置歷史紀錄</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableRow}>
                <th className={styles.tableHeader}>版本</th>
                <th className={styles.tableHeader}>建立時間</th>
                <th className={styles.tableHeader}>System Prompt 預覽</th>
                <th className={styles.tableHeader}>狀態</th>
                <th className={styles.tableHeader}>操作</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr className={styles.tableRow}>
                  <td colSpan={5} className={`${styles.tableCell} ${styles.emptyCell}`}>
                    沒有歷史紀錄
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{config.version}</td>
                    <td className={styles.tableCell}>{formatDate(config.createdAt)}</td>
                    <td className={styles.tableCell}>{truncateText(config.systemPrompt, 50)}</td>
                    <td className={styles.tableCell}>
                      {config.isActive ? (
                        <span className={styles.active}>使用中</span>
                      ) : (
                        <span className={styles.inactive}>已停用</span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        className={styles.viewButton}
                        onClick={() => onViewDetail(config)}
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
      </div>
    </div>
  );
}

