import { useSubIdContext } from '../contexts/SubIdContext';
import { useOcrLogs } from '../hooks/useOcrLogs';
import { useImageCount, useDownloadInfo } from '../hooks/useImageServices';

/**
 * Debug component to verify data refetching works when organization changes
 * This component should be removed in production
 */
export function OrganizationDataDebug() {
  const { subId } = useSubIdContext();
  
  const ocrLogsQuery = useOcrLogs({ page: 1, limit: 5 });
  const imageCountQuery = useImageCount();
  const downloadInfoQuery = useDownloadInfo();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm text-xs">
      <h3 className="font-bold text-sm mb-2">Debug: Organization Data</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Current Org:</strong> {subId}
        </div>
        
        <div>
          <strong>OCR Logs:</strong>
          <div className="ml-2">
            Status: {ocrLogsQuery.isLoading ? 'Loading...' : ocrLogsQuery.isFetching ? 'Fetching...' : 'Ready'}
            <br />
            Count: {ocrLogsQuery.data?.total_records || 0}
            <br />
            Updated: {ocrLogsQuery.dataUpdatedAt ? new Date(ocrLogsQuery.dataUpdatedAt).toLocaleTimeString() : 'Never'}
          </div>
        </div>
        
        <div>
          <strong>Image Count:</strong>
          <div className="ml-2">
            Status: {imageCountQuery.isLoading ? 'Loading...' : imageCountQuery.isFetching ? 'Fetching...' : 'Ready'}
            <br />
            Issue: {imageCountQuery.data?.issueImageCount || 0}
            <br />
            Process: {imageCountQuery.data?.processImageCount || 0}
            <br />
            Updated: {imageCountQuery.dataUpdatedAt ? new Date(imageCountQuery.dataUpdatedAt).toLocaleTimeString() : 'Never'}
          </div>
        </div>
        
        <div>
          <strong>Download Info:</strong>
          <div className="ml-2">
            Status: {downloadInfoQuery.isLoading ? 'Loading...' : downloadInfoQuery.isFetching ? 'Fetching...' : 'Ready'}
            <br />
            Total Files: {downloadInfoQuery.data?.totalFiles || 0}
            <br />
            Size: {downloadInfoQuery.data?.estimatedSize || 'Unknown'}
            <br />
            Updated: {downloadInfoQuery.dataUpdatedAt ? new Date(downloadInfoQuery.dataUpdatedAt).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t text-gray-500">
        When you switch organizations, watch these values refresh!
      </div>
    </div>
  );
}

// Export individual hooks for easier imports
export { useImageCount, useDownloadInfo, useIssueImages, useImageInfo } from '../hooks/useImageServices';
