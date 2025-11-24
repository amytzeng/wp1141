// Tests for date utility functions
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateOnly,
  formatRelativeTime,
  getDateRange,
  formatDateRange,
} from '@/lib/utils/date';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format Date object to string', () => {
      const date = new Date('2024-01-15T10:30:45.123Z');
      const result = formatDate(date);
      // Check format pattern instead of exact match due to timezone differences
      expect(result).toMatch(/2024-01-15 \d{2}:\d{2}:\d{2}/);
    });

    it('should format ISO string to string', () => {
      const dateString = '2024-01-15T10:30:45.123Z';
      const result = formatDate(dateString);
      // Check format pattern instead of exact match due to timezone differences
      expect(result).toMatch(/2024-01-15 \d{2}:\d{2}:\d{2}/);
    });

    it('should handle different timezones correctly', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      const result = formatDate(date);
      expect(result).toMatch(/2024-01-15/);
    });
  });

  describe('formatDateOnly', () => {
    it('should format Date object to date-only string', () => {
      const date = new Date('2024-01-15T10:30:45.123Z');
      const result = formatDateOnly(date);
      expect(result).toBe('2024-01-15');
    });

    it('should format ISO string to date-only string', () => {
      const dateString = '2024-01-15T10:30:45.123Z';
      const result = formatDateOnly(dateString);
      expect(result).toBe('2024-01-15');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "剛剛" for time less than 1 minute ago', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-15T09:59:30.000Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('剛剛');
    });

    it('should return minutes ago for time less than 1 hour ago', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-15T09:45:00.000Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('15 分鐘前');
    });

    it('should return hours ago for today', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-15T08:00:00.000Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('2 小時前');
    });

    it('should return "昨天" for yesterday', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-14T10:00:00.000Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('昨天');
    });

    it('should return days ago for dates within a week', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-10T10:00:00.000Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('5 天前');
    });

    it('should return formatted distance for dates more than a week ago', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const date = new Date('2024-01-01T10:00:00.000Z');
      const result = formatRelativeTime(date);
      expect(result).toContain('前');
    });

    it('should handle ISO string input', () => {
      const now = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(now);
      const dateString = '2024-01-15T09:00:00.000Z';
      const result = formatRelativeTime(dateString);
      expect(result).toBe('1 小時前');
    });
  });

  describe('getDateRange', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return week range starting from Monday', () => {
      // Set to a known date (Monday, January 15, 2024)
      const monday = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(monday);

      const range = getDateRange('week');
      expect(range.start.getDay()).toBe(1); // Monday
      expect(range.end.getDay()).toBe(0); // Sunday
    });

    it('should return month range', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(date);

      const range = getDateRange('month');
      expect(range.start.getDate()).toBe(1); // First day of month
      expect(range.end.getMonth()).toBe(range.start.getMonth());
    });

    it('should handle invalid type gracefully', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      vi.setSystemTime(date);

      // @ts-expect-error - testing invalid input
      const range = getDateRange('invalid');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
    });
  });

  describe('formatDateRange', () => {
    it('should format Date objects to ISO strings', () => {
      const start = new Date('2024-01-15T10:00:00.000Z');
      const end = new Date('2024-01-20T10:00:00.000Z');
      const result = formatDateRange(start, end);
      expect(result.startDate).toContain('2024-01-15');
      expect(result.endDate).toContain('2024-01-20');
    });

    it('should handle string inputs', () => {
      const start = '2024-01-15T10:00:00.000Z';
      const end = '2024-01-20T10:00:00.000Z';
      const result = formatDateRange(start, end);
      expect(result.startDate).toBe(start);
      expect(result.endDate).toBe(end);
    });
  });
});

