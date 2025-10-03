import { BaseHttpClient } from './base-http-client';
import type { 
  ApiResponse 
} from '../types/api.types';

// OCR Log interfaces based on your actual API response
export interface OcrLogMessage {
  images?: {
    name?: string;
    original?: string;
    processed?: string;
  };
  content?: {
    province?: string;
    'reg-num'?: string;
  };
}

export interface OcrLog {
  id: string;
  message?: OcrLogMessage;
  timestamp?: string;
  dimensions?: string;
  uploadDate?: string;
}

export interface OcrLogsResponse {
  data: OcrLog[];
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_records: number;
}

export interface OcrLogFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Single Responsibility Principle - Only handles OCR services log API calls
export class OcrServicesLogService extends BaseHttpClient {
  
  async getFilteredLogs(orgId: string, params: OcrLogFilterParams = {}): Promise<OcrLogsResponse> {
    const searchParams = new URLSearchParams();

    if (orgId) searchParams.set('subId', orgId);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    
    const queryString = searchParams.toString();
    const url = `/api/v1/ocr-services-logs/filter${queryString ? `?${queryString}` : ''}`;
    
    return this.get<OcrLogsResponse>(url);
  }

  async getAllLogs(orgId: string, totalRecords: number): Promise<OcrLogsResponse> {
    return this.getFilteredLogs(orgId, { page: 1, limit: totalRecords });
  }

  async deleteLog(orgId: string, logId: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/api/v1/${orgId}/ocr-services-logs/${logId}`);
  }

  async uploadImages(orgId: string, files: File[]): Promise<ApiResponse<OcrLog[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    return this.post<ApiResponse<OcrLog[]>>(`/api/v1/${orgId}/ocr-services-logs/upload`, formData);
  }
}
