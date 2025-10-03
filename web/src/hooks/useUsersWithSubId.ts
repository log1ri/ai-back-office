import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserService } from '../services/user-with-subid.service';
import { useSubIdContext } from '../contexts/SubIdContext';
import type { CreateUserDto, UpdateUserDto } from '../types/api.types';

// Query Keys - now include subId for better cache separation
export const USER_QUERY_KEYS = {
  all: (subId: string) => ['users', subId] as const,
  lists: (subId: string) => [...USER_QUERY_KEYS.all(subId), 'list'] as const,
  list: (subId: string, filters: Record<string, any>) => [...USER_QUERY_KEYS.lists(subId), { filters }] as const,
  details: (subId: string) => [...USER_QUERY_KEYS.all(subId), 'detail'] as const,
  detail: (subId: string, id: string) => [...USER_QUERY_KEYS.details(subId), id] as const,
};

// Get all users with subId context
export const useUsersWithSubId = () => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);

  return useQuery({
    queryKey: USER_QUERY_KEYS.lists(subId),
    queryFn: async () => {
      const response = await userService.getUsers();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single user by ID with subId context
export const useUserWithSubId = (userId: string, enabled = true) => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);

  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(subId, userId),
    queryFn: async () => {
      const response = await userService.getUser(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create user mutation with subId context
export const useCreateUserWithSubId = () => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);
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
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.lists(subId),
      });
    },
  });
};

// Update user mutation with subId context
export const useUpdateUserWithSubId = () => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);
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
      // Update the specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(subId, variables.id), data);
      
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.lists(subId),
      });
    },
  });
};

// Delete user mutation with subId context
export const useDeleteUserWithSubId = () => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userService.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      return userId;
    },
    onSuccess: (deletedUserId) => {
      // Remove user from cache
      queryClient.removeQueries({
        queryKey: USER_QUERY_KEYS.detail(subId, deletedUserId),
      });
      
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.lists(subId),
      });
    },
  });
};

// Bulk operations with subId context
export const useBulkDeleteUsersWithSubId = () => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      const deletePromises = userIds.map(id => userService.deleteUser(id));
      const results = await Promise.allSettled(deletePromises);
      
      const failedDeletions = results
        .map((result, index) => ({ result, id: userIds[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ id }) => id);

      if (failedDeletions.length > 0) {
        throw new Error(`Failed to delete users: ${failedDeletions.join(', ')}`);
      }

      return userIds;
    },
    onSuccess: (deletedUserIds) => {
      // Remove all deleted users from cache
      deletedUserIds.forEach(userId => {
        queryClient.removeQueries({
          queryKey: USER_QUERY_KEYS.detail(subId, userId),
        });
      });
      
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.lists(subId),
      });
    },
  });
};

// Prefetch user data
export const usePrefetchUserWithSubId = () => {
  const { subId } = useSubIdContext();
  const userService = createUserService(subId);
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: USER_QUERY_KEYS.detail(subId, userId),
      queryFn: async () => {
        const response = await userService.getUser(userId);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch user');
        }
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
