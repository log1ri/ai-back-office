"use client"

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Generate more realistic mock data
const generateMockData = () => {
  const data = [];
  const now = new Date();
  now.setHours(14, 0, 0, 0); // Start at 14:00:00

  for (let i = 0; i < 60; i++) { // 60 data points for an hour
    const newTime = new Date(now.getTime() + i * 60 * 1000); // Add i minutes
    data.push({
      time: newTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      events: Math.floor(Math.random() * (70 - 10 + 1)) + 10, // Random events between 10 and 70
    });
  }
  return data;
};

const mockData = generateMockData();

const LogEventsChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={mockData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
        barCategoryGap={0}
        barGap={0}
      >
        <XAxis 
          dataKey="time" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          // Display every 15th label to prevent clutter
          interval={14}
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
        <Bar dataKey="events" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LogEventsChart; 