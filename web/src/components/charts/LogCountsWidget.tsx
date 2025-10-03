import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaChartBar, FaChartPie } from 'react-icons/fa';

// Mock data ตัวอย่าง
const logCountsData = [
  { severity: 'Info', count: 1200 },
  { severity: 'Warning', count: 300 },
  { severity: 'Error', count: 150 },
  { severity: 'Critical', count: 20 },
];

const COLORS = ['#4ade80', '#fbbf24', '#f87171', '#a21caf'];

const LogCountsWidget: React.FC = () => {
  const hasData = logCountsData && logCountsData.length > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-4 min-h-[340px]">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FaChartBar className="text-blue-500 text-xl" />
        <span>Top 10 Log Counts by Severity</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Bar Chart */}
        <div className="h-56 flex items-center justify-center">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logCountsData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <XAxis dataKey="severity" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: any) => [value, 'จำนวน']} />
                <Bar dataKey="count">
                  {logCountsData.map((_, idx) => (
                    <Cell key={`cell-bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center text-zinc-400">
              <FaChartBar className="text-4xl mb-2" />
              <span>ยังไม่มีข้อมูล Log สำหรับแสดงกราฟ</span>
            </div>
          )}
        </div>
        {/* Pie Chart */}
        <div className="h-56 flex items-center justify-center">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={logCountsData}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {logCountsData.map((_, idx) => (
                    <Cell key={`cell-pie-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: any) => [value, 'จำนวน']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center text-zinc-400">
              <FaChartPie className="text-4xl mb-2" />
              <span>ยังไม่มีข้อมูล Log สำหรับแสดงกราฟ</span>
            </div>
          )}
        </div>
      </div>
      {/* คำอธิบายใต้กราฟ */}
      <div className="text-sm text-zinc-500 dark:text-zinc-300 mt-2">
        กราฟนี้แสดงจำนวน Log ในแต่ละระดับความรุนแรง (Severity) เพื่อให้เห็นภาพรวมของระบบในช่วงเวลาที่เลือก
      </div>
    </div>
  );
};

export default LogCountsWidget; 