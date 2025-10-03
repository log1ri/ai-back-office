"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { BarChart2, TrendingUp, PieChart, Clock, Activity, AlertCircle, Users, ChevronDown } from 'lucide-react';
import RealtimeLogsChart from './RealtimeLogsChart';
import type { LogEvent } from '../../hooks/useRealtimeLogs';

interface LogsAnalyticsDashboardProps {
  logs: LogEvent[];
}

export const LogsAnalyticsDashboard: React.FC<LogsAnalyticsDashboardProps> = ({ logs }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all'>('1h');
  const [groupBy, setGroupBy] = useState<'hour' | 'day' | 'week' | 'month' | 'action' | 'status' | 'subId'>('hour');

  // Calculate stats from logs
  const stats = React.useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        totalLogs: 0,
        successRate: 0,
        uniqueActions: 0,
        uniqueSubIds: 0
      };
    }

    const parsedLogs = logs.map(log => {
      try {
        const parsed = typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
        return {
          ...parsed,
          action: parsed.action || 'unknown',
          status: parsed.status || 0,
          subId: parsed.subId || 'unknown'
        };
      } catch (e) {
        return {
          action: 'parse_error',
          status: 0,
          subId: 'unknown'
        };
      }
    });

    const totalLogs = parsedLogs.length;
    const successLogs = parsedLogs.filter(log => log.status === 200).length;
    const successRate = totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0;
    const uniqueActions = new Set(parsedLogs.map(log => log.action)).size;
    const uniqueSubIds = new Set(parsedLogs.map(log => log.subId)).size;

    return {
      totalLogs,
      successRate: Math.round(successRate),
      uniqueActions,
      uniqueSubIds
    };
  }, [logs]);

  const chartTypeOptions = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart2 },
    { value: 'line', label: 'Line Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart }
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  const groupByOptions = [
    { value: 'hour', label: 'By Hour', icon: Clock },
    { value: 'day', label: 'By Day', icon: Clock },
    { value: 'week', label: 'By Week', icon: Clock },
    { value: 'month', label: 'By Month', icon: Clock },
    { value: 'action', label: 'By Action', icon: Activity },
    { value: 'status', label: 'By Status', icon: AlertCircle },
    { value: 'subId', label: 'By SubId', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{stats.totalLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Unique Actions</p>
                <p className="text-2xl font-bold">{stats.uniqueActions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Unique SubIds</p>
                <p className="text-2xl font-bold">{stats.uniqueSubIds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls and Visualization */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Log Events Analytics
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              {/* Quick Preset Buttons */}
              <div className="flex gap-1 mr-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimeRange('30d');
                    setGroupBy('month');
                    setChartType('bar');
                  }}
                  className="text-xs"
                >
                  📅 This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimeRange('3m');
                    setGroupBy('month');
                    setChartType('line');
                  }}
                  className="text-xs"
                >
                  📊 3 Months
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimeRange('1y');
                    setGroupBy('month');
                    setChartType('line');
                  }}
                  className="text-xs"
                >
                  📈 Yearly
                </Button>
              </div>

              {/* Chart Type Selector */}
              <div className="flex gap-1">
                {chartTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setChartType(option.value as 'bar' | 'line' | 'pie')}
                      className={`flex items-center gap-1 ${
                        chartType === option.value 
                          ? "!bg-blue-50 !border-blue-200 !text-blue-700 hover:!bg-blue-100" 
                          : "!bg-white hover:!bg-gray-50 !border-gray-200"
                      }`}
                      style={{
                        backgroundColor: chartType === option.value ? '#eff6ff' : '#ffffff',
                        borderColor: chartType === option.value ? '#bfdbfe' : '#e5e7eb',
                        color: chartType === option.value ? '#1d4ed8' : '#374151'
                      }}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{option.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Time Range Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {timeRangeOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value} 
                      onClick={() => setTimeRange(option.value as '1h' | '6h' | '24h' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all')}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Group By Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    {(() => {
                      const option = groupByOptions.find(opt => opt.value === groupBy);
                      const Icon = option?.icon || Activity;
                      return (
                        <>
                          <Icon className="h-3 w-3" />
                          {option?.label}
                          <ChevronDown className="h-3 w-3" />
                        </>
                      );
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {groupByOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem 
                        key={option.value} 
                        onClick={() => setGroupBy(option.value as 'hour' | 'day' | 'week' | 'month' | 'action' | 'status' | 'subId')}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3" />
                          {option.label}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-80">
            <RealtimeLogsChart
              logs={logs}
              chartType={chartType}
              timeRange={timeRange}
              groupBy={groupBy}
            />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Statistics & Raw Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics & Raw Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Summary */}
            <div>
              <h4 className="font-semibold mb-3">Monthly Breakdown</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {logs.length > 0 && (() => {
                  const monthlyStats: { [key: string]: { count: number; success: number } } = {};
                  
                  logs.forEach(log => {
                    try {
                      const parsed = typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
                      if (parsed.timestamp || log.timestamp) {
                        const date = new Date(parsed.timestamp || log.timestamp);
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                        
                        if (!monthlyStats[monthKey]) {
                          monthlyStats[monthKey] = { count: 0, success: 0 };
                        }
                        monthlyStats[monthKey].count++;
                        if (parsed.status === 200) {
                          monthlyStats[monthKey].success++;
                        }
                      }
                    } catch (e) {
                      // Skip invalid entries
                    }
                  });

                  return Object.entries(monthlyStats)
                    .sort(([a], [b]) => b.localeCompare(a)) // Sort by month desc
                    .map(([month, stats]) => (
                      <div key={month} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div>
                          <div className="font-medium">{month}</div>
                          <div className="text-sm text-gray-600">
                            {stats.count} logs • {Math.round((stats.success / stats.count) * 100)}% success
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{stats.count}</div>
                          <div className="text-sm text-green-600">{stats.success} ✓</div>
                        </div>
                      </div>
                    ));
                })()}
                {logs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No data available for monthly analysis
                  </div>
                )}
              </div>
            </div>

            {/* Raw Data Sample */}
            <div>
              <h4 className="font-semibold mb-3">Sample Raw Data</h4>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-xs  p-4 rounded-md overflow-x-auto">
                  {logs.length > 0 ? JSON.stringify(
                    logs.slice(0, 3).map(log => {
                      try {
                        return typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
                      } catch (e) {
                        return { error: 'Failed to parse', raw: log.source };
                      }
                    }),
                    null,
                    2
                  ) : 'No log data available'}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsAnalyticsDashboard;
