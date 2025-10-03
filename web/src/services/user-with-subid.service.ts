import { BaseHttpClient } from './base-http-client';
import { ENV_CONFIG } from '../config/environment';
import type { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  ApiResponse 
} from '../types/api.types';

// Enhanced UserService that supports subId-aware operations
export class UserServiceWithSubId extends BaseHttpClient {
  private subId: string;

  constructor(subId: string = 'default') {
    super(ENV_CONFIG.API_BASE_URL);
    this.subId = subId;
  }

  // Method to update subId if needed
  setSubId(subId: string): void {
    this.subId = subId;
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.get<ApiResponse<User[]>>(`/api/v1/${this.subId}/users`);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/api/v1/${this.subId}/users/${id}`);
  }

  async createUser(userData: CreateUserDto): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>(`/api/v1/${this.subId}/users`, userData);
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>(`/api/v1/${this.subId}/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/api/v1/${this.subId}/users/${id}`);
  }
}

// Factory function to create a service instance with a specific subId
export const createUserService = (subId: string = 'default'): UserServiceWithSubId => {
  return new UserServiceWithSubId(subId);
};

// Default instance for backward compatibility
export const userService = new UserServiceWithSubId('default');
