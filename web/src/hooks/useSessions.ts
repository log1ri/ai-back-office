import { useQuery } from '@tanstack/react-query';
import type { SessionFilters, SessionResponse, CountClosedSessionResponse } from '../types/api.types';
import { ocrServicesSessionService } from '../services';
// Query Keys
export const SESSION_QUERY_KEYS = {
  all: ['sessions'] as const,
  lists: () => [...SESSION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: SessionFilters, subId?: string) => [...SESSION_QUERY_KEYS.lists(), filters, subId] as const,
  details: () => [...SESSION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SESSION_QUERY_KEYS.details(), id] as const,
};

// Get sessions with filters
export const useSessions = (filters?: SessionFilters, subId?: string) => {
  // Use default subId if not provided - you can get this from context or props
  const defaultSubId = subId || 'tes';
  
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.list(filters || {}, defaultSubId),
    queryFn: async () => {
      // const response = await fetchSessions(filters || {}, defaultSubId);
      const params = {
        search: filters?.search,
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 10,
        status: filters?.status,
        sortBy: filters?.sortBy,
        order: filters?.order,
      };
      const response: SessionResponse = await ocrServicesSessionService.getFilteredSessions(defaultSubId, params);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Get single session detail
export const useSession = (id: string) => {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.detail(id),
    queryFn: async () => {
      // If you have a detail endpoint, use it here
      // For now, we can fetch from the list and find the specific session
      return null;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};


// Get single session detail
export const useCountClosedSession = (subId?: string) => {
  const defaultSubId = subId || 'tes';
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.detail(defaultSubId),
    queryFn: async () => {
      const response: CountClosedSessionResponse = await ocrServicesSessionService.getClosedSession(defaultSubId);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};