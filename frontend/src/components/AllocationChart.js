import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

const AllocationChart = ({ data = [] }) => {
  // If no data, show a placeholder
  const hasData = data.length > 0 && data.some(item => item.value > 0);
  const chartData = hasData 
    ? data.filter(item => item.value > 0)
    : [{ name: 'No Assets', value: 1 }];
  const displayColors = hasData ? COLORS : ['#374151'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
          isAnimationActive={true}
          animationDuration={1000}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={displayColors[index % displayColors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
          active={hasData}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AllocationChart;
