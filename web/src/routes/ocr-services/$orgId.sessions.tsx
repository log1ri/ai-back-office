import { createFileRoute } from '@tanstack/react-router'
import SessionPage from '../../pages/ocr-services/SessionPage'
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';

export const Route = createFileRoute("/ocr-services/$orgId/sessions")({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <SessionPage />
      </AppLayout>
    </ProtectedRoute>
  ),
  beforeLoad: ({ params }) => {
    console.log('Sessions route beforeLoad, orgId:', params.orgId);
    if (!params.orgId) {
      throw new Error('Organization ID is required');
    }
  },
})
