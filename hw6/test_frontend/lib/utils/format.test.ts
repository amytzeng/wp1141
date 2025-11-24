// Tests for format utility functions
import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPercentage,
  getCategoryDisplayName,
  truncateText,
} from '@/lib/utils/format';

describe('format utilities', () => {
  describe('formatNumber', () => {
    it('should format number with thousand separator', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(95.5)).toBe('95.5%');
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(95.555, 2)).toBe('95.56%');
      expect(formatPercentage(95.555, 0)).toBe('96%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle negative numbers', () => {
      expect(formatPercentage(-10)).toBe('-10.0%');
    });
  });

  describe('getCategoryDisplayName', () => {
    it('should return main category name when no subcategory', () => {
      expect(getCategoryDisplayName('humanities')).toBe('文史哲');
      expect(getCategoryDisplayName('business')).toBe('商管經濟');
      expect(getCategoryDisplayName('stem')).toBe('數理科學');
      expect(getCategoryDisplayName('life_sciences')).toBe('生物醫學');
      expect(getCategoryDisplayName('others')).toBe('其他');
    });

    it('should return subcategory name when provided', () => {
      expect(getCategoryDisplayName('humanities', 'chinese_literature')).toBe('中國文學');
      expect(getCategoryDisplayName('business', 'economics')).toBe('經濟學');
      expect(getCategoryDisplayName('stem', 'mathematics')).toBe('數學');
      expect(getCategoryDisplayName('life_sciences', 'biology')).toBe('生物學');
    });

    it('should handle unknown main category', () => {
      expect(getCategoryDisplayName('unknown')).toBe('unknown');
    });

    it('should handle unknown subcategory', () => {
      expect(getCategoryDisplayName('humanities', 'unknown_sub')).toBe('文史哲 - unknown_sub');
      expect(getCategoryDisplayName('unknown', 'unknown_sub')).toBe('unknown - unknown_sub');
    });

    it('should handle all valid subcategories', () => {
      // Test humanities subcategories
      expect(getCategoryDisplayName('humanities', 'chinese_literature')).toBe('中國文學');
      expect(getCategoryDisplayName('humanities', 'foreign_literature')).toBe('外國文學');
      expect(getCategoryDisplayName('humanities', 'history')).toBe('歷史');
      expect(getCategoryDisplayName('humanities', 'philosophy')).toBe('哲學');
      expect(getCategoryDisplayName('humanities', 'linguistics')).toBe('語言學');

      // Test business subcategories
      expect(getCategoryDisplayName('business', 'economics')).toBe('經濟學');
      expect(getCategoryDisplayName('business', 'management')).toBe('管理學');
      expect(getCategoryDisplayName('business', 'accounting')).toBe('會計學');
      expect(getCategoryDisplayName('business', 'finance')).toBe('財務金融');
      expect(getCategoryDisplayName('business', 'marketing')).toBe('行銷學');

      // Test stem subcategories
      expect(getCategoryDisplayName('stem', 'mathematics')).toBe('數學');
      expect(getCategoryDisplayName('stem', 'physics')).toBe('物理學');
      expect(getCategoryDisplayName('stem', 'chemistry')).toBe('化學');
      expect(getCategoryDisplayName('stem', 'computer_science')).toBe('資訊科學');
      expect(getCategoryDisplayName('stem', 'statistics')).toBe('統計學');

      // Test life_sciences subcategories
      expect(getCategoryDisplayName('life_sciences', 'biology')).toBe('生物學');
      expect(getCategoryDisplayName('life_sciences', 'medicine')).toBe('醫學');
      expect(getCategoryDisplayName('life_sciences', 'agriculture')).toBe('農學');
      expect(getCategoryDisplayName('life_sciences', 'food_science')).toBe('食品科學');
      expect(getCategoryDisplayName('life_sciences', 'environmental_science')).toBe('環境科學');

      // Test others subcategories
      expect(getCategoryDisplayName('others', 'arts_design')).toBe('藝術設計');
      expect(getCategoryDisplayName('others', 'education')).toBe('教育學');
      expect(getCategoryDisplayName('others', 'psychology')).toBe('心理學');
      expect(getCategoryDisplayName('others', 'sociology')).toBe('社會學');
      expect(getCategoryDisplayName('others', 'law')).toBe('法律');
    });
  });

  describe('truncateText', () => {
    it('should return original text if length is within limit', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
      expect(truncateText('', 10)).toBe('');
    });

    it('should truncate text and add ellipsis if exceeds limit', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
    });

    it('should handle exact length match', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(100);
      const result = truncateText(longText, 50);
      expect(result.length).toBe(53); // 50 + '...'
      expect(result).toBe('a'.repeat(50) + '...');
    });
  });
});

