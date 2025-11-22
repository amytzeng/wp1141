// Classification system type definitions

export type MainCategory = 
  | 'humanities'
  | 'business'
  | 'stem'
  | 'life_sciences'
  | 'others';

export type SubCategory =
  // Humanities
  | 'chinese_literature'
  | 'foreign_literature'
  | 'history'
  | 'philosophy'
  | 'linguistics'
  // Business
  | 'economics'
  | 'management'
  | 'accounting'
  | 'finance'
  | 'marketing'
  // STEM
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'computer_science'
  | 'statistics'
  // Life Sciences
  | 'biology'
  | 'medicine'
  | 'agriculture'
  | 'food_science'
  | 'environmental_science'
  // Others
  | 'arts_design'
  | 'education'
  | 'psychology'
  | 'sociology'
  | 'law'
  | 'uncategorized';

export interface ClassificationResult {
  mainCategory: MainCategory;
  subCategory: SubCategory;
  confidence: number; // 0-1
  method: 'keyword' | 'llm' | 'default';
}

export interface CategoryDisplayName {
  zh: string;
  en: string;
}

export interface CategoryDefinition {
  mainCategory: MainCategory;
  subCategory: SubCategory;
  displayName: CategoryDisplayName;
  keywords: string[];
}

