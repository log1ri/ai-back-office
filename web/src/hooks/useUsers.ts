import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services';
import type { CreateUserDto, UpdateUserDto } from '../types/api.types';

// Query Keys - centralized for better maintainability
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...USER_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
};

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await userService.getUsers();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await userService.getUser(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: !!id, // Only run if ID is provided
    staleTime: 5 * 60 * 1000,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const response = await userService.createUser(userData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create user');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: UpdateUserDto }) => {
      const response = await userService.updateUser(id, userData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update user');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(variables.id), data);
      // Invalidate users list to ensure consistency
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await userService.deleteUser(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(deletedId) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

// Batch create users mutation
export const useCreateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usersData: CreateUserDto[]) => {
      const response = await userService.createUsers(usersData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create users');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};

// Batch update users mutation
export const useUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: UpdateUserDto }>) => {
      const response = await userService.updateUsers(updates);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update users');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
    },
  });
};

// Batch delete users mutation
export const useDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await userService.deleteUsers(ids);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete users');
      }
      return ids;
    },
    onSuccess: (deletedIds) => {
      // Remove all deleted users from cache
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });
    },
  });
};
