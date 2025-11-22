'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getCategoryDisplayName } from '@/lib/utils/format';
import styles from './CategoryPieChart.module.css';

interface CategoryData {
  mainCategory: string;
  count: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  total: number;
  size?: number;
}

const COLORS: Record<string, string> = {
  humanities: '#82c3c5',
  business: '#a9d4d6',
  stem: '#065758',
  life_sciences: '#e2f0ef',
  others: '#f0f0f0',
};

export default function CategoryPieChart({
  data,
  total,
  size = 350,
}: CategoryPieChartProps) {
  const chartData = data.map((item) => ({
    name: getCategoryDisplayName(item.mainCategory),
    value: item.count,
    percentage: item.percentage,
    mainCategory: item.mainCategory,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={styles.tooltip}>
          <p>{data.name}</p>
          <p>
            <strong>{data.value.toLocaleString('zh-TW')}</strong> 則訊息
          </p>
          <p>
            <strong>{data.payload.percentage.toFixed(1)}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={size}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={size * 0.4}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.mainCategory] || '#cccccc'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.centerLabel}>
        <div className={styles.totalValue}>
          {total.toLocaleString('zh-TW')}
        </div>
        <div className={styles.totalLabel}>總訊息數</div>
      </div>
      <div className={styles.legend}>
        {chartData.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: COLORS[item.mainCategory] }}
            />
            <span>
              {item.name} {item.percentage.toFixed(1)}% ({item.value.toLocaleString('zh-TW')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

