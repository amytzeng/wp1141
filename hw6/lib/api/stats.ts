// Statistics API wrapper
import type { StatsResponse } from '@/lib/types/admin';
import { getCategoryStats } from './categories';

const API_BASE = '/api/admin';

/**
 * Get comprehensive statistics
 */
export async function getStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<StatsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const url = `${API_BASE}/stats${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  }

  return response.json();
}

// Re-export category stats for convenience
export { getCategoryStats };

