import { createFileRoute } from '@tanstack/react-router';
import { OrgRedirectGuard } from '../components/OrgRedirectGuard';
import ProtectedRoute from '../components/ProtectedRoute';

export const Route = createFileRoute('/overview')({
  component: () => {
    return (
      <ProtectedRoute>
        <OrgRedirectGuard targetPath="/overview">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Loading Organization...</h2>
            <p>Redirecting to organization overview...</p>
            <div>If this takes too long, please check your authentication.</div>
          </div>
        </OrgRedirectGuard>
      </ProtectedRoute>
    );
  },
});
