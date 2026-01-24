import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '../../pages/ocr-services/DashboardPage'
import ProtectedRoute from '../../components/ProtectedRoute';
import AppLayout from '../../components/AppLayout';
import { useEffect } from 'react';
import { useSubIdContext } from '../../contexts/SubIdContext';

function DashboardWithOrgId() {
  const { orgId } = Route.useParams();
  const { setSubId } = useSubIdContext();
  
  // Update subId in context when orgId changes
  useEffect(() => {
    if (orgId) {
      console.log('[OCR Overview Route] Setting subId to:', orgId);
      setSubId(orgId);
    }
  }, [orgId, setSubId]);
  
  return <DashboardPage />;
}

export const Route = createFileRoute("/ocr-services/$orgId/overview")({
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <DashboardWithOrgId />
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
