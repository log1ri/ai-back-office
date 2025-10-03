import { useState, useCallback, useEffect } from 'react';
import { apiClient, type LoginCredentials, type AuthResponse } from '../lib/api-client';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
}

// Hook สำหรับจัดการ Authentication ด้วย Access Token และ Refresh Token
export function useAuthTokens(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ฟังก์ชันสำหรับโหลด auth state จาก localStorage
  const loadAuthState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const accessToken = localStorage.getItem('backend_token');
      const refreshToken = localStorage.getItem('backend_refresh_token');
      const userData = localStorage.getItem('user_data');
      
      const user = userData ? JSON.parse(userData) : null;
      const isAuthenticated = !!(accessToken && user);
      
      setAuthState(prev => ({
        ...prev,
        accessToken,
        refreshToken,
        user,
        isAuthenticated,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to load authentication state',
        isLoading: false,
      }));
    }
  }, []);

  // ฟังก์ชันสำหรับบันทึก auth state ไป localStorage
  const saveAuthState = useCallback((tokens: { accessToken: string; refreshToken: string }, user: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('backend_token', tokens.accessToken);
      localStorage.setItem('backend_refresh_token', tokens.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      setAuthState(prev => ({
        ...prev,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        isAuthenticated: true,
        error: null,
      }));
    } catch (error) {
      console.error('Error saving auth state:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to save authentication state',
      }));
    }
  }, []);

  // ฟังก์ชันสำหรับเคลียร์ auth state
  const clearAuthState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('backend_token');
    localStorage.removeItem('backend_refresh_token');
    localStorage.removeItem('user_data');
    
    setAuthState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // ฟังก์ชันสำหรับ Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.login(credentials);
      
      if (response.access_token && response.user) {
        saveAuthState(
          { 
            accessToken: response.access_token, 
            refreshToken: response.refreshToken 
          }, 
          response.user
        );
        return true;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Invalid response from server',
      }));
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [saveAuthState]);

  // ฟังก์ชันสำหรับ Logout
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  // ฟังก์ชันสำหรับ Refresh Token
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    if (!authState.refreshToken) {
      clearAuthState();
      return false;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.refreshAuthToken();
      
      if (response.access_token && response.user) {
        saveAuthState(
          { 
            accessToken: response.access_token, 
            refreshToken: response.refreshToken 
          }, 
          response.user
        );
        return true;
      }
      
      clearAuthState();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthState();
      return false;
    }
  }, [authState.refreshToken, saveAuthState, clearAuthState]);

  // ฟังก์ชันสำหรับเคลียร์ error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // โหลด auth state เมื่อ component mount
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  return {
    ...authState,
    login,
    logout,
    refreshAuth,
    clearError,
  };
}

// Hook สำหรับตรวจสอบและ refresh token อัตโนมัติ
export function useAutoRefreshToken(): void {
  const { refreshAuth, accessToken, isAuthenticated } = useAuthTokens();
  
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    
    // ตรวจสอบ token ทุก 5 นาที
    const interval = setInterval(async () => {
      try {
        // ตรวจสอบว่า token ใกล้หมดอายุหรือไม่
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // ถ้าเหลือเวลาน้อยกว่า 5 นาที ให้ refresh
        if (timeUntilExpiration < 5 * 60 * 1000) {
          console.log('Token expiring soon, refreshing...');
          await refreshAuth();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    }, 5 * 60 * 1000); // ตรวจสอบทุก 5 นาที
    
    return () => clearInterval(interval);
  }, [accessToken, isAuthenticated, refreshAuth]);
}

// Hook สำหรับทำ API request พร้อม auth และ credentials: "include"
export function useAuthenticatedRequest() {
  const { accessToken, refreshAuth, logout } = useAuthTokens();
  
  const makeRequest = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    let token = accessToken;
    
    // ถ้าไม่มี token ให้ลอง refresh ก่อน
    if (!token) {
      const refreshSuccess = await refreshAuth();
      if (!refreshSuccess) {
        throw new Error('Authentication required');
      }
      token = localStorage.getItem('backend_token');
    }
    
    // เพิ่ม Authorization header
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    
    const response = await fetch(url, {
      credentials: 'include', // เพิ่ม credentials: include สำหรับ cookies
      ...options,
      headers,
    });
    
    // ถ้าได้ 401 ให้ลอง refresh token
    if (response.status === 401) {
      const refreshSuccess = await refreshAuth();
      if (refreshSuccess) {
        // ลองอีกครั้งด้วย token ใหม่
        const newToken = localStorage.getItem('backend_token');
        const retryResponse = await fetch(url, {
          credentials: 'include',
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
        
        if (retryResponse.status === 401) {
          // ยังไม่ได้ ให้ logout
          await logout();
          throw new Error('Authentication failed');
        }
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
        }
        
        return retryResponse.json();
      } else {
        await logout();
        throw new Error('Authentication failed');
      }
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }, [accessToken, refreshAuth, logout]);
  
  return { makeRequest };
}

// Hook สำหรับจัดการ Token lifecycle
export function useTokenManager() {
  const { accessToken, refreshToken, refreshAuth, logout } = useAuthTokens();
  
  // ตรวจสอบว่า token ใกล้หมดอายุหรือไม่
  const isTokenExpiringSoon = useCallback((token: string, minutes: number = 5): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      return timeUntilExpiration < minutes * 60 * 1000;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // ถ้า parse ไม่ได้ ถือว่าหมดอายุ
    }
  }, []);
  
  // ตรวจสอบและ refresh token หากจำเป็น
  const ensureValidToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken) {
      await logout();
      return null;
    }
    
    if (isTokenExpiringSoon(accessToken)) {
      console.log('Token expiring soon, attempting refresh...');
      const refreshSuccess = await refreshAuth();
      
      if (refreshSuccess) {
        return localStorage.getItem('backend_token');
      } else {
        await logout();
        return null;
      }
    }
    
    return accessToken;
  }, [accessToken, isTokenExpiringSoon, refreshAuth, logout]);
  
  return {
    accessToken,
    refreshToken,
    isTokenExpiringSoon,
    ensureValidToken,
    refreshAuth,
    logout,
  };
}

// Hook สำหรับ Login form
export function useLoginForm() {
  const { login, isLoading, error } = useAuthTokens();
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setFormError(null);
    
    try {
      const success = await login({ email, password });
      
      if (!success) {
        setFormError('Invalid email or password');
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setFormError(errorMessage);
      return false;
    }
  }, [login]);
  
  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);
  
  return {
    handleLogin,
    isLoading,
    error: formError || error,
    clearError: clearFormError,
  };
}
