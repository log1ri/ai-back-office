import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useEffect } from 'react';

export const Route = createFileRoute('/ocr-services/')({
    /**
     * 
     * this function is used to redirect to the first organization overview
     * if the user has access to any organizations.
     * If no organizations are found, it will show an error message.
     * 
     * @todo
     *  - Initially, this function was used to redirect to the first organization overview.
     *  - Now, it checks if the user has any organizations and redirects accordingly.
     */
  beforeLoad: async () => {
    return {};
  },
  component: () => {
    const { data: organizations, isLoading, error } = useOrganizations();
    const navigate = useNavigate();
    useEffect(() => {
      if (organizations && organizations.length > 0) {
        const firstOrg = organizations[0];
        const newPath = `/ocr-services/${firstOrg._id}/overview`;
        console.log('Redirecting to first organization:', newPath);
        
        try {
          navigate({ to: newPath });
        } catch (error) {
          console.error('Navigation error:', error);
          window.location.href = newPath;
        }
      }
    }, [organizations, navigate]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center text-red-600">
            <h2 className="text-xl font-semibold mb-2">Error loading organizations</h2>
            <p className="mb-4">{error.message}</p>
            <button 
              onClick={() => navigate({ to: '/login' })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (organizations && organizations.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">No Organizations Found</h2>
            <p className="text-gray-600 mb-4">You don't have access to any organizations.</p>
            <button 
              onClick={() => navigate({ to: '/login' })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to organization...</p>
        </div>
      </div>
    );
  },
});
