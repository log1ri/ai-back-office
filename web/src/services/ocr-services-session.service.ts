import { BaseHttpClient } from './base-http-client';
import type { SessionFilters, SessionResponse,CountClosedSessionResponse, MeanDurationResponse } from '../types/api.types';


export class OcrServicesSessionService extends BaseHttpClient {

    async getFilteredSessions(orgId: string, params: SessionFilters): Promise<SessionResponse> {
        const searchParams = new URLSearchParams();
        if (orgId) searchParams.set('subId', orgId);
        if (params.search) searchParams.set('search', params.search);
        if (params.page) searchParams.set('page', params.page.toString());
        if (params.limit) searchParams.set('limit', params.limit.toString());
        if (params.status) searchParams.set('status', params.status);
        if (params.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params.order) searchParams.set('order', params.order);
        
        const queryString = searchParams.toString();
        const url = `/api/v1/ocr-services-logs/session${queryString ? `?${queryString}` : ''}`;
            
        return this.get<SessionResponse>(url);
    }

    async getClosedSession(subId: string): Promise<CountClosedSessionResponse> {
        const endpoint = `/api/v1/ocr-services-logs/session/closed-session/total?subId=${subId}`;
        return this.get<CountClosedSessionResponse>(endpoint);
    }

    async getMeanDurationSecAllTime(subId: string): Promise<MeanDurationResponse> {
        const endpoint = `/api/v1/ocr-services-logs/session/duration/mean/all-time?subId=${subId}`;
        return this.get<MeanDurationResponse>(endpoint);
    }

}