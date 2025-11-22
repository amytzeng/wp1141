// Format utility functions

/**
 * Format number with thousand separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-TW');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(
  mainCategory: string,
  subCategory?: string
): string {
  const mainCategoryNames: Record<string, string> = {
    humanities: '文史哲',
    business: '商管經濟',
    stem: '數理科學',
    life_sciences: '生物醫學',
    others: '其他',
  };

  if (!subCategory) {
    return mainCategoryNames[mainCategory] || mainCategory;
  }

  const subCategoryNames: Record<string, Record<string, string>> = {
    humanities: {
      chinese_literature: '中國文學',
      foreign_literature: '外國文學',
      history: '歷史',
      philosophy: '哲學',
      linguistics: '語言學',
    },
    business: {
      economics: '經濟學',
      management: '管理學',
      accounting: '會計學',
      finance: '財務金融',
      marketing: '行銷學',
    },
    stem: {
      mathematics: '數學',
      physics: '物理學',
      chemistry: '化學',
      computer_science: '資訊科學',
      statistics: '統計學',
    },
    life_sciences: {
      biology: '生物學',
      medicine: '醫學',
      agriculture: '農學',
      food_science: '食品科學',
      environmental_science: '環境科學',
    },
    others: {
      arts_design: '藝術設計',
      education: '教育學',
      psychology: '心理學',
      sociology: '社會學',
      law: '法律',
    },
  };

  return (
    subCategoryNames[mainCategory]?.[subCategory] ||
    `${mainCategoryNames[mainCategory] || mainCategory} - ${subCategory}`
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Re-export date functions for convenience
export { formatDate } from './date';

