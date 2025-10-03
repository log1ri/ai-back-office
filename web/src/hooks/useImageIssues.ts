import { useQuery } from '@tanstack/react-query';
import { ImageService } from '../services/image.service';
import type { ImageIssueParams, ImageIssueResponse } from '../services/image.service';
import { ENV_CONFIG } from '../config/environment';

// Create service instance
const imageService = new ImageService(ENV_CONFIG.API_BASE_URL);

export const useImageIssues = (params: ImageIssueParams & { subId: string }) => {
  return useQuery<ImageIssueResponse, Error>({
    queryKey: ["imageIssues", params],
    queryFn: async () => {
      if (!params.subId) {
        throw new Error("subId is required");
      }
      
      return await imageService.getIssueImages(params.subId, {
        page: params.page,
        limit: params.limit,
        search: params.search
      });
    },
    enabled: true,
    retry: 1,
    staleTime: 0,
  });
};
