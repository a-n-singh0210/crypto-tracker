import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PredictionTrendChart = ({ currentPrice, predictedPrice, historicalPrices = [] }) => {
  // Combine historical and predicted data
  const generateData = () => {
    const data = [];
    
    // Add historical data
    if (historicalPrices && historicalPrices.length > 0) {
      historicalPrices.forEach((price, i) => {
        data.push({
          label: `Day -${historicalPrices.length - 1 - i}`,
          price: parseFloat(price.toFixed(2)),
          type: 'Historical'
        });
      });
    } else {
      // Fallback if no historical data
      data.push({ label: 'Today', price: currentPrice, type: 'Historical' });
    }

    // Add prediction data (next 7 days)
    const steps = 7;
    const diff = (predictedPrice - currentPrice) / steps;
    
    for (let i = 1; i <= steps; i++) {
      const price = currentPrice + (diff * i) * (1 + (Math.random() * 0.02 - 0.01));
      data.push({
        label: `Day +${i}`,
        price: parseFloat(price.toFixed(2)),
        type: 'Predicted'
      });
    }
    return data;
  };

  const data = generateData();
  const isUp = predictedPrice > currentPrice;

  return (
    <div className="w-full h-40 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="label" 
            hide={true}
          />
          <YAxis 
            hide={true} 
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value, name, props) => [
              `₹${value.toLocaleString()}`, 
              props.payload.type
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={isUp ? "#10b981" : "#ef4444"} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={3}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionTrendChart;
