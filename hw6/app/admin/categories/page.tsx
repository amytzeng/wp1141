'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/admin/StatCard';
import CategoryPieChart from '@/components/admin/CategoryPieChart';
import CategoryBadge from '@/components/admin/CategoryBadge';
import { getCategoryStats } from '@/lib/api';
import { getDateRange, formatDateRange } from '@/lib/utils/date';
import type { CategoryStatsResponse } from '@/lib/types/admin';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './categories.module.css';

type TimeRangeType = 'date' | 'week' | 'month';

export default function CategoriesPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRangeType, setTimeRangeType] = useState<TimeRangeType>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCategoryStats();
  }, [timeRangeType, startDate, endDate]);

  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      setError(null);

      let dateParams: { startDate?: string; endDate?: string } = {};

      if (timeRangeType === 'week' || timeRangeType === 'month') {
        const range = getDateRange(timeRangeType);
        const formatted = formatDateRange(range.start, range.end);
        dateParams = formatted;
      } else if (startDate && endDate) {
        dateParams = { startDate, endDate };
      }

      const response = await getCategoryStats(dateParams);
      setCategoryStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category statistics');
      console.error('Error fetching category stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (type: TimeRangeType) => {
    setTimeRangeType(type);
    if (type === 'week' || type === 'month') {
      setStartDate('');
      setEndDate('');
    }
  };

  if (loading && !categoryStats) {
    return (
      <div className={styles.loading}>
        <p>載入中...</p>
      </div>
    );
  }

  if (error && !categoryStats) {
    return (
      <div className={styles.error}>
        <p>錯誤: {error}</p>
        <button onClick={() => window.location.reload()}>重新載入</button>
      </div>
    );
  }

  if (!categoryStats) {
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

  // Prepare subcategory data grouped by main category
  const subCategoriesByMain: Record<string, Array<{ key: string; count: number; percentage: number }>> = {};
  Object.entries(categoryStats.bySubCategory).forEach(([key, data]) => {
    if (!subCategoriesByMain[data.mainCategory]) {
      subCategoriesByMain[data.mainCategory] = [];
    }
    subCategoriesByMain[data.mainCategory].push({
      key,
      count: data.count,
      percentage: data.percentage,
    });
  });

  // Prepare trend data for line chart
  const trendData = categoryStats.trends.map((trend) => ({
    date: trend.date,
    ...trend.categories,
  }));

  return (
    <div className={styles.categories}>
      <h1 className={styles.pageTitle}>分類統計</h1>

      {/* Overview Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          label="總訊息數"
          value={categoryStats.overview.total}
        />
        <StatCard
          label="已分類"
          value={categoryStats.overview.categorized}
        />
        <StatCard
          label="未分類"
          value={categoryStats.overview.uncategorized}
        />
        <StatCard
          label="分類率"
          value={`${categoryStats.overview.categorizationRate.toFixed(1)}%`}
        />
      </div>

      {/* Time Filter */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>時間範圍</label>
          <select
            value={timeRangeType}
            onChange={(e) => handleTimeRangeChange(e.target.value as TimeRangeType)}
          >
            <option value="date">日期</option>
            <option value="week">週</option>
            <option value="month">月</option>
          </select>
        </div>
        {timeRangeType === 'date' && (
          <>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>開始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>結束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* Main Category Pie Chart */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>五大方向分布</h2>
        <CategoryPieChart
          data={categoryData}
          total={categoryStats.overview.categorized}
          size={450}
        />
      </div>

      {/* Sub Categories */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>細分類別統計</h2>
        <div className={styles.subCategoriesGrid}>
          {Object.entries(subCategoriesByMain).map(([mainCategory, subCats]) => (
            <div key={mainCategory} className={styles.subCategoryGroup}>
              <div className={styles.subCategoryTitle}>
                {categoryStats.categoryDefinitions.find(
                  (def) => def.mainCategory === mainCategory
                )?.displayName.zh || mainCategory}
              </div>
              <div className={styles.subCategoryBadges}>
                {subCats.map((subCat) => {
                  const [main, sub] = subCat.key.split('.');
                  const definition = categoryStats.categoryDefinitions.find(
                    (def) => def.mainCategory === main && def.subCategory === sub
                  );
                  return (
                    <CategoryBadge
                      key={subCat.key}
                      mainCategory={main}
                      subCategory={sub}
                      count={subCat.count}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>每日趨勢（最近 7 天）</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(categoryStats.byMainCategory).map((mainCategory, index) => {
              const colors = ['#82c3c5', '#a9d4d6', '#065758', '#e2f0ef', '#f0f0f0'];
              return (
                <Line
                  key={mainCategory}
                  type="monotone"
                  dataKey={mainCategory}
                  stroke={colors[index % colors.length]}
                  name={categoryStats.categoryDefinitions.find(
                    (def) => def.mainCategory === mainCategory
                  )?.displayName.zh || mainCategory}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

