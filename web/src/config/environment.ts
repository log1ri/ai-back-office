// Environment Configuration สำหรับเชื่อมต่อ Backend

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5167',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  API_MAX_RETRIES: parseInt(import.meta.env.VITE_API_MAX_RETRIES || '3'),
  API_RATE_LIMIT: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '100'),
  API_CACHE_TTL: parseInt(import.meta.env.VITE_API_CACHE_TTL || '300000'),

  // Authentication
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || 'user123',

  // Backend API (เพื่อนของคุณ)ฟ
  BACKEND_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5167',
  BACKEND_API_KEY: import.meta.env.VITE_API_KEY || '',

  // Health Check
  HEALTH_CHECK_PATH: '/health',

  // Development
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
};

// API Endpoints สำหรับ Backend ของเพื่อน
export const BACKEND_ENDPOINTS = {
  // Authentication
  LOGIN: 'api/v1/auth/sign-in',
  LOGOUT: 'api/v1/auth/logout',
  REGISTER: 'api/v1/auth/sign-up',
  REFRESH_TOKEN: 'api/v1/auth/refresh',
  
  // Users
  USERS: 'api/v1/users',
  USERS_BATCH: 'api/v1/users/batch',
  USERS_BATCH_UPDATE: 'api/v1/users/batch-update',
  USERS_BATCH_DELETE: 'api/v1/users/batch-delete',
  
  // Other endpoints ที่เพื่อนของคุณมี
  PRODUCTS: 'api/v1/products',
  ORDERS: 'api/v1/orders',
  REPORTS: 'api/v1/reports',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}; 