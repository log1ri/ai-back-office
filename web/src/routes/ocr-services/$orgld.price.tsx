import { createFileRoute } from '@tanstack/react-router'
import { PriceManagementPage } from '../../pages/ocr-services/PriceManangementPage'
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';

export const Route = createFileRoute('/ocr-services/$orgld/price')({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <PriceManagementPage />
      </AppLayout>
    </ProtectedRoute>
  ),
  beforeLoad: ({ params }) => {
    console.log('Price Management route beforeLoad, orgId:', params.orgld);
    // Validate orgId parameter exists
    if (!params.orgld) {
      throw new Error('Organization ID is required');
    }
  },
})
