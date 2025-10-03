import { BaseHttpClient } from './base-http-client';
import type { LoginCredentials, AuthResponse, ApiResponse } from '../types/api.types';

// Single Responsibility Principle - Only handles authentication API calls
export class AuthService extends BaseHttpClient {
  
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>>('/api/v1/auth/sign-in', credentials);
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.post<ApiResponse<void>>('/api/v1/auth/logout');
    
    // Clear local storage on successful logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    return result;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>>('/api/v1/auth/refresh', { refreshToken });
  }

  async register(userData: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    position: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>>('/api/v1/auth/sign-up', userData);
  }
}
