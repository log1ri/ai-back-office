import { useState, useCallback, useEffect } from 'react';
import { apiClient, type User, type CreateUserDto } from '../lib/api-client';


interface UseAutoFallbackApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  clientInfo: { type: string; status: string };
  healthStatus: { [key: string]: { healthy: boolean; lastCheck: number } };
}

interface UseAutoFallbackApiReturn<T> extends UseAutoFallbackApiState<T> {
  refetch: () => Promise<void>;
  clearError: () => void;
  forceHealthCheck: () => Promise<void>;
}

// Hook สำหรับจัดการ Users ด้วย Auto-Fallback
export function useAutoFallbackUsers(): UseAutoFallbackApiReturn<User[]> {
  const [state, setState] = useState<UseAutoFallbackApiState<User[]>>({
    data: null,
    loading: false,
    error: null,
    clientInfo: apiClient.getCurrentClientInfo(),
    healthStatus: apiClient.getHealthStatus(),
  });

  const fetchUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data || null, 
          loading: false, 
          error: null,
          clientInfo: apiClient.getCurrentClientInfo(),
          healthStatus: apiClient.getHealthStatus(),
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          data: null, 
          loading: false, 
          error: response.error || 'Failed to fetch users',
          clientInfo: apiClient.getCurrentClientInfo(),
          healthStatus: apiClient.getHealthStatus(),
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        clientInfo: apiClient.getCurrentClientInfo(),
        healthStatus: apiClient.getHealthStatus(),
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const forceHealthCheck = useCallback(async () => {
    await apiClient.forceHealthCheck();
    setState(prev => ({
      ...prev,
      clientInfo: apiClient.getCurrentClientInfo(),
      healthStatus: apiClient.getHealthStatus(),
    }));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    ...state,
    refetch: fetchUsers,
    clearError,
    forceHealthCheck,
  };
}

// Hook สำหรับสร้าง User ด้วย Auto-Fallback
export function useAutoFallbackCreateUser() {
  const [state, setState] = useState<UseAutoFallbackApiState<User>>({
    data: null,
    loading: false,
    error: null,
    clientInfo: apiClient.getCurrentClientInfo(),
    healthStatus: apiClient.getHealthStatus(),
  });

  const createUser = useCallback(async (userData: CreateUserDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.createUser(userData);
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data || null, 
          loading: false, 
          error: null,
          clientInfo: apiClient.getCurrentClientInfo(),
          healthStatus: apiClient.getHealthStatus(),
        }));
        return response.data;
      } else {
        setState(prev => ({ 
          ...prev, 
          data: null, 
          loading: false, 
          error: response.error || 'Failed to create user',
          clientInfo: apiClient.getCurrentClientInfo(),
          healthStatus: apiClient.getHealthStatus(),
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        clientInfo: apiClient.getCurrentClientInfo(),
        healthStatus: apiClient.getHealthStatus(),
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const forceHealthCheck = useCallback(async () => {
    await apiClient.forceHealthCheck();
    setState(prev => ({
      ...prev,
      clientInfo: apiClient.getCurrentClientInfo(),
      healthStatus: apiClient.getHealthStatus(),
    }));
  }, []);

  return {
    ...state,
    createUser,
    clearError,
    forceHealthCheck,
  };
}

// Hook สำหรับสร้าง Users หลายคนด้วย Auto-Fallback
export function useAutoFallbackCreateUsers() {
  const [state, setState] = useState<UseAutoFallbackApiState<User[]>>({
    data: null,
    loading: false,
    error: null,
    clientInfo: apiClient.getCurrentClientInfo(),
    healthStatus: apiClient.getHealthStatus(),
  });

  const createUsers = useCallback(async (usersData: CreateUserDto[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.createUsers(usersData);
      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          data: response.data || null, 
          loading: false, 
          error: null,
          clientInfo: apiClient.getCurrentClientInfo(),
          healthStatus: apiClient.getHealthStatus(),
        }));
        return response.data;
      } else {
        setState(prev => ({ 
          ...prev, 
          data: null, 
          loading: false, 
          error: response.error || 'Failed to create users',
          clientInfo: apiClient.getCurrentClientInfo(),
          healthStatus: apiClient.getHealthStatus(),
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        clientInfo: apiClient.getCurrentClientInfo(),
        healthStatus: apiClient.getHealthStatus(),
      }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const forceHealthCheck = useCallback(async () => {
    await apiClient.forceHealthCheck();
    setState(prev => ({
      ...prev,
      clientInfo: apiClient.getCurrentClientInfo(),
      healthStatus: apiClient.getHealthStatus(),
    }));
  }, []);

  return {
    ...state,
    createUsers,
    clearError,
    forceHealthCheck,
  };
}

// Hook สำหรับดูสถานะ Auto-Fallback API Client
export function useAutoFallbackStatus() {
  const [status, setStatus] = useState({
    clientInfo: apiClient.getCurrentClientInfo(),
    healthStatus: apiClient.getHealthStatus(),
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        clientInfo: apiClient.getCurrentClientInfo(),
        healthStatus: apiClient.getHealthStatus(),
      });
    };

    // อัปเดตสถานะทุก 5 วินาที
    const interval = setInterval(updateStatus, 5000);
    updateStatus(); // อัปเดตครั้งแรก

    return () => clearInterval(interval);
  }, []);

  const forceHealthCheck = useCallback(async () => {
    await apiClient.forceHealthCheck();
    setStatus({
      clientInfo: apiClient.getCurrentClientInfo(),
      healthStatus: apiClient.getHealthStatus(),
    });
  }, []);

  return {
    ...status,
    forceHealthCheck,
  };
} 