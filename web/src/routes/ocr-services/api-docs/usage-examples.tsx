import { createFileRoute } from '@tanstack/react-router'
import UsageExamplesPage from '../../../pages/ocr-services/api-docs/UsageExamplesPage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AppLayout from '../../../components/AppLayout';

const URL:string = '/usage-examples.md';
export const Route = createFileRoute('/ocr-services/api-docs/usage-examples')({
  component: ()=> (
    <ProtectedRoute>
      <AppLayout>
        <UsageExamplesPage URL={URL} />
      </AppLayout>
    </ProtectedRoute>
  )

});