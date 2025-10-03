import { BaseHttpClient } from './base-http-client';
import type { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  ApiResponse 
} from '../types/api.types';

// Single Responsibility Principle - Only handles user-related API calls
export class UserService extends BaseHttpClient {
  
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.get<ApiResponse<User[]>>('/api/v1/users');
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/api/v1/users/${id}`);
  }

  async createUser(userData: CreateUserDto): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>>('/api/v1/users', userData);
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>(`/api/v1/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/api/v1/users/${id}`);
  }

  async createUsers(usersData: CreateUserDto[]): Promise<ApiResponse<User[]>> {
    return this.post<ApiResponse<User[]>>('/api/v1/users/batch', { users: usersData });
  }

  async updateUsers(updates: Array<{ id: string; data: UpdateUserDto }>): Promise<ApiResponse<User[]>> {
    return this.patch<ApiResponse<User[]>>('/api/v1/users/batch-update', { updates });
  }

  async deleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>('/api/v1/users/batch-delete', { body: JSON.stringify({ ids }) });
  }
}
