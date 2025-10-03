"use client"

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import type { LogEvent } from '../../hooks/useRealtimeLogs';

interface RealtimeLogsChartProps {
  logs: LogEvent[];
  chartType?: 'bar' | 'line' | 'pie';
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all';
  groupBy?: 'hour' | 'day' | 'week' | 'month' | 'action' | 'status' | 'subId';
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export const RealtimeLogsChart: React.FC<RealtimeLogsChartProps> = ({
  logs,
  chartType = 'bar',
  timeRange = '1h',
  groupBy = 'hour'
}) => {
  const processedData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const now = new Date();
    const cutoffTime = new Date();
    
    switch (timeRange) {
      case '1h':
        cutoffTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        cutoffTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        cutoffTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoffTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffTime.setDate(now.getDate() - 30);
        break;
      case '3m':
        cutoffTime.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffTime.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffTime.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffTime.setFullYear(2000); // Include all logs
    }

    // Filter logs by time range
    const filteredLogs = logs.filter(log => {
      if (!log.timestamp) return true;
      const logTime = new Date(log.timestamp);
      return logTime >= cutoffTime;
    });

    // Parse and extract data from JSON source
    const parsedLogs = filteredLogs.map(log => {
      try {
        const parsed = typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
        return {
          ...log,
          parsedData: parsed,
          action: parsed.action || 'unknown',
          status: parsed.status || 0,
          subId: parsed.subId || 'unknown',
          timestamp: parsed.timestamp || log.timestamp
        };
      } catch (e) {
        return {
          ...log,
          parsedData: {},
          action: 'parse_error',
          status: 0,
          subId: 'unknown'
        };
      }
    });

    // Group data based on groupBy parameter
    const grouped: { [key: string]: number } = {};

    parsedLogs.forEach(log => {
      let key = '';
      
      switch (groupBy) {
        case 'hour':
          if (log.timestamp) {
            const date = new Date(log.timestamp);
            key = `${date.getHours().toString().padStart(2, '0')}:00`;
          } else {
            key = 'Unknown';
          }
          break;
        case 'day':
          if (log.timestamp) {
            const date = new Date(log.timestamp);
            key = `${date.getMonth() + 1}/${date.getDate()}`;
          } else {
            key = 'Unknown';
          }
          break;
        case 'week':
          if (log.timestamp) {
            const date = new Date(log.timestamp);
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay());
            key = `Week of ${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
          } else {
            key = 'Unknown';
          }
          break;
        case 'month':
          if (log.timestamp) {
            const date = new Date(log.timestamp);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          } else {
            key = 'Unknown';
          }
          break;
        case 'action':
          key = log.action || 'unknown';
          break;
        case 'status':
          key = `Status ${log.status}`;
          break;
        case 'subId':
          key = log.subId || 'unknown';
          break;
        default:
          key = 'total';
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    // Convert to chart data format
    return Object.entries(grouped)
      .map(([key, count]) => ({
        name: key,
        value: count,
        count: count,
        events: count
      }))
      .sort((a, b) => {
        // Sort by time for temporal groupings, by count for others
        if (['hour', 'day', 'week', 'month'].includes(groupBy)) {
          return a.name.localeCompare(b.name);
        }
        return b.count - a.count;
      });
  }, [logs, timeRange, groupBy]);

  const renderChart = () => {
    if (processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg font-medium">No data available</div>
            <div className="text-sm">Try adjusting the time range or filters</div>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  background: "#111", 
                  border: "1px solid #333",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#8884d8" }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {processedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default: // bar chart
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              barCategoryGap={0}
              barGap={2}
            >
              <XAxis 
                dataKey="name" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  background: "#111", 
                  border: "1px solid #333",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#8884d8" }}
              />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
                name="Events"
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderChart()}
    </div>
  );
};

export default RealtimeLogsChart;
