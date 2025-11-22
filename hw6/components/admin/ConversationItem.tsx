import { formatDate } from '@/lib/utils/date';
import { truncateText } from '@/lib/utils/format';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: {
    _id: string;
    sessionId: string;
    createdAt: string;
    messageCount: number;
    firstUserMessage: string;
  };
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  onClick,
}: ConversationItemProps) {
  return (
    <div className={styles.conversationItem} onClick={onClick}>
      <div className={styles.messagePreview}>
        {truncateText(conversation.firstUserMessage, 50)}
      </div>
      <div className={styles.conversationMeta}>
        <span>{formatDate(conversation.createdAt)}</span>
        <span>•</span>
        <span>{conversation.messageCount} 則訊息</span>
      </div>
    </div>
  );
}

