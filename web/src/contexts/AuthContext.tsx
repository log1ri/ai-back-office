import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
  firstname?: string;
  lastName?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstname: string, lastName: string, position: string) => Promise<boolean>; 
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  isTokenExpired: () => boolean;
  getValidToken: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // helper: ต่อ relative path ให้เนียน
  function joinRel(path: string) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // Helper function to check if token is expired
  const isTokenExpiredCheck = (tokenToCheck: string): boolean => {
    try {
      const decoded: any = jwtDecode(tokenToCheck);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Check if current token is expired
  const isTokenExpired = (): boolean => {
    if (!token) return true;
    return isTokenExpiredCheck(token);
  };

  // ---- refreshToken ----
  const refreshToken = async (): Promise<string | null> => {
    const url = joinRel('/api/v1/auth/refresh-token'); // << ใช้ path ที่ตรงกับ backend global prefix
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (!storedRefreshToken) {
      return null;
    }

    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 8000);

    try {
      const res = await fetch(url, {
        method: 'POST',          // backend ใช้ POST
        credentials: 'include',  // ส่ง/รับ cookie ผ่าน proxy ได้
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedRefreshToken}` // ส่ง refresh token
        },
        signal: ctl.signal,
      });

      if (!res.ok) {
        // ถ้า refresh token หมดอายุ ให้ลบออกจาก localStorage
        if (res.status === 401) {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
        return null;
      }

      const json = await res.json();
      
      const access = json?.accessToken ?? json?.access_token ?? json?.token ?? null;
      if (access) {
        localStorage.setItem('authToken', access);
        setToken(access);
        return access;
      }
      return null;
    } finally {
      clearTimeout(to);
    }
  };

  // ---- getValidToken ----
  const getValidToken = async (): Promise<string | null> => {
    if (!token) return await refreshToken();
    if (isTokenExpired()) return await refreshToken();
    return token;
  };

  // ---- bootstrap (useEffect แรก) ----
  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem('authToken');
        
        if (stored && !isTokenExpiredCheck(stored)) {
          setToken(stored);
          const userData = localStorage.getItem('userData');
          if (userData) setUser(JSON.parse(userData));
          return;
        }
        
        const newToken = await refreshToken(); // ถ้า cookie/route พร้อม จะตั้ง access กลับมา
        
        if (newToken) {
          // ดึง user profile หลังจาก refresh สำเร็จ
          try {
            const profileRes = await fetch(joinRel('/api/v1/users/profile'), {
              headers: { Authorization: `Bearer ${newToken}` },
              credentials: 'include',
            });
          
            if (profileRes.ok) {
              const userData = await profileRes.json();
              localStorage.setItem('userData', JSON.stringify(userData));
              setUser(userData);
            }
          } catch (profileError) {
            // Error handling for profile fetch
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoading(false); // กันค้าง
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await apiClient.login({ email, password });
      let userData;
      // ถ้ามี user object ใน result ให้ใช้, ถ้าไม่มีก็ decode JWT
      if (result && result.user) {
        userData = {
          id: result.user.id || '',
          email: result.user.email || email,
          name: result.user.name || '',
          firstname: result.user.firstname || '',
          lastName: result.user.lastName || '',
          position: result.user.position || '',
        };
      } else if (result && typeof result.access_token === 'string') {
        // decode JWT เพื่อดึงข้อมูล user
        const decoded: any = jwtDecode(result.access_token);
        userData = {
          id: decoded.sub || '',
          email: decoded.email || email,
          name: decoded.name || '',
          firstname: decoded.firstname || '',
          lastName: decoded.lastName || '',
          position: decoded.position || '',
        };
      } else {
        setIsLoading(false);
        return false;
      }

      const access =
        typeof (result as any)?.access_token === 'string' ? (result as any).access_token :
        typeof (result as any)?.token === 'string'        ? (result as any).token :
        null;

      const refresh =
        typeof (result as any)?.refreshToken === 'string' ? (result as any).refreshToken :
        typeof (result as any)?.refresh_token === 'string' ? (result as any).refresh_token :
        null;

      if (access) {
        localStorage.setItem('authToken', access);
        setToken(access);
        
        // เก็บ refresh token ถ้ามี
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }
      } else {
        const t = await refreshToken();  // backend ตั้ง cookie แล้ว ขอผ่าน refresh
        if (!t) { setIsLoading(false); return false; }
      }

      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsLoading(false);
      return !!localStorage.getItem('authToken');
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  // **ปรับปรุง register function ให้รับ fields ใหม่**
  const register = async (
    email: string,
    password: string,
    firstname: string,
    lastName: string,
    position: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await apiClient.registerUser({
        email,
        password,
        firstname,
        lastname: lastName,
        position
      });
      setIsLoading(false);
      if (typeof result === 'object' && result !== null && 'success' in result) {
        return (result as any).success;
      }
      return true;
    } catch (error: any) {
      setIsLoading(false);
      if (error?.response?.message) {
        setError(error.response.message);
      } else {
        setError('Registration failed. Email might already be in use or another error occurred.');
      }
      return false;
    }
  };


  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register, 
    logout,
    refreshToken,
    isTokenExpired,
    getValidToken,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
