import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/ocr-service-dashboard.services';
import type { 
  TodaySession, 
  SessionTodayResponse, 
  CurrentlyInsideResponse,
  SessionCountResponse,
  PeakHourResponse,
  AvgParkingTimeResponse
} from '../types/api.types';

export { type TodaySession, type SessionTodayResponse };

export const useDashboardStats = (subId: string) => {
  // Check if subId is valid (not 'default' and not empty)
  const isValidSubId = Boolean(subId && subId !== 'default' && subId.length > 0);
  
  console.log('[useDashboardStats] Hook called with subId:', { subId, isValidSubId });

  // Currently Inside Total
  const { data: currentlyInsideData } = useQuery<CurrentlyInsideResponse>({
    queryKey: ['dashboard', 'currently-inside', subId],
    queryFn: () => dashboardService.getCurrentlyInsideTotal(subId),
    enabled: isValidSubId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    retry: 1,
  });

  // Session Count Today
  const { data: sessionCountData } = useQuery<SessionCountResponse>({
    queryKey: ['dashboard', 'session-count-today', subId],
    queryFn: () => dashboardService.getSessionCountToday(subId),
    enabled: isValidSubId,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });

  // Peak Entry Hour (7 days)
  const { data: peakHourData } = useQuery<PeakHourResponse>({
    queryKey: ['dashboard', 'peak-hour', subId],
    queryFn: () => dashboardService.getPeakHourEntry(subId),
    enabled: isValidSubId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000,
    retry: 1,
  });

  // Average Parking Time (7 days)
  const { data: avgParkingTimeData } = useQuery<AvgParkingTimeResponse>({
    queryKey: ['dashboard', 'avg-parking-time', subId],
    queryFn: () => dashboardService.getAvgParkingTime(subId),
    enabled: isValidSubId,
    staleTime: 300000,
    refetchInterval: 300000,
    retry: 1,
  });

  // Calculate peak hour from byHour array
  const peakHourInfo = peakHourData?.byHour?.reduce((max, current) => 
    (current.count > (max?.count ?? 0)) ? current : max
  , peakHourData.byHour[0]);

  return {
    currentlyInside: currentlyInsideData?.totalSessions ?? 0,
    sessionCountToday: sessionCountData?.totalSessions ?? 0,
    peakHour: peakHourInfo?.hour ?? null,
    peakHourCount: peakHourInfo?.count ?? 0,
    avgParkingTimeSec: avgParkingTimeData?.avgSeconds ?? 0,
  };
};

export const useTodaySessions = (subId: string, search: string = '') => {
  const isValidSubId = Boolean(subId && subId !== 'default' && subId.length > 0);
  
  console.log('[useTodaySessions] Hook called with:', { subId, search, isValidSubId });
  
  return useQuery<SessionTodayResponse>({
    queryKey: ['dashboard', 'sessions-today', subId, search],
    queryFn: () => dashboardService.getTodaySessions(subId, search),
    enabled: isValidSubId,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });
};
