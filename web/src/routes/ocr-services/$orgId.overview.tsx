import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '../../pages/ocr-services/DashboardPage'
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';

export const Route = createFileRoute("/ocr-services/$orgId/overview")({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </ProtectedRoute>
  ),
  beforeLoad: ({ params }) => {
    console.log('OCR Overview route beforeLoad, orgId:', params.orgId);
    if (!params.orgId) {
      throw new Error('Organization ID is required');
    }
  },
})
