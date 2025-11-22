import { formatRelativeTime } from '@/lib/utils/date';
import type { User } from '@/lib/types/admin';
import styles from './UserCard.module.css';

interface UserCardProps {
  user: User;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div className={styles.userCard} onClick={onClick}>
      <div className={styles.userId}>{user.lineUserId}</div>
      <div className={styles.userStats}>
        <span>對話數: {user.conversationCount}</span>
      </div>
      <div className={styles.userLastActivity}>
        最後活動: {formatRelativeTime(user.lastActivityAt)}
      </div>
    </div>
  );
}

