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
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useSubIdContext } from "../../contexts/SubIdContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats, useTodaySessions, type TodaySession } from "../../hooks/useDashboardStats";
import { format } from "date-fns";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { subId } = useSubIdContext();

  console.log('[DashboardPage] Rendered with subId:', subId);

  // Fetch dashboard statistics
  const {
    currentlyInside,
    sessionCountToday,
    peakHour,
    avgParkingTimeSec,
  } = useDashboardStats(subId || "");

  // Fetch today's sessions with search
  const { data: sessionsData, isLoading, error } = useTodaySessions(subId || "", searchTerm);

  // Format duration from seconds
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate current duration for ongoing sessions
  const getCurrentDuration = (entryTime: string): string => {
    const start = new Date(entryTime);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    return formatDuration(diffSeconds);
  };

  // Chart data - hourly entries for today
  const chartData = useMemo(() => {
    if (!sessionsData?.data || sessionsData.data.length === 0) {
      console.log('[DashboardPage] No session data available for chart');
      return [];
    }

    const hourlyData = new Map<number, { hour: string; entries: number }>();

    // Initialize 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData.set(i, { 
        hour: `${i.toString().padStart(2, '0')}:00`, 
        entries: 0
      });
    }

    sessionsData.data.forEach((session: TodaySession) => {
      if (session.entry?.time) {
        const hour = new Date(session.entry.time).getHours();
        const data = hourlyData.get(hour)!;
        data.entries++;
      }
    });

    return Array.from(hourlyData.values());
  }, [sessionsData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Vehicle Monitoring Overview
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Campus Parking & Access Control</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">Total Vehicles Today</p>
                <p className="text-4xl font-bold mt-2">{sessionCountToday}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">Currently Inside</p>
                <p className="text-4xl font-bold mt-2">{currentlyInside}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">Avg Parking Time (7d)</p>
                <p className="text-4xl font-bold mt-2">{formatDuration(avgParkingTimeSec)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">Peak Entry Hour (7d)</p>
                <p className="text-4xl font-bold mt-2">
                  {peakHour !== null ? `${peakHour.toString().padStart(2, '0')}:00` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Table Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Activity Table */}
          <div className="lg:col-span-2">
          <Card className="h-full border">
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                            <div className="flex items-center justify-center">
                              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="ml-3">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-red-500 py-40">
                            Error loading data
                          </TableCell>
                        </TableRow>
                      ) : !sessionsData?.data || sessionsData.data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-40">
                            {searchTerm ? (
                              `No vehicles found matching "${searchTerm}"`
                            ) : (
                              <div className="flex flex-col items-center space-y-2">
                                <Car className="h-12 w-12 text-muted-foreground/50" />
                                <p className="font-medium">No vehicle activity detected</p>
                                <p className="text-sm">Waiting for vehicles to enter...</p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sessionsData.data.map((session: TodaySession) => (
                          <TableRow key={session.id}>
                            <TableCell className="text-sm">
                              {session.entry?.time 
                                ? format(new Date(session.entry.time), "HH:mm:ss")
                                : session.exit?.time
                                ? format(new Date(session.exit.time), "HH:mm:ss")
                                : '-'}
                            </TableCell>
                            <TableCell className="font-mono font-semibold">
                              {session.reg_num}
                            </TableCell>
                            <TableCell>{session.province}</TableCell>
                            <TableCell>
                              {session.status === 'OPEN' ? (
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">Inside</span>
                                </div>
                              ) : session.status === 'CLOSED' ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <ArrowUpCircle className="h-4 w-4" />
                                  <span className="font-medium">Completed</span>
                                </div>
                              ) : session.status === 'CONFLICT' ? (
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                  <ArrowDownCircle className="h-4 w-4" />
                                  <span className="font-medium">Conflict</span>
                                </div>
                              ) : session.status === 'ABANDONED' ? (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <ArrowDownCircle className="h-4 w-4" />
                                  <span className="font-medium">Abandoned</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <ArrowDownCircle className="h-4 w-4" />
                                  <span className="font-medium">{session.status}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {session.status === 'ABANDONED'
                                ? "TimeOut"
                                : session.durationSec !== null 
                                ? formatDuration(session.durationSec)
                                : (session.entry?.time ? getCurrentDuration(session.entry.time) : '—')
                              }
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
            <Card className="h-full border">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Today's Traffic</CardTitle>
                <p className="text-muted-foreground text-sm">Hourly vehicle entries</p>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center space-y-2">
                      <p className="text-sm">No vehicle entries today</p>
                      <p className="text-xs">Chart will update when vehicles enter</p>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
