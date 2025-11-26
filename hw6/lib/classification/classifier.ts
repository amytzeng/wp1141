import { ClassificationResult, MainCategory, SubCategory } from './types';
import { CATEGORY_KEYWORDS, getAllCategoryDefinitions } from './keywords';
import { buildClassificationPrompt } from './prompt';
import { getLLMClient } from '@/lib/llm/client';

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
 * Validates if a category combination is valid
 */
function isValidCategory(
  mainCategory: string,
  subCategory: string
): boolean {
  const validMainCategories: MainCategory[] = [
    'humanities',
    'business',
    'stem',
    'life_sciences',
    'others',
  ];
  const validSubCategories: SubCategory[] = [
    'chinese_literature',
    'foreign_literature',
    'history',
    'philosophy',
    'linguistics',
    'economics',
    'management',
    'accounting',
    'finance',
    'marketing',
    'mathematics',
    'physics',
    'chemistry',
    'computer_science',
    'statistics',
    'biology',
    'medicine',
    'agriculture',
    'food_science',
    'environmental_science',
    'arts_design',
    'education',
    'psychology',
    'sociology',
    'law',
    'uncategorized',
  ];

  return (
    validMainCategories.includes(mainCategory as MainCategory) &&
    validSubCategories.includes(subCategory as SubCategory)
  );
}

/**
 * Parses and validates LLM classification response
 * Extracts JSON from the response text and validates the structure
 */
function parseLLMResponse(
  responseText: string
): ClassificationResult | null {
  try {
    // Try to extract JSON from the response
    // Remove markdown code blocks if present
    let jsonText = responseText.trim();
    jsonText = jsonText.replace(/^```json\s*/i, '');
    jsonText = jsonText.replace(/^```\s*/i, '');
    jsonText = jsonText.replace(/\s*```$/i, '');
    jsonText = jsonText.trim();

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (
      !parsed.mainCategory ||
      !parsed.subCategory ||
      typeof parsed.confidence !== 'number'
    ) {
      console.error('Invalid LLM response structure:', parsed);
      return null;
    }

    // Validate category values
    if (
      !isValidCategory(parsed.mainCategory, parsed.subCategory)
    ) {
      console.error('Invalid category values:', parsed);
      return null;
    }

    // Validate confidence range
    const confidence = Math.max(0, Math.min(1, parsed.confidence));

    return {
      mainCategory: parsed.mainCategory as MainCategory,
      subCategory: parsed.subCategory as SubCategory,
      confidence,
      method: 'llm',
    };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    console.error('Response text:', responseText);
    return null;
  }
}

/**
 * Classifies a message using LLM
 * Returns null if classification fails (for fallback)
 */
export async function classifyByLLM(
  text: string
): Promise<ClassificationResult | null> {
  // If text is too short or empty, return uncategorized immediately
  if (!text || text.trim().length < 2) {
    return {
      mainCategory: 'others',
      subCategory: 'uncategorized',
      confidence: 0,
      method: 'default',
    };
  }

  try {
    // Get LLM client
    const llmClient = await getLLMClient();

    // Build classification prompt
    const prompt = buildClassificationPrompt(text);

    // Call LLM API with optimized parameters for classification
    // Lower temperature for more consistent results, smaller max_tokens for faster response
    const response = await llmClient.generateResponse(prompt, [], {
      temperature: 0.3, // Lower temperature for more deterministic classification
      maxTokens: 150, // Classification responses are short, so we don't need many tokens
      systemPrompt:
        'You are a precise message classification assistant. Analyze messages and classify them into academic subject categories. Return only valid JSON format.',
    });

    // Check for errors
    if (response.error) {
      console.error('LLM classification error:', response.error);
      return null;
    }

    // Parse and validate response
    const classification = parseLLMResponse(response.content);

    if (!classification) {
      console.error('Failed to parse LLM classification response');
      return null;
    }

    return classification;
  } catch (error) {
    // Log error but don't throw - we'll fallback to keyword matching
    console.error('Error in LLM classification:', error);
    return null;
  }
}

/**
 * Classifies a message (wrapper function)
 * Tries LLM classification first, falls back to keyword matching if LLM fails
 */
export async function classifyMessage(
  text: string
): Promise<ClassificationResult> {
  // Try LLM classification first
  const llmResult = await classifyByLLM(text);

  // If LLM classification succeeded, return it
  if (llmResult) {
    return llmResult;
  }

  // Fallback to keyword matching
  console.log('Falling back to keyword matching for:', text.substring(0, 50));
  return classifyByKeywords(text);
}

/**
 * Batch classify multiple messages
 */
export async function classifyMessages(
  texts: string[]
): Promise<ClassificationResult[]> {
  return Promise.all(texts.map((text) => classifyMessage(text)));
}

