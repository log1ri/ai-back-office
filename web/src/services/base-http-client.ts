import { ApiError } from '../types/api.types';
import { ENV_CONFIG } from '../config/environment';
import { jwtDecode } from 'jwt-decode';


/*
Single Responsibility Principle - HTTP client only handle      if (newToken) {
        // ส่ง request ซ้ำด้วย token ใหม่
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        
        const retryResponse = await fetch(url, retryConfig);
        return retryResponse;s
This class is responsible for making HTTP requests and handling responses.
It abstracts the details of HTTP communication, allowing other services to focus on their specific responsibilities.

Please look carefully at the methods and how they are structured.
Each method corresponds to a specific HTTP method (GET, POST, PUT, PATCH, DELETE)
and handles the request and response in a consistent manner.

Each method is designed to be reusable and can be extended or overridden in subclasses if needed.
if you need to add custom headers or handle specific response formats,
you can do so by extending this class and overriding the methods as necessary.
EXAMPLE:
class CustomHttpClient extends BaseHttpClient {
    protected async handleResponse<T>(response: Response): Promise<T> {
        // Custom response handling logic
        if (response.status === 200) {
            return super.handleResponse<T>(response);
        }
        throw new ApiError(response.status, response.statusText, 'Custom error message');
    }
}
This allows you to maintain the core functionality of the BaseHttpClient while adding custom behavior where needed

as a base class, it can be extended by other services to provide specific functionality
for example, you can create a service that extends BaseHttpClient to handle authentication-related API calls
This promotes code reuse and adheres to the Single Responsibility Principle, as each service can focus on
its specific domain logic while relying on the BaseHttpClient for HTTP communication.

If you need to create a new service that requires HTTP communication,
you can simply extend this BaseHttpClient class and implement the specific methods for that service.

WARNING:
This class is not intended to be instantiated directly.
It is meant to be extended by other service classes that will implement specific API calls.

TO USE:
1. Import the BaseHttpClient class in your service file.
2. Extend the BaseHttpClient class in your service class.
3. Implement the specific API methods in your service class using the inherited methods from BaseHttpClient
4. Use the service class to make API calls.
5. Ensure that the service class adheres to the Single Responsibility Principle by focusing on a specific
   domain or functionality, while the BaseHttpClient handles the HTTP communication details.

DON'T:
- Do not instantiate BaseHttpClient directly.
- Do not use BaseHttpClient for anything other than HTTP communication.
- Do not mix concerns; keep the HTTP logic separate from business logic.

*/
export class BaseHttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // ถ้า decode ไม่ได้ ถือว่าหมดอายุ
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
      });

      if (!response.ok) {
        // ถ้า refresh token หมดอายุ ให้ลบออกจาก localStorage
        if (response.status === 401) {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
        return null;
      }

      const data = await response.json();
      const newAccessToken = data?.accessToken ?? data?.access_token ?? data?.token ?? null;
      
      if (newAccessToken) {
        localStorage.setItem('authToken', newAccessToken);
        return newAccessToken;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Handles the HTTP response.
   * Parses the response and throws an error if the response is not OK.
   * @param response 
   * @returns 
   * 
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        if (errorData) {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        }
      } catch {
        errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      }
      
      throw new ApiError(response.status, response.statusText, errorMessage, response);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ApiError(response.status, response.statusText, 'Invalid JSON response');
    }
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Debug: แสดง tokens ใน localStorage
    const authToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // ตรวจสอบและ refresh token ถ้าจำเป็น
    let token = authToken;
    
    // ถ้าไม่มี authToken แต่มี refreshToken ให้พยายาม refresh
    if (!token && refreshToken) {
      token = await this.refreshAccessToken();
    }
    // ถ้ามี authToken แต่หมดอายุ ให้ refresh
    else if (token && this.isTokenExpired(token)) {
      token = await this.refreshAccessToken();
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // ใส่ token ในทุก request ถ้ามี
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    // ถ้าได้ 401 และมี refreshToken ให้ลอง refresh แล้วส่งซ้ำ
    if (response.status === 401 && refreshToken) {
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        // ส่ง request ซ้ำด้วย token ใหม่
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        
        const retryResponse = await fetch(url, retryConfig);
        return this.handleResponse<T>(retryResponse);
      }
    }

    return this.handleResponse<T>(response);
  }

  protected get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  protected post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const createHttpClient = (baseUrl?: string): BaseHttpClient => {
  return new BaseHttpClient(baseUrl || ENV_CONFIG.API_BASE_URL);
};
