/**
 * Centralized API fetching utility with proper error handling
 */
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mock-api.local:5000';

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

/**
 * Makes API requests with consistent error handling and response formatting
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options?.method || 'GET'} ${url}`);

    const response = await fetch(url, options);
    console.log(`API Response status: ${response.status} for ${url}`);

    if (!response.ok) {
      return {
        data: null as any,
        error: `Server responded with status: ${response.status}`,
        status: response.status,
      };
    }

    const result = await response.json();
    return result as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      data: null as any,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    };
  }
}
