import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useOrganizations } from '../hooks/useOrganizations';

interface OrgRedirectGuardProps {
  children: React.ReactNode;
  targetPath?: string; // The path to redirect to (e.g., '/home', '/overview')
}

export function OrgRedirectGuard({ children, targetPath = '/home' }: OrgRedirectGuardProps) {
  const organizationsQuery = useOrganizations();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected || organizationsQuery.isLoading || organizationsQuery.isError) {
      return;
    }

    if (organizationsQuery.data && organizationsQuery.data.length > 0) {
      const currentPath = location.pathname;
      
      // Only redirect from /overview page
      if (currentPath === '/overview') {
        const firstOrg = organizationsQuery.data[0];
        const newPath = `/ocr-services/${firstOrg._id}${targetPath}`;
        
        console.log('OrgRedirectGuard: Redirecting from /overview to:', newPath);
        setHasRedirected(true);
        
        try {
          navigate({ to: newPath });
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback to window.location only if navigate fails
          setTimeout(() => {
            window.location.href = newPath;
          }, 100);
        }
        return; 
      }
      
      // Handle legacy paths (but only redirect once)
      const pathSegments = currentPath.split('/').filter(segment => segment.length > 0);
      const firstSegment = pathSegments[0];      
      if (firstSegment && ['home', 'users', 'logs'].includes(firstSegment) && pathSegments.length === 1) {
        const firstOrg = organizationsQuery.data[0];
        const newPath = `/ocr-services/${firstOrg._id}${targetPath}`;
        
        console.log('OrgRedirectGuard: Redirecting legacy path to:', newPath);
        setHasRedirected(true);
        
        try {
          navigate({ to: newPath });
        } catch (error) {
          console.error('Navigation error:', error);
          setTimeout(() => {
            window.location.href = newPath;
          }, 100);
        }
      }
    }
  }, [organizationsQuery.data, organizationsQuery.isLoading, organizationsQuery.isError, targetPath, navigate, location.pathname, hasRedirected]);

  if (organizationsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading organizations...</p>
          <p className="text-sm text-gray-500 mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Show error if failed to load organizations
  if (organizationsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p>Failed to load organizations</p>
          <p className="text-sm text-gray-600 mt-1">
            {organizationsQuery.error?.message || 'Please check your connection and try again'}
          </p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => organizationsQuery.refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate({ to: '/login' })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
