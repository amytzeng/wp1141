import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
}

export default function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>
        {typeof value === 'number' ? value.toLocaleString('zh-TW') : value}
      </div>
      {change && <div className={styles.statChange}>{change}</div>}
    </div>
  );
}

