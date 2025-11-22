// Category statistics API wrapper
import type { CategoryStatsResponse } from '@/lib/types/admin';

const API_BASE = '/api/admin';

/**
 * Get category statistics
 */
export async function getCategoryStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CategoryStatsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const url = `${API_BASE}/stats/categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch category statistics: ${response.statusText}`);
  }

  return response.json();
}

