'use client';

import { useEffect } from 'react';
import { formatDate } from '@/lib/utils/date';
import CategoryBadge from '@/components/admin/CategoryBadge';
import type { ConversationDetailResponse } from '@/lib/types/admin';
import styles from './ConversationModal.module.css';

interface ConversationModalProps {
  conversation: ConversationDetailResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationModal({
  conversation,
  isOpen,
  onClose,
}: ConversationModalProps) {
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

  if (!isOpen || !conversation) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.modalTitle}>對話詳情</h2>
        <div className={styles.conversationInfo}>
          <div>
            <strong>會話 ID:</strong> {conversation.conversation.sessionId}
          </div>
          <div>
            <strong>建立時間:</strong> {formatDate(conversation.conversation.createdAt)}
          </div>
          <div>
            <strong>訊息數量:</strong> {conversation.messageCount}
          </div>
        </div>
        <div className={styles.messageList}>
          {conversation.messages.map((message) => (
            <div
              key={message._id}
              className={`${styles.message} ${styles[message.type]}`}
            >
              <div className={styles.messageBubble}>
                <div className={styles.messageContent}>{message.content}</div>
                <div className={styles.messageTime}>
                  {formatDate(message.timestamp)}
                </div>
                <div className={styles.messageMeta}>
                  {message.type === 'user' && message.metadata.category && (
                    <CategoryBadge
                      mainCategory={message.metadata.category.mainCategory}
                      subCategory={message.metadata.category.subCategory}
                    />
                  )}
                  {message.type === 'bot' && (
                    <div className={styles.botMeta}>
                      <span>
                        LLM: {message.metadata.llmProvider || 'N/A'} | Model:{' '}
                        {message.metadata.llmModel || 'N/A'}
                      </span>
                      {message.metadata.tokensUsed && (
                        <span> | Tokens: {message.metadata.tokensUsed}</span>
                      )}
                      {message.metadata.processingTime && (
                        <span>
                          {' '}
                          | 處理時間:{' '}
                          {message.metadata.processingTime.toFixed(2)}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

