import { useQuery } from '@tanstack/react-query';
import type { VehicleSession, SessionFilters, SessionResponse } from '../types/api.types';

// Query Keys
export const SESSION_QUERY_KEYS = {
  all: ['sessions'] as const,
  lists: () => [...SESSION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: SessionFilters, subId?: string) => [...SESSION_QUERY_KEYS.lists(), filters, subId] as const,
  details: () => [...SESSION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SESSION_QUERY_KEYS.details(), id] as const,
};

// Fetch sessions from API
const fetchSessions = async (filters: SessionFilters, subId: string): Promise<SessionResponse> => {
  const params = new URLSearchParams();
  
  // Required parameter
  params.append('subId', subId);
  
  // Optional filters
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);
  
  const url = `http://localhost:5167/api/v1/ocr-services-logs/session?${params.toString()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// Get sessions with filters
export const useSessions = (filters?: SessionFilters, subId?: string) => {
  // Use default subId if not provided - you can get this from context or props
  const defaultSubId = subId || '68df656cf21e1feb3e85421b';
  
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.list(filters || {}, defaultSubId),
    queryFn: async () => {
      const response = await fetchSessions(filters || {}, defaultSubId);
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
