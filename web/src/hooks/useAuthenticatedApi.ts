import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

export const useAuthenticatedApi = () => {
  const { getValidToken, logout } = useAuth();

  const makeAuthenticatedRequest = useCallback(
    async (
      url: string, 
      options: RequestInit = {},
      skipTokenCheck = false
    ): Promise<Response> => {
      // Get valid token (will refresh if needed)
      const token = await getValidToken();
      
      if (!token && !skipTokenCheck) {
        throw new Error('No valid token available');
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.log('[AuthAPI] Received 401, attempting token refresh...');
        
        // Try to refresh token one more time
        const refreshedToken = await getValidToken();
        
        if (refreshedToken && refreshedToken !== token) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${refreshedToken}`;
          
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          
          if (retryResponse.status === 401) {
            // Still 401, logout user
            logout();
            throw new Error('Authentication failed. Please login again.');
          }
          
          return retryResponse;
        } else {
          // Refresh failed, logout user
          logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    },
    [getValidToken, logout]
  );

  return { makeAuthenticatedRequest };
};
