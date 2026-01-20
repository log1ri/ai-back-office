import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'http://localhost:5167/api/v1/ocr-services-logs';

interface CurrentlyInsideResponse {
  total: number;
}

interface SessionCountResponse {
  total: number;
}

interface PeakHourResponse {
  peakHour: number;
  count: number;
}

interface AvgParkingTimeResponse {
  avgDurationSec: number;
}

interface TodaySession {
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

interface SessionTodayResponse {
  data: TodaySession[];
  total_records: number;
}

export const useDashboardStats = (subId: string) => {
  // Currently Inside Total
  const { data: currentlyInsideData } = useQuery({
    queryKey: ['dashboard', 'currently-inside', subId],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/session/currently-inside/total?subId=${subId}`);
      if (!response.ok) throw new Error('Failed to fetch currently inside');
      return response.json() as Promise<CurrentlyInsideResponse>;
    },
    enabled: !!subId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Session Count Today
  const { data: sessionCountData } = useQuery({
    queryKey: ['dashboard', 'session-count-today', subId],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/session/today/total?subId=${subId}`);
      if (!response.ok) throw new Error('Failed to fetch session count');
      return response.json() as Promise<SessionCountResponse>;
    },
    enabled: !!subId,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Peak Entry Hour (7 days)
  const { data: peakHourData } = useQuery({
    queryKey: ['dashboard', 'peak-hour', subId],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/session/entry/peak-hour?subId=${subId}`);
      if (!response.ok) throw new Error('Failed to fetch peak hour');
      return response.json() as Promise<PeakHourResponse>;
    },
    enabled: !!subId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000,
  });

  // Average Parking Time (7 days)
  const { data: avgParkingTimeData } = useQuery({
    queryKey: ['dashboard', 'avg-parking-time', subId],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/session/parking-time/avg?subId=${subId}`);
      if (!response.ok) throw new Error('Failed to fetch avg parking time');
      return response.json() as Promise<AvgParkingTimeResponse>;
    },
    enabled: !!subId,
    staleTime: 300000,
    refetchInterval: 300000,
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
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('subId', subId);
      if (search) params.append('search', search);
      
      const response = await fetch(`${BASE_URL}/session/today?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch today sessions');
      return response.json() as Promise<SessionTodayResponse>;
    },
    enabled: !!subId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
