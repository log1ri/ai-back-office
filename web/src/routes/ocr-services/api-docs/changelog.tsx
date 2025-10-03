import { createFileRoute } from '@tanstack/react-router'
import ChangelogPage from '../../../pages/ocr-services/api-docs/ChangelogPage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AppLayout from '../../../components/AppLayout';

const URL:string = '/changelog.md';
export const Route = createFileRoute('/ocr-services/api-docs/changelog')({
  component: ()=> (
    <ProtectedRoute>
      <AppLayout>
        <ChangelogPage URL={URL} />
      </AppLayout>
    </ProtectedRoute>
  )

});