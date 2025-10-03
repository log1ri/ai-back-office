import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// Hook to get the current subId from URL params
export function useSubId(): string {
  const [subId, setSubId] = useState<string>('default');

  useEffect(() => {
    // Extract subId from current URL path
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment.length > 0);
    
    // If the first segment exists and it's not a known route, it's likely a subId
    if (pathSegments.length > 0) {
      const potentialSubId = pathSegments[0];
      // Check if it's not a known static route
      const staticRoutes = ['login', 'register', 'about', 'contact'];
      if (!staticRoutes.includes(potentialSubId)) {
        setSubId(potentialSubId);
      }
    }
  }, []);

  return subId;
}

// Hook to navigate with subId preserved
export function useSubIdNavigation() {
  const subId = useSubId();

  const navigateWithSubId = (path: string) => {
    const fullPath = `/${subId}${path.startsWith('/') ? path : `/${path}`}`;
    window.location.href = fullPath;
  };

  const buildUrlWithSubId = (path: string): string => {
    return `/${subId}${path.startsWith('/') ? path : `/${path}`}`;
  };

  return {
    subId,
    navigateWithSubId,
    buildUrlWithSubId,
  };
}

// Context for subId to avoid prop drilling
interface SubIdContextType {
  subId: string;
  setSubId: (subId: string) => void;
  navigateWithSubId: (path: string) => void;
  buildUrlWithSubId: (path: string) => string;
}

const SubIdContext = createContext<SubIdContextType | null>(null);

interface SubIdProviderProps {
  children: ReactNode;
}

export function SubIdProvider({ children }: SubIdProviderProps) {
  const [subId, setSubId] = useState<string>('default');

  useEffect(() => {
    // Extract subId from current URL path
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment.length > 0);
    
    if (pathSegments.length > 0) {
      const potentialSubId = pathSegments[0];
      const staticRoutes = ['login', 'register', 'about', 'contact'];
      if (!staticRoutes.includes(potentialSubId)) {
        setSubId(potentialSubId);
      }
    }
  }, []);

  const navigateWithSubId = (path: string) => {
    const fullPath = `/${subId}${path.startsWith('/') ? path : `/${path}`}`;
    window.location.href = fullPath;
  };

  const buildUrlWithSubId = (path: string): string => {
    return `/${subId}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const value: SubIdContextType = {
    subId,
    setSubId,
    navigateWithSubId,
    buildUrlWithSubId,
  };

  return SubIdContext.Provider({ value, children });
}

export function useSubIdContext(): SubIdContextType {
  const context = useContext(SubIdContext);
  if (!context) {
    throw new Error('useSubIdContext must be used within a SubIdProvider');
  }
  return context;
}
