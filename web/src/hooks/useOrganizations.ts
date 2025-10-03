import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../services';

// Query Keys
export const ORGANIZATION_QUERY_KEYS = {
  all: ['organizations'] as const,
  lists: () => [...ORGANIZATION_QUERY_KEYS.all, 'list'] as const,
  details: () => [...ORGANIZATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ORGANIZATION_QUERY_KEYS.details(), id] as const,
};

// Get all organizations
export const useOrganizations = () => {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEYS.lists(),
    queryFn: async () => {
      const organizations = await organizationService.getAllOrganizations();
      return organizations;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (organizations don't change often)
    retry: 2, // Limit retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Get single organization
export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await organizationService.getOrganization(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch organization');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};
