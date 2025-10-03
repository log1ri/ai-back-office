import { BaseHttpClient } from './base-http-client';
import type { ApiResponse, RateModelCheckRateResponse, RateModelItem, listRateItem } from '../types/api.types';

export class RateModelService extends BaseHttpClient {
  listRate: any;

  async checkRateModel(data: RateModelItem[]): Promise<RateModelCheckRateResponse> {
    return this.post<RateModelCheckRateResponse>('/api/v1/ocr-services-rate-model/check-rate', data);
  }

  async listRateLog(subId: string): Promise<ApiResponse<listRateItem>> {
    // แนบ subId เป็น query string
    return this.get<ApiResponse<listRateItem>>(`/api/v1/ocr-services-rate-model/list-rate?subId=${encodeURIComponent(subId)}`);
  }
}
