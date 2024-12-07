import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HeartRateChart = ({ heartRateData, timestamps }) => {
  if (!heartRateData.length || !timestamps.length) return <p>No data available</p>;

  // Prepare data for recharts
  const chartData = heartRateData.slice(-5).map((rate, index) => ({
    timestamp: timestamps.slice(-5)[index],
    heartRate: rate,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <Line type="monotone" dataKey="heartRate" stroke="#8884d8" strokeWidth={2} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HeartRateChart;
