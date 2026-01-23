import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/ocr-service-dashboard.services';
import type { TodaySession, SessionTodayResponse } from '../services/ocr-service-dashboard.services';

export { type TodaySession, type SessionTodayResponse };

export const useDashboardStats = (subId: string) => {
  // Currently Inside Total
  const { data: currentlyInsideData } = useQuery({
    queryKey: ['dashboard', 'currently-inside', subId],
    queryFn: () => dashboardService.getCurrentlyInsideTotal(subId),
    enabled: !!subId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    retry: 1,
  });

  // Session Count Today
  const { data: sessionCountData } = useQuery({
    queryKey: ['dashboard', 'session-count-today', subId],
    queryFn: () => dashboardService.getSessionCountToday(subId),
    enabled: !!subId,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });

  // Peak Entry Hour (7 days)
  const { data: peakHourData } = useQuery({
    queryKey: ['dashboard', 'peak-hour', subId],
    queryFn: () => dashboardService.getPeakHourEntry(subId),
    enabled: !!subId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000,
    retry: 1,
  });

  // Average Parking Time (7 days)
  const { data: avgParkingTimeData } = useQuery({
    queryKey: ['dashboard', 'avg-parking-time', subId],
    queryFn: () => dashboardService.getAvgParkingTime(subId),
    enabled: !!subId,
    staleTime: 300000,
    refetchInterval: 300000,
    retry: 1,
  });

  return {
    currentlyInside: currentlyInsideData?.total ?? 0,
    sessionCountToday: sessionCountData?.total ?? 0,
    peakHour: peakHourData?.peakHour ?? null,
    peakHourCount: peakHourData?.count ?? 0,
    avgParkingTimeSec: avgParkingTimeData?.avgDurationSec ?? 0,
  };
};

export const useTodaySessions = (subId: string, search: string = '') => {
  return useQuery({
    queryKey: ['dashboard', 'sessions-today', subId, search],
    queryFn: () => dashboardService.getTodaySessions(subId, search),
    enabled: !!subId,
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1,
  });
};
