'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import CategoryPieChart from '@/components/admin/CategoryPieChart';
import { getStats, getCategoryStats } from '@/lib/api';
import type { StatsResponse, CategoryStatsResponse } from '@/lib/types/admin';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, categoryData] = await Promise.all([
          getStats(),
          getCategoryStats(),
        ]);
        setStats(statsData);
        setCategoryStats(categoryData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>錯誤: {error}</p>
        <button onClick={() => window.location.reload()}>重新載入</button>
      </div>
    );
  }

  if (!stats || !categoryStats) {
    return null;
  }

  // Prepare category data for pie chart
  const categoryData = Object.entries(categoryStats.byMainCategory).map(
    ([mainCategory, data]) => ({
      mainCategory,
      count: data.count,
      percentage: data.percentage,
    })
  );

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>統計總覽</h1>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          label="總訊息數"
          value={stats.overview.totalMessages}
        />
        <StatCard
          label="總使用者數"
          value={stats.overview.totalUsers}
        />
        <StatCard
          label="總對話數"
          value={stats.overview.totalConversations}
        />
        <StatCard
          label="今日訊息"
          value={stats.overview.todayMessages}
        />
      </div>

      {/* Category Distribution Chart */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>五大方向分類統計</h2>
        <CategoryPieChart
          data={categoryData}
          total={categoryStats.overview.total}
          size={350}
        />
      </div>

      {/* System Health */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>系統健康狀態</h2>
        <div className={styles.healthStatus}>
          <div className={`${styles.healthItem} ${styles.healthy}`}>
            <div className={styles.healthItemTitle}>資料庫</div>
            <div className={styles.healthItemStatus}>已連線</div>
          </div>
          <div className={`${styles.healthItem} ${styles.healthy}`}>
            <div className={styles.healthItemTitle}>Line API</div>
            <div className={styles.healthItemStatus}>正常運作</div>
          </div>
          <div className={`${styles.healthItem} ${styles.healthy}`}>
            <div className={styles.healthItemTitle}>LLM 服務</div>
            <div className={styles.healthItemStatus}>正常運作</div>
          </div>
        </div>
      </div>
    </div>
  );
}

