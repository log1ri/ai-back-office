import { BaseHttpClient } from './base-http-client';
import { ENV_CONFIG } from '../config/environment';

// ===== INTERFACES =====
export interface CurrentlyInsideResponse {
  totalSessions: number;
  status?: string;
}

export interface SessionCountResponse {
  totalSessions: number;
}

export interface PeakHourResponse {
  byHour: Array<{
    hour: number;
    count: number;
  }>;
}

export interface AvgParkingTimeResponse {
  startDate: string;
  endDate: string;
  totalSessions: number;
  avgSeconds: number;
}

export interface TodaySession {
  id: string;
  organization: string;
  subId: string;
  reg_num: string;
  province: string;
  status: string;
  entry: {
    time: string;
    camId: string;
    logId: string;
  } | null;
  exit: {
    time: string;
    camId: string;
    logId: string;
  } | null;
  durationSec: number | null;
  lastSeenAt: string;
}

export interface SessionTodayResponse {
  data: TodaySession[];
  total_records: number;
}

/**
 * OCR Services Dashboard Service
 * 
 * Service class สำหรับจัดการ Dashboard API calls
 * ใช้สำหรับดึงข้อมูลสถิติและ session ต่างๆ ของระบบ OCR
 * 
 * @extends BaseHttpClient
 */
export class OcrServicesDashboardService extends BaseHttpClient {
  private readonly basePath = '/api/v1/ocr-services-logs';

  constructor() {
    super(ENV_CONFIG.API_BASE_URL);
  }

  /**
   * ดึงจำนวนรถที่อยู่ภายในปัจจุบัน
   * @param subId - Organization Sub ID
   * @returns จำนวนรถทั้งหมดที่อยู่ภายใน
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
   * ดึงจำนวน session ทั้งหมดของวันนี้
   * @param subId - Organization Sub ID
   * @returns จำนวน session ทั้งหมด
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
   * ดึงข้อมูลช่วงเวลาที่มีรถเข้ามากที่สุด (7 วันย้อนหลัง)
   * @param subId - Organization Sub ID
   * @returns ชั่วโมงที่มีรถเข้ามากที่สุดและจำนวน
   */
  async getPeakHourEntry(subId: string): Promise<PeakHourResponse> {
    const endpoint = `${this.basePath}/session/entry/peak-hour?subId=${subId}`;
    return this.get<PeakHourResponse>(endpoint);
  }

  /**
   * ดึงเวลาจอดรถเฉลี่ย (7 วันย้อนหลัง)
   * @param subId - Organization Sub ID
   * @returns เวลาเฉลี่ยในหน่วยวินาที
   */
  async getAvgParkingTime(subId: string): Promise<AvgParkingTimeResponse> {
    const endpoint = `${this.basePath}/session/parking-time/avg?subId=${subId}`;
    return this.get<AvgParkingTimeResponse>(endpoint);
  }

  /**
   * ดึงรายการ session ทั้งหมดของวันนี้
   * @param subId - Organization Sub ID
   * @param search - คำค้นหาทะเบียนรถ (optional)
   * @returns รายการ session ทั้งหมด
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
   * @param subId - Organization Sub ID
   * @returns สถิติทั้งหมด
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
