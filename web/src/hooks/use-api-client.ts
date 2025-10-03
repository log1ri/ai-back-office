import { useState, useCallback, useEffect } from 'react';
import { apiClient, type User, type CreateUserDto, type UpdateUserDto } from '../lib/api-client';

interface UseApiClientState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiClientReturn<T> extends UseApiClientState<T> {
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Hook สำหรับจัดการ Users
export function useUsers(): UseApiClientReturn<User[]> {
  const [state, setState] = useState<UseApiClientState<User[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: response.error || 'Failed to fetch users' });
      }
    } catch (error) {
      setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    ...state,
    refetch: fetchUsers,
    clearError,
  };
}

// Hook สำหรับจัดการ User เดี่ยว
export function useUser(id: string): UseApiClientReturn<User> {
  const [state, setState] = useState<UseApiClientState<User>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    if (!id) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.getUser(id);
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: response.error || 'Failed to fetch user' });
      }
    } catch (error) {
      setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [id]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    ...state,
    refetch: fetchUser,
    clearError,
  };
}

// Hook สำหรับสร้าง User
export function useCreateUser() {
  const [state, setState] = useState<UseApiClientState<User>>({
    data: null,
    loading: false,
    error: null,
  });

  const createUser = useCallback(async (userData: CreateUserDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.createUser(userData);
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } else {
        setState({ data: null, loading: false, error: response.error || 'Failed to create user' });
        return null;
      }
    } catch (error) {
      setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createUser,
    clearError,
  };
}

// Hook สำหรับสร้าง Users หลายคน
export function useCreateUsers() {
  const [state, setState] = useState<UseApiClientState<User[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const createUsers = useCallback(async (usersData: CreateUserDto[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.createUsers(usersData);
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } else {
        setState({ data: null, loading: false, error: response.error || 'Failed to create users' });
        return null;
      }
    } catch (error) {
      setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createUsers,
    clearError,
  };
}

// Hook สำหรับอัปเดต User
export function useUpdateUser() {
  const [state, setState] = useState<UseApiClientState<User>>({
    data: null,
    loading: false,
    error: null,
  });

  const updateUser = useCallback(async (id: string, userData: UpdateUserDto) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.updateUser(id, userData);
      if (response.success && response.data) {
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } else {
        setState({ data: null, loading: false, error: response.error || 'Failed to update user' });
        return null;
      }
    } catch (error) {
      setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updateUser,
    clearError,
  };
}

// Hook สำหรับลบ User
export function useDeleteUser() {
  const [state, setState] = useState<UseApiClientState<void>>({
    data: null,
    loading: false,
    error: null,
  });

  const deleteUser = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.deleteUser(id);
      if (response.success) {
        setState({ data: undefined, loading: false, error: null });
        return true;
      } else {
        setState({ data: null, loading: false, error: response.error || 'Failed to delete user' });
        return false;
      }
    } catch (error) {
      setState({ data: null, loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    deleteUser,
    clearError,
  };
}

// Hook สำหรับดูสถานะ API Client
export function useApiClientStats() {
  const [stats, setStats] = useState({
    cacheSize: 0,
    pendingRequests: 0,
    queueLength: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = apiClient.getCacheStats();
      setStats({
        cacheSize: cacheStats.size,
        pendingRequests: apiClient.getPendingRequestsCount(),
        queueLength: apiClient.getQueueLength(),
      });
    };

    // อัปเดต stats ทุก 1 วินาที
    const interval = setInterval(updateStats, 1000);
    updateStats(); // อัปเดตครั้งแรก

    return () => clearInterval(interval);
  }, []);

  return stats;
}

// Hook สำหรับทำ API request ด้วย credentials: "include"
export function useApiRequestWithCredentials() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // เพิ่ม credentials: "include" สำหรับ cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    makeRequest,
    loading,
    error,
    clearError,
  };
}
