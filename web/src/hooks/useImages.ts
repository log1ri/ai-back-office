import { useQuery } from '@tanstack/react-query';
import { imageService } from '../services';

// Query Keys
export const IMAGE_QUERY_KEYS = {
  all: ['images'] as const,
  signedUrl: (key: string) => [...IMAGE_QUERY_KEYS.all, 'signed-url', key] as const,
};

// Get signed URL for image
export const useSignedImageUrl = (key: string) => {
  return useQuery({
    queryKey: IMAGE_QUERY_KEYS.signedUrl(key),
    queryFn: async () => {
      const response = await imageService.getSignedImageUrl(key);
      return response.url;
    },
    enabled: !!key, // Only run if key is provided
    staleTime: 30 * 60 * 1000, // 30 minutes (signed URLs have expiration)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
