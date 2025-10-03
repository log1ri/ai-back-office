export interface User {
  id: string;
  email: string;
  name: string;
  firstname?: string;
  lastName?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstname: string;
  lastName: string;
  position?: string;
}

export interface UpdateUserDto {
  firstname?: string;
  lastName?: string;
  email?: string;
  position?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface BackendUser extends User {
  role?: string;
  permissions?: string[];
}
