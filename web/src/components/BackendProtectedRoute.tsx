import React from 'react';
import { useBackendAuth } from '../contexts/BackendAuthContext';
import BackendLoginPage from '../pages/BackendLoginPage';

interface BackendProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function BackendProtectedRoute({ 
  children, 
  fallback 
}: BackendProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useBackendAuth();

  // กำลังโหลด
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  // ถ้าไม่ได้ login ให้แสดงหน้า login
  if (!isAuthenticated) {
    return fallback || <BackendLoginPage />;
  }

  // ถ้า login แล้ว ให้แสดง children
  return <>{children}</>;
} 