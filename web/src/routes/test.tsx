import { createFileRoute } from '@tanstack/react-router';
import ProtectedRoute from '../components/ProtectedRoute';

export const Route = createFileRoute('/test')({
  component: () => {
    return (
      <ProtectedRoute>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Test Route Working!</h1>
          <p>If you can see this, the routing system is working correctly.</p>
        </div>
      </ProtectedRoute>
    );
  },
});
