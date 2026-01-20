import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Car,
  Wifi,
  WifiOff,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Timer,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useRealtimeLogs } from "../../hooks/useRealtimeLogs";
import { useSubIdContext } from "../../contexts/SubIdContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VehicleActivity {
  regNum: string;
  province: string;
  timestamp: string;
  status: 'IN' | 'OUT' | 'INSIDE';
  parkingDuration?: string;
  timeIn?: string;
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { subId: contextSubId } = useSubIdContext();

  const {
    logs: realtimeLogs,
    isConnected,
    loading,
    error,
  } = useRealtimeLogs({
    baseUrl: "http://localhost:5167",
    maxLogs: 100,
  });

  // Process logs to extract vehicle activities
  const vehicleActivities = useMemo<VehicleActivity[]>(() => {
    const activities: VehicleActivity[] = [];
    const vehicleMap = new Map<string, { firstSeen: string; lastSeen: string; isInside: boolean }>();

    realtimeLogs.forEach((log) => {
      try {
        const parsedData = typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
        const regNum = parsedData.regNum || 'UNKNOWN';
        const province = parsedData.province || 'N/A';
        const timestamp = parsedData.timestamp || log.timestamp;
        const action = parsedData.action || '';

        // Track vehicle state
        if (!vehicleMap.has(regNum)) {
          vehicleMap.set(regNum, { 
            firstSeen: timestamp,
            lastSeen: timestamp,
            isInside: action.includes('in') || action.includes('entry')
          });
        } else {
          const vehicle = vehicleMap.get(regNum)!;
          vehicle.lastSeen = timestamp;
          vehicle.isInside = action.includes('in') || action.includes('entry');
        }

        // Determine status
        let status: 'IN' | 'OUT' | 'INSIDE' = 'INSIDE';
        if (action.includes('out') || action.includes('exit')) {
          status = 'OUT';
        } else if (action.includes('in') || action.includes('entry')) {
          status = 'IN';
        }

        // Calculate parking duration for vehicles inside
        const vehicleInfo = vehicleMap.get(regNum)!;
        let parkingDuration: string | undefined;
        let timeIn: string | undefined;
        
        if (status === 'INSIDE' || status === 'IN') {
          timeIn = vehicleInfo.firstSeen;
          const duration = Date.now() - new Date(vehicleInfo.firstSeen).getTime();
          const hours = Math.floor(duration / (1000 * 60 * 60));
          const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
          parkingDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }

        activities.push({
          regNum,
          province,
          timestamp,
          status,
          parkingDuration,
          timeIn,
        });
      } catch (e) {
        // Skip invalid logs
      }
    });

    return activities.reverse(); // Most recent first
  }, [realtimeLogs]);

  // Filter activities based on search
  const filteredActivities = useMemo(() => {
    return vehicleActivities.filter((activity) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        activity.regNum.toLowerCase().includes(searchLower) ||
        activity.province.toLowerCase().includes(searchLower) ||
        activity.status.toLowerCase().includes(searchLower)
      );
    });
  }, [vehicleActivities, searchTerm]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date().toDateString();
    const todayActivities = vehicleActivities.filter(
      (activity) => new Date(activity.timestamp).toDateString() === today
    );

    const uniqueVehicles = new Set(todayActivities.map(a => a.regNum));
    const currentlyInside = vehicleActivities.filter(a => a.status === 'INSIDE' || a.status === 'IN');
    const insideVehicles = new Set(currentlyInside.map(a => a.regNum));

    // Calculate average parking duration (only for vehicles currently inside)
    const parkingDurations = currentlyInside
      .filter(a => a.timeIn)
      .map(a => Date.now() - new Date(a.timeIn!).getTime());
    
    const avgDuration = parkingDurations.length > 0
      ? parkingDurations.reduce((sum, d) => sum + d, 0) / parkingDurations.length
      : 0;
    
    const avgHours = Math.floor(avgDuration / (1000 * 60 * 60));
    const avgMinutes = Math.floor((avgDuration % (1000 * 60 * 60)) / (1000 * 60));
    const avgDurationStr = avgHours > 0 ? `${avgHours}h ${avgMinutes}m` : `${avgMinutes}m`;

    // Find peak entry hour
    const hourCounts = new Map<number, number>();
    todayActivities
      .filter(a => a.status === 'IN')
      .forEach(a => {
        const hour = new Date(a.timestamp).getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });
    
    let peakHour = 0;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    });

    return {
      totalToday: uniqueVehicles.size,
      currentlyInside: insideVehicles.size,
      avgParkingDuration: avgDurationStr,
      peakEntryHour: maxCount > 0 ? `${peakHour.toString().padStart(2, '0')}:00` : 'N/A',
    };
  }, [vehicleActivities]);

  // Chart data - hourly entries for today
  const chartData = useMemo(() => {
    const today = new Date().toDateString();
    const hourlyData = new Map<number, { hour: string; entries: number }>();

    // Initialize 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData.set(i, { 
        hour: `${i.toString().padStart(2, '0')}:00`, 
        entries: 0
      });
    }

    vehicleActivities.forEach((activity) => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate.toDateString() === today && activity.status === 'IN') {
        const hour = activityDate.getHours();
        const data = hourlyData.get(hour)!;
        data.entries++;
      }
    });

    return Array.from(hourlyData.values());
  }, [vehicleActivities]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Vehicle Monitoring Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Campus Parking & Access Control</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
            {loading && (
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                Connecting...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Vehicles Today</p>
                <p className="text-4xl font-bold mt-2">{kpis.totalToday}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Currently Inside</p>
                <p className="text-4xl font-bold mt-2">{kpis.currentlyInside}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Parking Time</p>
                <p className="text-4xl font-bold mt-2">{kpis.avgParkingDuration}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Peak Entry Hour</p>
                <p className="text-4xl font-bold mt-2">{kpis.peakEntryHour}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Table Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Activity Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Live Vehicle Activity
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search license plate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted">
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>License Plate</TableHead>
                        <TableHead>Province</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActivities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                            {searchTerm ? (
                              `No vehicles found matching "${searchTerm}"`
                            ) : (
                              <div className="space-y-2">
                                <Car className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="font-medium">No vehicle activity detected</p>
                                <p className="text-sm">Waiting for vehicles to enter...</p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredActivities.slice(0, 20).map((activity, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-sm">
                              {new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </TableCell>
                            <TableCell className="font-mono font-semibold">
                              {activity.regNum}
                            </TableCell>
                            <TableCell>{activity.province}</TableCell>
                            <TableCell>
                              {activity.status === 'IN' ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <ArrowDownCircle className="h-4 w-4" />
                                  <span className="font-medium">Entry</span>
                                </div>
                              ) : activity.status === 'OUT' ? (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <ArrowUpCircle className="h-4 w-4" />
                                  <span className="font-medium">Exit</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">Inside</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {activity.parkingDuration || '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Chart */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Today's Traffic</CardTitle>
                <p className="text-muted-foreground text-sm">Hourly vehicle entries</p>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="hour" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }} 
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="entries" fill="hsl(var(--primary))" name="Entries" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">⚠️ Connection Error: {error}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
