import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import type { LoginCredentials } from '../types/api.types';
import { USER_QUERY_KEYS } from './useUsers';
import { ORGANIZATION_QUERY_KEYS } from './useOrganizations';

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstname: string;
      lastname: string;
      position: string;
    }) => {
      const response = await authService.register(userData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens after successful registration
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    },
  });
};

// Refresh token mutation
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await authService.refreshToken(refreshToken);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Token refresh failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update stored tokens
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    },
  });
};
