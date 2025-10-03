import { createFileRoute } from '@tanstack/react-router'
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import ImageIssuePage from '../../pages/ocr-services/ImageIssuePage';

export const Route = createFileRoute("/ocr-services/$orgId/issues")({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <ImageIssuePage />
      </AppLayout>
    </ProtectedRoute>
  ),
  beforeLoad: ({ params }) => {
    console.log('OCR Issues route beforeLoad, orgId:', params.orgId);
    // Validate orgId parameter exists
    if (!params.orgId) {
      throw new Error('Organization ID is required');
    }
  },
})
