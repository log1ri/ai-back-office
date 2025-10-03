import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { OCR_LOG_QUERY_KEYS } from '../hooks/useOcrLogs';
import { IMAGE_SERVICES_QUERY_KEYS } from '../hooks/useImageServices';
import { IMAGE_QUERY_KEYS } from '../hooks/useImages';
import { USER_QUERY_KEYS } from '../hooks/useUsersWithSubId';

/**
 * Utility hook for managing cache invalidation when organization context changes
 * This ensures that all organization-dependent data is refreshed when switching teams
 */
export const useOrganizationCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateOrganizationCache = useCallback(async (orgId: string) => {
    
    const invalidationPromises = [
      // OCR Logs
      queryClient.invalidateQueries({
        queryKey: OCR_LOG_QUERY_KEYS.all(orgId)
      }),
      
      // Image Services
      queryClient.invalidateQueries({
        queryKey: IMAGE_SERVICES_QUERY_KEYS.all(orgId)
      }),
      
      // General Images (organization-independent but may need refresh)
      queryClient.invalidateQueries({
        queryKey: IMAGE_QUERY_KEYS.all
      }),
      
      // Users with SubId
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.all(orgId)
      })
    ];

    await Promise.all(invalidationPromises);
  }, [queryClient]);

  const clearOrganizationCache = useCallback(async (orgId: string) => {
    
    // Remove all cached data for the organization
    queryClient.removeQueries({
      queryKey: OCR_LOG_QUERY_KEYS.all(orgId)
    });
    
    queryClient.removeQueries({
      queryKey: IMAGE_SERVICES_QUERY_KEYS.all(orgId)
    });
    
    queryClient.removeQueries({
      queryKey: USER_QUERY_KEYS.all(orgId)
    });

  }, [queryClient]);

  const prefetchOrganizationData = useCallback(async (orgId: string) => {
    
    // Prefetch critical data for the new organization
    const prefetchPromises = [
      // Prefetch first page of OCR logs
      queryClient.prefetchQuery({
        queryKey: OCR_LOG_QUERY_KEYS.list(orgId, { page: 1, limit: 20 }),
        staleTime: 30 * 1000,
      }),
      
      // Prefetch image count
      queryClient.prefetchQuery({
        queryKey: IMAGE_SERVICES_QUERY_KEYS.count(orgId),
        staleTime: 2 * 60 * 1000,
      }),
    ];

    try {
      await Promise.all(prefetchPromises);
      console.log('Organization data prefetched for:', orgId);
    } catch (error) {
      console.warn('Failed to prefetch some organization data:', error);
    }
  }, [queryClient]);

  return {
    invalidateOrganizationCache,
    clearOrganizationCache,
    prefetchOrganizationData,
  };
};
