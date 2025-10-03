import { createFileRoute } from '@tanstack/react-router'
import { ImageLogPage } from '../../pages/ocr-services/ImageLogPage'
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';

export const Route = createFileRoute("/ocr-services/$orgId/home")({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <ImageLogPage />
      </AppLayout>
    </ProtectedRoute>
  ),
  beforeLoad: ({ params }) => {
    console.log('OCR Home route beforeLoad, orgId:', params.orgId);
    // Validate orgId parameter exists
    if (!params.orgId) {
      throw new Error('Organization ID is required');
    }
  },
})
