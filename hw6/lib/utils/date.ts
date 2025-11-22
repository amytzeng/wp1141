// Date utility functions
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

/**
 * Format date to string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Format date to date only string
 */
export function formatDateOnly(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    const hoursAgo = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60));
    if (hoursAgo < 1) {
      const minutesAgo = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60));
      return minutesAgo < 1 ? '剛剛' : `${minutesAgo} 分鐘前`;
    }
    return `${hoursAgo} 小時前`;
  }
  
  if (isYesterday(dateObj)) {
    return '昨天';
  }
  
  const daysAgo = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) {
    return `${daysAgo} 天前`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhTW });
}

/**
 * Get date range for week or month
 */
export function getDateRange(type: 'week' | 'month'): { start: Date; end: Date } {
  const now = new Date();
  
  switch (type) {
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    default:
      return { start: now, end: now };
  }
}

/**
 * Format date range for API
 */
export function formatDateRange(start: Date | string, end: Date | string): {
  startDate: string;
  endDate: string;
} {
  const startDate = typeof start === 'string' ? start : format(start, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  const endDate = typeof end === 'string' ? end : format(end, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  return { startDate, endDate };
}

