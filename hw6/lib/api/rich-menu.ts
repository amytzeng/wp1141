// Rich Menu API wrapper
const API_BASE = '/api/admin';

export interface RichMenuInfo {
  richMenuId: string;
  size: { width: number; height: number };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: Array<{
    bounds: { x: number; y: number; width: number; height: number };
    action: {
      type: string;
      [key: string]: any;
    };
  }>;
}

export interface RichMenuResponse {
  success: boolean;
  richMenus: RichMenuInfo[];
  defaultRichMenuId: string | null;
  error?: string;
}

/**
 * Get Rich Menu information
 */
export async function getRichMenuInfo(): Promise<RichMenuResponse> {
  const response = await fetch(`${API_BASE}/rich-menu`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch rich menu info: ${response.statusText}`);
  }

  return response.json();
}

