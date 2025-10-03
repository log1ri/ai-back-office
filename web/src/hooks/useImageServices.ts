import { useQuery } from '@tanstack/react-query';
import { useSubIdContext } from '../contexts/SubIdContext';
import { BaseHttpClient } from '../services/base-http-client';
import { ENV_CONFIG } from '../config/environment';

// Service for image-related API calls
class ImageServicesClient extends BaseHttpClient {
  constructor() {
    super(ENV_CONFIG.API_BASE_URL, {
      'Content-Type': 'application/json',
    });
  }

  async getImageCount(subId: string) {
    return this.get<{
      issueImageCount: number;
      processImageCount: number;
    }>(`/api/v1/ocr-services-imgs/count-img?subId=${subId}`);
  }

  async getDownloadInfo(subId: string) {
    return this.get<{
      subId: string;
      totalFiles: number;
      issueImages: number;
      processImages: number;
      estimatedSize: string;
    }>(`/api/v1/ocr-services-imgs/download-info?subId=${subId}`);
  }

  async getIssueImages(subId: string) {
    return this.get<Array<{
      filename: string;
      signedUrl: string;
    }>>(`/api/v1/ocr-services-imgs/issue-img?subId=${subId}`);
  }

  async getImageInfo(subId: string) {
    return this.get<{
      issueImages: number;
      processImages: number;
    }>(`/api/v1/ocr-services-imgs/img-info?subId=${subId}`);
  }
}

const imageServicesClient = new ImageServicesClient();

// Query Keys for image services
export const IMAGE_SERVICES_QUERY_KEYS = {
  all: (orgId: string) => ['image-services', orgId] as const,
  count: (orgId: string) => [...IMAGE_SERVICES_QUERY_KEYS.all(orgId), 'count'] as const,
  downloadInfo: (orgId: string) => [...IMAGE_SERVICES_QUERY_KEYS.all(orgId), 'download-info'] as const,
  issueImages: (orgId: string) => [...IMAGE_SERVICES_QUERY_KEYS.all(orgId), 'issue-images'] as const,
  imageInfo: (orgId: string) => [...IMAGE_SERVICES_QUERY_KEYS.all(orgId), 'image-info'] as const,
};

// Hook for getting image count
export const useImageCount = () => {
  const { subId } = useSubIdContext();

  return useQuery({
    queryKey: IMAGE_SERVICES_QUERY_KEYS.count(subId),
    queryFn: async () => {
      if (subId === 'default' || !subId) {
        throw new Error('Organization context required');
      }
      return await imageServicesClient.getImageCount(subId);
    },
    enabled: !!subId && subId !== 'default',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting download info
export const useDownloadInfo = () => {
  const { subId } = useSubIdContext();

  return useQuery({
    queryKey: IMAGE_SERVICES_QUERY_KEYS.downloadInfo(subId),
    queryFn: async () => {
      if (subId === 'default' || !subId) {
        throw new Error('Organization context required');
      }
      return await imageServicesClient.getDownloadInfo(subId);
    },
    enabled: !!subId && subId !== 'default',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting issue images
export const useIssueImages = () => {
  const { subId } = useSubIdContext();

  return useQuery({
    queryKey: IMAGE_SERVICES_QUERY_KEYS.issueImages(subId),
    queryFn: async () => {
      if (subId === 'default' || !subId) {
        throw new Error('Organization context required');
      }
      return await imageServicesClient.getIssueImages(subId);
    },
    enabled: !!subId && subId !== 'default',
    staleTime: 5 * 60 * 1000, // 5 minutes (images don't change frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting image info
export const useImageInfo = () => {
  const { subId } = useSubIdContext();

  return useQuery({
    queryKey: IMAGE_SERVICES_QUERY_KEYS.imageInfo(subId),
    queryFn: async () => {
      if (subId === 'default' || !subId) {
        throw new Error('Organization context required');
      }
      return await imageServicesClient.getImageInfo(subId);
    },
    enabled: !!subId && subId !== 'default',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
