import { BaseHttpClient } from './base-http-client';
import type { Organization, ApiResponse } from '../types/api.types';

// Single Responsibility Principle - Only handles organization API calls
export class OrganizationService extends BaseHttpClient {
  
  async getAllOrganizations(): Promise<Organization[]> {
    return this.get<Organization[]>('/api/v1/ocr-services-orgs/all');
  }

  async getOrganization(id: string): Promise<ApiResponse<Organization>> {
    return this.get<ApiResponse<Organization>>(`/api/v1/ocr-services-orgs/${id}`);
  }
}
