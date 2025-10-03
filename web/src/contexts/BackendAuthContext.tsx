import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../lib/api-client';
import type { BackendUser, LoginCredentials, AuthResponse } from '../lib/api-client';


interface BackendAuthContextType {
  user: BackendUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthResponse>;
}

const BackendAuthContext = createContext<BackendAuthContextType | undefined>(undefined);

interface BackendAuthProviderProps {
  children: ReactNode;
}

export function BackendAuthProvider({ children }: BackendAuthProviderProps) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตรวจสอบ authentication เมื่อ component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // ตรวจสอบว่ามี token หรือไม่
      if (apiClient.isBackendAuthenticated()) {
        // ลอง refresh token เพื่อตรวจสอบว่า token ยังใช้งานได้
        const authResponse = await apiClient.refreshAuthToken();
        setUser(authResponse.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // ถ้า refresh ไม่สำเร็จ ให้ logout
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const authResponse = await apiClient.login(credentials);
      setUser(authResponse.user);
      return authResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const authResponse = await apiClient.refreshAuthToken();
      setUser(authResponse.user);
      return authResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const value: BackendAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <BackendAuthContext.Provider value={value}>
      {children}
    </BackendAuthContext.Provider>
  );
}

export function useBackendAuth() {
  const context = useContext(BackendAuthContext);
  if (context === undefined) {
    throw new Error('useBackendAuth must be used within a BackendAuthProvider');
  }
  return context;
} 