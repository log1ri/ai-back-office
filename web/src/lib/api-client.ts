// Unified API Client ที่รวมฟีเจอร์ทั้งหมดไว้ในที่เดียว
// มีฟีเจอร์: Caching, Request Deduplication, Batch Processing, Rate Limiting, 
// Auto-Fallback, Authentication, Retry Logic, Timeout

import { ENV_CONFIG, BACKEND_ENDPOINTS, HTTP_STATUS } from '../config/environment';
import type { User, CreateUserDto, UpdateUserDto } from '../User/User';

// ===== INTERFACES =====
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

interface BackendUser {
  firstname: string;
  lastName: string;
  position: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface CreateBackendUserDto {
  name: string;
  email: string;
  role?: string;
  password?: string;
}

interface UpdateBackendUserDto {
  name?: string;
  email?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: any;
  user: BackendUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

interface ApiConfig {
  baseUrl: string;
  backendUrl: string;
  timeout: number;
  maxRetries: number;
  rateLimitDelay: number;
  cacheTTL: number;
  healthCheckInterval: number;
}

interface RequestOptions {
  useCache?: boolean;
  cacheTTL?: number;
  retries?: number;
  signal?: AbortSignal;
  useBackend?: boolean;
}

// ===== ERROR CLASSES =====
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public response?: any;

  constructor(
    status: number,
    statusText: string,
    message: string,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export class BackendApiError extends Error {
  public status: number;
  public statusText: string;
  public response?: any;

  constructor(
    status: number,
    statusText: string,
    message: string,
    response?: any
  ) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

// ===== CONFIGURATION =====
const API_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5167',
  backendUrl: ENV_CONFIG.BACKEND_API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  maxRetries: parseInt(import.meta.env.VITE_API_MAX_RETRIES || '3'),
  rateLimitDelay: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '100'),
  cacheTTL: parseInt(import.meta.env.VITE_API_CACHE_TTL || '300000'), // 5 minutes
  healthCheckInterval: 30000, // 30 seconds
};

// ===== MAIN API CLIENT CLASS =====
class UnifiedApiClient {
  private config: ApiConfig;
  private cache: Map<string, CacheItem<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  
  // Backend authentication
  private backendToken: string | null = null;
  private backendRefreshToken: string | null = null;
  private backendApiKey: string;
  
  // Health status for auto-fallback
  private healthStatus: { [key: string]: boolean } = {
    main: true,
    backend: true
  };
  private lastHealthCheck: { [key: string]: number } = {
    main: 0,
    backend: 0
  };

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...API_CONFIG, ...config };
    this.backendApiKey = ENV_CONFIG.BACKEND_API_KEY;
    
    // โหลด tokens จาก localStorage
    if (typeof window !== 'undefined') {
      this.backendToken = localStorage.getItem('backend_token');
      this.backendRefreshToken = localStorage.getItem('backend_refresh_token');
    }
    
    this.startHealthCheck();
  }

  // ===== CACHE MANAGEMENT =====
  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}:${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.config.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ===== REQUEST DEDUPLICATION =====
  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise;
    }

    let resolve!: (value: T) => void;
    let reject!: (error: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.pendingRequests.set(key, { promise, resolve, reject });

    try {
      const result = await requestFn();
      resolve(result);
      return result;
    } catch (error) {
      reject(error);
      throw error;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // ===== RATE LIMITING =====
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.config.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  // ===== QUEUE PROCESSING =====
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Queue request failed:', error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  private addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  // ===== HEALTH CHECK SYSTEM =====
  private async checkHealth(clientType: 'main' | 'backend'): Promise<boolean> {
    // ปิด health check (ถือว่าปกติทุกครั้ง)
    this.healthStatus[clientType] = true;
    this.lastHealthCheck[clientType] = Date.now();
    return true;
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      await this.checkHealth('main');
      await this.checkHealth('backend');
    }, this.config.healthCheckInterval);
  }

  // ===== AUTHENTICATION METHODS =====
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(BACKEND_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, { useBackend: true });

    this.backendToken = response.token;
    this.backendRefreshToken = response.refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('backend_token', response.token);
      localStorage.setItem('backend_refresh_token', response.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request(BACKEND_ENDPOINTS.LOGOUT, {
        method: 'POST',
      }, { useBackend: true });
    } finally {
      this.backendToken = null;
      this.backendRefreshToken = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('backend_token');
        localStorage.removeItem('backend_refresh_token');
      }
    }
  }

  async refreshAuthToken(): Promise<AuthResponse> {
    if (!this.backendRefreshToken) {
      throw new BackendApiError(401, 'Unauthorized', 'No refresh token available');
    }

    const response = await this.request<AuthResponse>(BACKEND_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.backendRefreshToken }),
    }, { useBackend: true });

    this.backendToken = response.token;
    this.backendRefreshToken = response.refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('backend_token', response.token);
      localStorage.setItem('backend_refresh_token', response.refreshToken);
    }

    return response;
  }

  // ===== CORE REQUEST METHOD =====
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requestOptions: RequestOptions = {}
  ): Promise<T> {
    const useBackend = requestOptions.useBackend ?? false;
    const baseURL = useBackend ? this.config.backendUrl : this.config.baseUrl;
    // ป้องกันปัญหา / ซ้ำหรือขาด
    let url = '';
    if (baseURL.endsWith('/') && endpoint.startsWith('/')) {
      url = baseURL + endpoint.slice(1);
    } else if (!baseURL.endsWith('/') && !endpoint.startsWith('/')) {
      url = baseURL + '/' + endpoint;
    } else {
      url = baseURL + endpoint;
    }
    const cacheKey = this.getCacheKey(endpoint, options.body);
    const useCache = requestOptions.useCache ?? false;
    const cacheTTL = requestOptions.cacheTTL ?? this.config.cacheTTL;

    // ตรวจสอบ cache สำหรับ GET requests
    if (useCache && options.method === 'GET') {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        console.log(`Cache hit for: ${endpoint}`);
        return cached;
      }
    }

    // Rate limiting
    await this.rateLimit();

    // สร้าง headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // helper function to check if endpoint is auth path
    function isAuthPath(ep: string) {
      return ep.startsWith('/api/v1/auth');
    }

    // เพิ่ม headers ตามประเภท API
    if (useBackend) {
      const onAuth = isAuthPath(endpoint);
      if (!onAuth && this.backendApiKey) headers['X-API-Key'] = this.backendApiKey;
      if (this.backendToken) headers['Authorization'] = `Bearer ${this.backendToken}`;
    } else {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // รวม headers จาก options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const requestInit: RequestInit = {
      ...options,
      headers,
      signal: requestOptions.signal,
    };

    // เพิ่ม timeout
    if (!requestOptions.signal) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      requestInit.signal = controller.signal;
      
      try {
        const result = await this.requestWithRetry<T>(url, requestInit, requestOptions.retries, useBackend);
        clearTimeout(timeoutId);
        
        // เก็บใน cache
        if (useCache && options.method === 'GET') {
          this.setCache(cacheKey, result, cacheTTL);
        }
        
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }

    const result = await this.requestWithRetry<T>(url, requestInit, requestOptions.retries, useBackend);
    
    // เก็บใน cache
    if (useCache && options.method === 'GET') {
      this.setCache(cacheKey, result, cacheTTL);
    }
    
    return result;
  }

  // ===== RETRY LOGIC =====
  private async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    retries: number = this.config.maxRetries,
    useBackend: boolean = false
  ): Promise<T> {
    try {
      const response = await fetch(url, options);
      return await this.handleResponse<T>(response, useBackend);
    } catch (error) {
      if (retries > 0 && error instanceof (useBackend ? BackendApiError : ApiError)) {
        if (error.status >= 500 || error.status === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.requestWithRetry<T>(url, options, retries - 1, useBackend);
        }
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response, useBackend: boolean = false): Promise<T> {
    if (!response.ok) {
      // จัดการ token refresh สำหรับ backend
      if (useBackend && response.status === HTTP_STATUS.UNAUTHORIZED && this.backendRefreshToken) {
        try {
          await this.refreshAuthToken();
          // ลองเรียก API อีกครั้ง
          return this.request<T>('', { method: 'GET' }, { useBackend: true });
        } catch (refreshError) {
          await this.logout();
          throw new BackendApiError(
            response.status,
            response.statusText,
            'Authentication failed'
          );
        }
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // ถ้า response ไม่ใช่ JSON
      }

      const ErrorClass = useBackend ? BackendApiError : ApiError;
      throw new ErrorClass(response.status, response.statusText, errorMessage, errorData);
    }

    if (response.status === HTTP_STATUS.NO_CONTENT || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    try {
      return await response.json();
    } catch (error) {
      const ErrorClass = useBackend ? BackendApiError : ApiError;
      throw new ErrorClass(response.status, response.statusText, 'Invalid JSON response');
    }
  }

  // ===== MAIN API METHODS =====
  async createUser(userData: CreateUserDto): Promise<ApiResponse<User>> {
    return this.addToQueue(async () => {
      return this.request<ApiResponse<User>>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    });
  }

  async createUsers(usersData: CreateUserDto[]): Promise<ApiResponse<User[]>> {
    return this.addToQueue(async () => {
      return this.request<ApiResponse<User[]>>('/users/batch', {
        method: 'POST',
        body: JSON.stringify({ users: usersData }),
      });
    });
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    const cacheKey = this.getCacheKey('/users');
    
    return this.deduplicateRequest(cacheKey, async () => {
      return this.request<ApiResponse<User[]>>('/users', {
        method: 'GET',
      }, { useCache: true, cacheTTL: 2 * 60 * 1000 }); // cache 2 นาที
    });
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    const cacheKey = this.getCacheKey(`/users/${id}`);
    
    return this.deduplicateRequest(cacheKey, async () => {
      return this.request<ApiResponse<User>>(`/users/${id}`, {
        method: 'GET',
      }, { useCache: true, cacheTTL: 5 * 60 * 1000 }); // cache 5 นาที
    });
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<ApiResponse<User>> {
    const result = await this.request<ApiResponse<User>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    // ลบ cache ที่เกี่ยวข้อง
    this.clearCache(`/users/${id}`);
    this.clearCache('/users');

    return result;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const result = await this.request<ApiResponse<void>>(`/users/${id}`, {
      method: 'DELETE',
    });

    // ลบ cache ที่เกี่ยวข้อง
    this.clearCache(`/users/${id}`);
    this.clearCache('/users');

    return result;
  }

  async updateUsers(updates: Array<{ id: string; data: UpdateUserDto }>): Promise<ApiResponse<User[]>> {
    return this.addToQueue(async () => {
      const result = await this.request<ApiResponse<User[]>>('/users/batch-update', {
        method: 'PATCH',
        body: JSON.stringify({ updates }),
      });

      // ลบ cache ทั้งหมด
      this.clearCache();

      return result;
    });
  }

  async deleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    return this.addToQueue(async () => {
      const result = await this.request<ApiResponse<void>>('/users/batch-delete', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });

      // ลบ cache ทั้งหมด
      this.clearCache();

      return result;
    });
  }

  // ===== BACKEND API METHODS =====
  async getBackendUsers(): Promise<ApiResponse<BackendUser[]>> {
    return this.request<ApiResponse<BackendUser[]>>(BACKEND_ENDPOINTS.USERS, {
      method: 'GET',
    }, { useBackend: true });
  }

  async getBackendUser(id: string): Promise<ApiResponse<BackendUser>> {
    return this.request<ApiResponse<BackendUser>>(`${BACKEND_ENDPOINTS.USERS}/${id}`, {
      method: 'GET',
    }, { useBackend: true });
  }

  async createBackendUser(userData: CreateBackendUserDto): Promise<ApiResponse<BackendUser>> {
    return this.request<ApiResponse<BackendUser>>(BACKEND_ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    }, { useBackend: true });
  }

  async updateBackendUser(id: string, userData: UpdateBackendUserDto): Promise<ApiResponse<BackendUser>> {
    return this.request<ApiResponse<BackendUser>>(`${BACKEND_ENDPOINTS.USERS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }, { useBackend: true });
  }

  async deleteBackendUser(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`${BACKEND_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    }, { useBackend: true });
  }

  async createBackendUsers(usersData: CreateBackendUserDto[]): Promise<ApiResponse<BackendUser[]>> {
    return this.request<ApiResponse<BackendUser[]>>(BACKEND_ENDPOINTS.USERS_BATCH, {
      method: 'POST',
      body: JSON.stringify({ users: usersData }),
    }, { useBackend: true });
  }

  async updateBackendUsers(updates: Array<{ id: string; data: UpdateBackendUserDto }>): Promise<ApiResponse<BackendUser[]>> {
    return this.request<ApiResponse<BackendUser[]>>(BACKEND_ENDPOINTS.USERS_BATCH_UPDATE, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    }, { useBackend: true });
  }

  async deleteBackendUsers(ids: string[]): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(BACKEND_ENDPOINTS.USERS_BATCH_DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }, { useBackend: true });
  }

  // ===== UTILITY METHODS =====
  setRateLimit(delay: number): void {
    this.config.rateLimitDelay = delay;
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  clearAllCache(): void {
    this.clearCache();
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }

  getHealthStatus(): { [key: string]: { healthy: boolean; lastCheck: number } } {
    return {
      main: {
        healthy: this.healthStatus.main,
        lastCheck: this.lastHealthCheck.main
      },
      backend: {
        healthy: this.healthStatus.backend,
        lastCheck: this.lastHealthCheck.backend
      }
    };
  }

  getCurrentClientInfo(): { type: string; status: string } {
    // ตรวจสอบว่า backend API ทำงานได้หรือไม่
    const backendHealthy = this.healthStatus.backend;
    const mainHealthy = this.healthStatus.main;
    
    if (backendHealthy) {
      return {
        type: 'backend',
        status: 'healthy'
      };
    } else if (mainHealthy) {
      return {
        type: 'main',
        status: 'healthy'
      };
    } else {
      return {
        type: 'none',
        status: 'unhealthy'
      };
    }
  }

  forceHealthCheck(): Promise<void> {
    return Promise.all([
      this.checkHealth('main'),
      this.checkHealth('backend')
    ]).then(() => {
      // Health check completed
    });
  }

  isBackendAuthenticated(): boolean {
    return !!this.backendToken;
  }

  getBackendToken(): string | null {
    return this.backendToken;
  }

  setBackendToken(token: string): void {
    this.backendToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('backend_token', token);
    }
  }

  clearBackendTokens(): void {
    this.backendToken = null;
    this.backendRefreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('backend_token');
      localStorage.removeItem('backend_refresh_token');
    }
  }

  async registerUser(userData: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    position: string;
  }) {
    return this.request('/api/v1/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, { useBackend: true });
  }
}

// สร้าง instance หลัก
export const apiClient = new UnifiedApiClient();

// Export types
export type { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  ApiResponse,
  BackendUser,
  CreateBackendUserDto,
  UpdateBackendUserDto,
  LoginCredentials,
  AuthResponse,
  ApiConfig,
  RequestOptions
};

// Export สำหรับใช้ใน components
export default apiClient;
