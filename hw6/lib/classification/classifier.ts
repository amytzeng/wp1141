import { ClassificationResult, MainCategory, SubCategory } from './types';
import { CATEGORY_KEYWORDS, getAllCategoryDefinitions } from './keywords';

/**
 * Normalizes text for keyword matching
 * Converts to lowercase and removes punctuation
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // Remove punctuation, keep Chinese characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Calculates match score for a category based on keyword matches
 */
function calculateMatchScore(
  normalizedText: string,
  keywords: string[]
): number {
  let matchCount = 0;
  const textWords = normalizedText.split(' ');

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    // Check if keyword appears in text (exact match or as substring)
    if (
      normalizedText.includes(normalizedKeyword) ||
      textWords.some((word) => word.includes(normalizedKeyword))
    ) {
      matchCount++;
    }
  }

  // Score is based on percentage of keywords matched
  // Higher score means more keywords matched
  return keywords.length > 0 ? matchCount / keywords.length : 0;
}

/**
 * Classifies a message using keyword matching
 * Returns the category with the highest match score
 */
export function classifyByKeywords(text: string): ClassificationResult {
  const normalizedText = normalizeText(text);

  // If text is too short or empty, return uncategorized
  if (normalizedText.length < 2) {
    return {
      mainCategory: 'others',
      subCategory: 'uncategorized',
      confidence: 0,
      method: 'default',
    };
  }

  let bestMatch: {
    mainCategory: MainCategory;
    subCategory: SubCategory;
    score: number;
  } | null = null;

  // Check all categories
  for (const [mainCategory, categories] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const category of categories) {
      const score = calculateMatchScore(normalizedText, category.keywords);

      // Update best match if this score is higher
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          mainCategory: mainCategory as MainCategory,
          subCategory: category.subCategory,
          score,
        };
      }
    }
  }

  // If no match found or score is too low, return uncategorized
  if (!bestMatch || bestMatch.score < 0.1) {
    return {
      mainCategory: 'others',
      subCategory: 'uncategorized',
      confidence: 0,
      method: 'default',
    };
  }

  // Return classification result
  // Confidence is the match score, capped at 0.9 for keyword matching
  // (reserve higher confidence for LLM classification)
  return {
    mainCategory: bestMatch.mainCategory,
    subCategory: bestMatch.subCategory,
    confidence: Math.min(bestMatch.score * 0.9, 0.9),
    method: 'keyword',
  };
}

/**
 * Classifies a message (wrapper function)
 * Currently uses keyword matching, but can be extended to use LLM
 */
export function classifyMessage(text: string): ClassificationResult {
  return classifyByKeywords(text);
}

/**
 * Batch classify multiple messages
 */
export function classifyMessages(texts: string[]): ClassificationResult[] {
  return texts.map((text) => classifyMessage(text));
}

