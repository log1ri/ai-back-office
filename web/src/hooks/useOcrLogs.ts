import { useQuery } from '@tanstack/react-query';
import { serviceFactory } from '../services';
import { useSubIdContext } from '../contexts/SubIdContext';
import type { OcrLogFilterParams } from '../services/ocr-services-log.service';

export const OCR_LOG_QUERY_KEYS = {
  all: (orgId: string) => ['ocr-logs', orgId] as const,
  lists: (orgId: string) => [...OCR_LOG_QUERY_KEYS.all(orgId), 'list'] as const,
  list: (orgId: string, params: OcrLogFilterParams) => [...OCR_LOG_QUERY_KEYS.lists(orgId), params] as const,
  plot: (orgId: string, params: OcrLogFilterParams) => [...OCR_LOG_QUERY_KEYS.lists(orgId), 'plot', params] as const,
};

export const useOcrLogs = (params: OcrLogFilterParams = {}) => {
  const { subId } = useSubIdContext();
  const ocrLogService = serviceFactory.getOcrServicesLogService();

  return useQuery({
    queryKey: OCR_LOG_QUERY_KEYS.list(subId, params),
    queryFn: async () => {
      if (subId === 'default' || !subId) {
        throw new Error('Organization context required');
      }
      
      const response = await ocrLogService.getFilteredLogs(subId, params);
      return response;
    },
    enabled: !!subId && subId !== 'default',
    staleTime: 30 * 1000, 
    gcTime: 5 * 60 * 1000,
  });
};

export const useAllOcrLogs = (totalRecords: number, enabled = false) => {
  const { subId } = useSubIdContext();
  const ocrLogService = serviceFactory.getOcrServicesLogService();

  return useQuery({
    queryKey: OCR_LOG_QUERY_KEYS.list(subId, { page: 1, limit: totalRecords }),
    queryFn: async () => {
      if (subId === 'default' || !subId) {
        throw new Error('Organization context required');
      }
      
      const response = await ocrLogService.getAllLogs(subId, totalRecords);
      return response;
    },
    enabled: enabled && !!subId && subId !== 'default' && totalRecords > 0,
    staleTime: 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};
