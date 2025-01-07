import { API_CONFIG } from './config';
import { ApiError } from './errors';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.message || error.detail || error['hydra:description'] || `HTTP error ${response.status}`;
    throw new ApiError(message, response.status);
  }
  return response.json();
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = API_CONFIG.MAX_RETRIES
): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return await handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError || attempt === retries) {
        throw error;
      }
      await delay(API_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
    }
  }
  throw new ApiError('Maximum retry attempts reached');
}