import { BaseHttpClient } from './base-http-client';

export interface ImageIssue {
  _id: string;
  filename: string;
  signedUrl: string;
  name: string;
  original: string;
  processed: string;
  dimensions: string;
  uploadDate: string;
  timestamp: string;
}

export interface ImageIssueResponse {
  data: ImageIssue[];
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
  totalRecords: number;
}

export interface ImageIssueParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Single Responsibility Principle - Only handles image-related API calls
export class ImageService extends BaseHttpClient {
  
  async getSignedImageUrl(key: string): Promise<{ url: string }> {
    return this.get<{ url: string }>(`/api/v1/ocr-services-imgs/image?key=${encodeURIComponent(key)}`);
  }

  async getIssueImages(orgId: string, params: ImageIssueParams = {}): Promise<ImageIssueResponse> {
    const searchParams = new URLSearchParams();

    if (orgId) searchParams.set('subId', orgId);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    
    const queryString = searchParams.toString();
    const url = `/api/v1/ocr-services-imgs/issue-img${queryString ? `?${queryString}` : ''}`;
    
    return this.get<ImageIssueResponse>(url);
  }

  async getAllIssueImages(orgId: string, totalRecords: number): Promise<ImageIssueResponse> {
    return this.getIssueImages(orgId, { page: 1, limit: totalRecords });
  }
}
