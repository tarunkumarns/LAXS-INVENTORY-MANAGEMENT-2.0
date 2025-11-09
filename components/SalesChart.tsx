import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: { hour: string; sales: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="hour" tick={{ fill: 'rgb(107 114 128)' }} fontSize={12} />
          <YAxis tick={{ fill: 'rgb(107 114 128)' }} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: 'rgba(55, 65, 81, 1)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Bar dataKey="sales" fill="#d946ef" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;