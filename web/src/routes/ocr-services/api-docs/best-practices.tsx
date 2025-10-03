import { createFileRoute } from '@tanstack/react-router'
import BestPracticesApiDocs from '../../../pages/ocr-services/api-docs/BestPracticesPage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AppLayout from '../../../components/AppLayout';

const URL:string = '/best-practices.md';
export const Route = createFileRoute('/ocr-services/api-docs/best-practices')({
  component: ()=> (
    <ProtectedRoute>
      <AppLayout>
        <BestPracticesApiDocs URL={URL} />
      </AppLayout>
    </ProtectedRoute>
  )

});
