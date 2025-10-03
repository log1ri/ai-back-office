import { QueryClient } from '@tanstack/react-query';


/**
 * Global query client configuration for the application.
 * This client is used to manage caching, retries, and other query behaviors.
 * It is created using the `QueryClient` class from `@tanstack/react-query`.
 * * The default options include:
 *  - `staleTime`: 5 minutes, which defines how long data remains fresh
 *  - `cacheTime`: 10 minutes, which defines how long unused data remains in cache
 *  - `retry`: Custom retry logic that limits retries to 2 attempts for failed queries
 *  - `refetchOnWindowFocus`: Disabled to prevent refetching when the window regains focus
 *  - `refetchOnReconnect`: Always refetches when the network reconnects
 *  - `networkMode`: Set to 'online' to ensure queries only run when the network is available
 * This configuration is used throughout the application to ensure consistent query behavior.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, 
      gcTime: 10 * 60 * 1000, 
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 2; 
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'online',
    },
    mutations: {
      retry: false,
      networkMode: 'online',
      onError: (error: any) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
