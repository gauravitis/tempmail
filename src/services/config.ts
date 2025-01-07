export const API_CONFIG = {
  BASE_URL: 'https://api.mail.gw',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;