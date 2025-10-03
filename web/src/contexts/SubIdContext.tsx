import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface SubIdContextType {
  subId: string;
  setSubId: (subId: string) => void;
  navigateWithSubId: (path: string, targetSubId?: string) => void;
  buildUrlWithSubId: (path: string, targetSubId?: string) => string;
}

const SubIdContext = createContext<SubIdContextType | undefined>(undefined);

interface SubIdProviderProps {
  children: ReactNode;
}

export function SubIdProvider({ children }: SubIdProviderProps) {
  const [subId, setSubIdState] = useState<string>('default');
  const queryClient = useQueryClient();

  // Extract subId from URL on mount and URL changes
  useEffect(() => {
    const extractSubIdFromUrl = () => {
      const path = window.location.pathname;
      const pathSegments = path.split('/').filter(segment => segment.length > 0);
      
      console.log('Extracting subId from path:', path, 'segments:', pathSegments);
      
      // Handle new OCR services URL format: /ocr-services/{orgId}/...
      if (pathSegments.length >= 2 && pathSegments[0] === 'ocr-services') {
        const orgId = pathSegments[1];
        console.log('Found orgId in OCR services path:', orgId);
        setSubIdState(orgId);
        return;
      }
      
      // Handle legacy URLs for backward compatibility
      if (pathSegments.length > 0) {
        const potentialSubId = pathSegments[0];
        // Check if it's not a known route
        const staticRoutes = ['login', 'register', 'about', 'contact', 'test', 'overview'];
        
        // If it's other static routes, use 'default' temporarily (don't redirect immediately)
        if (staticRoutes.includes(potentialSubId)) {
          setSubIdState('default');
        } else {
          // If it looks like an organization ID (24 character hex string), use it but redirect to proper format
          if (potentialSubId.length === 24 && /^[0-9a-fA-F]{24}$/.test(potentialSubId)) {
            console.warn('Legacy organization URL detected. Will redirect via OrgRedirectGuard.');
            setSubIdState(potentialSubId);
            return;
          } else {
            // For any other pattern, use default and let other guards handle it
            console.warn('Unknown URL pattern. Using default subId.');
            setSubIdState('default');
          }
        }
      } else {
        // No path segments, use default and let other guards handle redirection
        setSubIdState('default');
      }
    };

    // Extract on mount
    extractSubIdFromUrl();

    // Listen for URL changes (for SPA navigation)
    const handlePopState = () => {
      extractSubIdFromUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setSubId = (newSubId: string) => {
    const oldSubId = subId;
    setSubIdState(newSubId);
    
    // If subId actually changed, invalidate related queries as a safety measure
    if (oldSubId !== newSubId && oldSubId !== 'default' && newSubId !== 'default') {
      console.log('SubId context changed from', oldSubId, 'to', newSubId, '- clearing organization-dependent cache');
      
      // Clear organization-dependent data
      setTimeout(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return Array.isArray(queryKey) && (
              queryKey.includes('ocr-logs') ||
              queryKey.includes('image-services') ||
              queryKey.includes('users')
            );
          }
        });
      }, 100); // Small delay to avoid race conditions
    }
  };

  const navigateWithSubId = (path: string, targetSubId?: string) => {
    const useSubId = targetSubId || subId;
    
    // Enforce that subId cannot be 'default' - user must have a valid organization
    if (useSubId === 'default' || !useSubId) {
      console.error('Cannot navigate without a valid organization ID');
      window.location.href = '/login';
      return;
    }
    
    // Use the new OCR services URL format
    const fullPath = `/ocr-services/${useSubId}${path.startsWith('/') ? path : `/${path}`}`;
    
    // Update the context state if using a different subId
    if (targetSubId && targetSubId !== subId) {
      setSubIdState(targetSubId);
    }
    
    console.log('Navigating to:', fullPath);
    window.location.href = fullPath;
  };

  const buildUrlWithSubId = (path: string, targetSubId?: string): string => {
    const useSubId = targetSubId || subId;
    
    // Enforce that subId cannot be 'default' - user must have a valid organization
    if (useSubId === 'default' || !useSubId) {
      console.error('Cannot build URL without a valid organization ID');
      return '/login';
    }
    
    // Use the new OCR services URL format
    return `/ocr-services/${useSubId}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const value: SubIdContextType = {
    subId,
    setSubId,
    navigateWithSubId,
    buildUrlWithSubId,
  };

  return (
    <SubIdContext.Provider value={value}>
      {children}
    </SubIdContext.Provider>
  );
}

export function useSubIdContext(): SubIdContextType {
  const context = useContext(SubIdContext);
  if (context === undefined) {
    throw new Error('useSubIdContext must be used within a SubIdProvider');
  }
  return context;
}
