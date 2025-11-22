import { getCategoryDisplayName } from '@/lib/utils/format';
import styles from './CategoryBadge.module.css';

interface CategoryBadgeProps {
  mainCategory: string;
  subCategory?: string;
  count?: number;
}

export default function CategoryBadge({
  mainCategory,
  subCategory,
  count,
}: CategoryBadgeProps) {
  const displayName = getCategoryDisplayName(mainCategory, subCategory);
  // Map mainCategory to CSS class name
  const categoryClassMap: Record<string, string> = {
    humanities: 'categoryHumanities',
    business: 'categoryBusiness',
    stem: 'categoryStem',
    life_sciences: 'categoryLifeSciences',
    others: 'categoryOthers',
  };
  const categoryClass = categoryClassMap[mainCategory] || 'categoryOthers';

  return (
    <span className={`${styles.categoryBadge} ${styles[categoryClass]}`}>
      {displayName}
      {count !== undefined && ` (${count})`}
    </span>
  );
}

