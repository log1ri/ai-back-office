import { BaseHttpClient } from './base-http-client';
import { ENV_CONFIG } from '../config/environment';
import type { CurrentlyInsideResponse, SessionCountResponse, PeakHourResponse, AvgParkingTimeResponse, SessionTodayResponse, } from '../types/api.types';

/**
 * OCR Services Dashboard Service
 * 
 * Service class for Dashboard API calls
 * Used to fetch statistics and sessions data for the OCR system
 */
export class OcrServicesDashboardService extends BaseHttpClient {
  private readonly basePath = '/api/v1/ocr-services-logs';

  constructor() {
    super(ENV_CONFIG.API_BASE_URL);
  }

  /**
   * Get the total number of cars currently inside
   * @param subId - Organization Sub ID
   * @returns Total number of cars currently inside
   */
  async getCurrentlyInsideTotal(subId: string): Promise<CurrentlyInsideResponse> {
    const endpoint = `${this.basePath}/session/currently-inside/total?subId=${subId}`;
    console.log('[Dashboard Service] getCurrentlyInsideTotal:', {
      endpoint,
      fullUrl: `${ENV_CONFIG.API_BASE_URL}${endpoint}`,
      subId,
      token: localStorage.getItem('authToken') ? 'Present' : 'Missing'
    });
    return this.get<CurrentlyInsideResponse>(endpoint);
  }

  /**
   * Fetch Count session Today
   * @param subId - Organization Sub ID
   * @returns Count all session 
   */
  async getSessionCountToday(subId: string): Promise<SessionCountResponse> {
    const endpoint = `${this.basePath}/session/today/total?subId=${subId}`;
    console.log('[Dashboard Service] getSessionCountToday:', {
      endpoint,
      fullUrl: `${ENV_CONFIG.API_BASE_URL}${endpoint}`,
      subId
    });
    return this.get<SessionCountResponse>(endpoint);
  }

  /**
   * fetch Peak Hour Entry (last 7 days)
   * @param subId - Organization Sub ID
   * @returns most frequent hour and its count
   */
  async getPeakHourEntry(subId: string): Promise<PeakHourResponse> {
    const endpoint = `${this.basePath}/session/entry/peak-hour?subId=${subId}`;
    return this.get<PeakHourResponse>(endpoint);
  }

  /**
   * fetch Average Parking Time (last 7 days)
   * @param subId - Organization Sub ID
   * @returns average parking time in seconds
   */
  async getAvgParkingTime(subId: string): Promise<AvgParkingTimeResponse> {
    const endpoint = `${this.basePath}/session/parking-time/avg?subId=${subId}`;
    return this.get<AvgParkingTimeResponse>(endpoint);
  }

  /**
   * fetch all sessions of today
   * @param subId - Organization Sub ID
   * @param search - search by vehicle registration number (optional)
   * @returns all sessions of today
   */
  async getTodaySessions(subId: string, search?: string): Promise<SessionTodayResponse> {
    const params = new URLSearchParams({ subId });
    if (search) {
      params.append('search', search);
    }
    
    const endpoint = `${this.basePath}/session/today?${params.toString()}`;
    console.log('[Dashboard Service] getTodaySessions:', {
      endpoint,
      fullUrl: `${ENV_CONFIG.API_BASE_URL}${endpoint}`,
      subId,
      search
    });
    return this.get<SessionTodayResponse>(endpoint);
  }

  /**
   * ดึงข้อมูลสถิติทั้งหมดของ Dashboard พร้อมกัน
   * fetch all dashboard statistics
   * @param subId - Organization Sub ID
   * @returns all dashboard statistics
   */
  async getDashboardStats(subId: string) {
    const [currentlyInside, sessionCountToday, peakHour, avgParkingTime] = await Promise.all([
      this.getCurrentlyInsideTotal(subId),
      this.getSessionCountToday(subId),
      this.getPeakHourEntry(subId),
      this.getAvgParkingTime(subId),
    ]);

    // Find peak hour from byHour array
    const peakHourInfo = peakHour.byHour?.reduce((max, current) => 
      (current.count > (max?.count ?? 0)) ? current : max
    , peakHour.byHour[0]);

    return {
      currentlyInside: currentlyInside.totalSessions,
      sessionCountToday: sessionCountToday.totalSessions,
      peakHour: peakHourInfo?.hour ?? null,
      peakHourCount: peakHourInfo?.count ?? 0,
      avgParkingTimeSec: avgParkingTime.avgSeconds,
    };
  }
}

// Export singleton instance
export const dashboardService = new OcrServicesDashboardService();
