import { getAllCategoryDefinitions } from './keywords';

/**
 * Builds a classification prompt for LLM
 * Includes all available categories and their descriptions
 */
export function buildClassificationPrompt(messageText: string): string {
  const categories = getAllCategoryDefinitions();
  
  // Group categories by main category
  const categoriesByMain: Record<string, typeof categories> = {};
  for (const category of categories) {
    if (!categoriesByMain[category.mainCategory]) {
      categoriesByMain[category.mainCategory] = [];
    }
    categoriesByMain[category.mainCategory].push(category);
  }

  // Build category description string
  let categoryDescriptions = 'Available categories:\n\n';
  
  for (const [mainCategory, subCategories] of Object.entries(categoriesByMain)) {
    const mainCategoryName = getMainCategoryDisplayName(mainCategory);
    categoryDescriptions += `**${mainCategoryName} (${mainCategory})**:\n`;
    
    for (const subCategory of subCategories) {
      categoryDescriptions += `  - ${subCategory.displayName.zh} / ${subCategory.displayName.en} (${subCategory.subCategory})\n`;
    }
    categoryDescriptions += '\n';
  }

  const prompt = `You are a message classification assistant. Your task is to classify the following message into the most appropriate academic subject category.

${categoryDescriptions}

**Classification Rules:**
1. Analyze the message content and identify the main academic subject it relates to
2. Choose the most specific subcategory that matches the message
3. If the message is too vague, unclear, or doesn't fit any category, use:
   - mainCategory: "others"
   - subCategory: "uncategorized"
4. Provide a confidence score between 0.0 and 1.0 based on how clearly the message fits the category
5. Return ONLY valid JSON format, no additional text

**Message to classify:**
"${messageText}"

**Response format (JSON only):**
{
  "mainCategory": "humanities" | "business" | "stem" | "life_sciences" | "others",
  "subCategory": "one of the subcategories listed above",
  "confidence": 0.0-1.0
}

**Important:** 
- Return ONLY the JSON object, no markdown, no code blocks, no explanations
- Use exact category names as shown above
- If uncertain, use lower confidence scores (0.3-0.6)
- If very clear match, use higher confidence scores (0.7-0.9)`;

  return prompt;
}

/**
 * Gets display name for main category
 */
function getMainCategoryDisplayName(mainCategory: string): string {
  const displayNames: Record<string, string> = {
    humanities: 'Humanities (人文)',
    business: 'Business (商學)',
    stem: 'STEM (理工)',
    life_sciences: 'Life Sciences (生命科學)',
    others: 'Others (其他)',
  };
  return displayNames[mainCategory] || mainCategory;
}

