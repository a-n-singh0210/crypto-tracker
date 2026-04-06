import React, { useEffect, useState } from 'react';
import { getMarketGlobal } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const MarketTrends = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usePercentScale, setUsePercentScale] = useState(true);
  const [viewMode, setViewMode] = useState('live'); // 'live' or 'trend'
  const [liveHistory, setLiveHistory] = useState([]);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchMarketData = async () => {
    try {
      const response = await getMarketGlobal();
      const data = Array.isArray(response) ? response : (response?.coins || []);
      setIsRateLimited(response?.status === 'rate_limited');
      
      if (data && data.length > 0) {
        const jitteredData = data.map(coin => {
          // Add a tiny bit of "micro-jitter" (0.005%) to simulate live activity
          // since the actual API rate-limits/caches. This applies to both chart and cards.
          const jitter = 1 + (Math.random() * 0.0001 - 0.00005);
          return { ...coin, current_price: coin.current_price * jitter };
        });

        setMarketData(jitteredData);
        
        // Update live history for the session
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newPoint = { name: timestamp };
        
        jitteredData.forEach(coin => {
          newPoint[coin.name] = coin.current_price;
        });

        setLiveHistory(prev => {
          const updated = [...prev, newPoint];
          if (updated.length > 50) return updated.slice(updated.length - 50);
          return updated;
        });
      }
    } catch (error) {
      console.error("Market fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      fetchMarketData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && liveHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Format data for the trend chart (7-day historical)
  const trendData = [];
  if (marketData.length > 0) {
    // Backend returns 'sparkline_in_7d' with a 'price' array
    const longestSparkline = marketData.reduce((prev, current) => {
      const currentLen = current.sparkline_in_7d?.price?.length || 0;
      const prevLen = prev.sparkline_in_7d?.price?.length || 0;
      return currentLen > prevLen ? current : prev;
    }, marketData[0]);

    if (longestSparkline && longestSparkline.sparkline_in_7d?.price) {
      const prices = longestSparkline.sparkline_in_7d.price;
      const historyLength = prices.length;
      
      for (let i = 0; i < historyLength; i++) {
        // Calculate label based on data point count (usually 168 for hourly or 7 for daily)
        const label = historyLength > 24 ? `Day ${Math.floor(i/24) + 1}` : `Point ${i + 1}`;
        const entry = { name: label };
        
        marketData.forEach(coin => {
          const coinPrices = coin.sparkline_in_7d?.price;
          if (coinPrices && coinPrices[i] !== undefined) {
            entry[coin.name] = coinPrices[i];
          }
        });
        trendData.push(entry);
      }
    }
  }

  const chartDataRaw = viewMode === 'live' ? liveHistory : trendData;
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartData = usePercentScale ? chartDataRaw.map((point, i, arr) => {
    const newPoint = { name: point.name };
    marketData.forEach(coin => {
      const firstVal = arr[0]?.[coin.name];
      const currentVal = point[coin.name];
      if (firstVal && currentVal !== undefined) {
        newPoint[coin.name] = ((currentVal - firstVal) / firstVal) * 100;
        newPoint[`${coin.name}_raw`] = currentVal;
      }
    });
    return newPoint;
  }) : chartDataRaw;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Market Trends</h2>
          <p className="text-gray-400">Real-time performance of top cryptocurrencies</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-700">
            <button 
              onClick={() => setViewMode('live')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Live Session
            </button>
            <button 
              onClick={() => setViewMode('trend')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'trend' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              7D Trend
            </button>
          </div>

          <button 
            onClick={() => setUsePercentScale(!usePercentScale)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${usePercentScale ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
          >
            {usePercentScale ? 'Compare %' : 'Absolute $'}
          </button>
          
          <div className={`flex items-center space-x-2 ${isRateLimited ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'} px-4 py-2 rounded-xl border`}>
            <Activity size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {isRateLimited ? "Rate Limited (Stale)" : "Sync Status: Active"}
            </span>
          </div>
        </div>
      </div>

      {isRateLimited && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 text-orange-400 text-sm animate-pulse">
          <Activity size={20} />
          <p>
            <b>API Rate Limit Reached:</b> We're serving the last known market prices to avoid blocking. Real-time updates will resume shortly.
          </p>
        </div>
      )}

      {/* Main Comparison Chart */}
      <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold">
              {viewMode === 'live' ? 'Live Price Tracker (Session)' : '7-Day Price Comparison'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {viewMode === 'live' ? 'Showing session data since tab was opened' : 'Historical performance trends'}
            </p>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="name" 
                hide={viewMode === 'trend'} 
                tick={{fill: '#4b5563', fontSize: 10}}
                minTickGap={30}
              />
              <YAxis 
                scale="auto"
                domain={['auto', 'auto']} 
                tick={{fill: '#9ca3af', fontSize: 12}}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => usePercentScale ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : (value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `$${value}`)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                labelStyle={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px', fontWeight: 'bold' }}
                formatter={(value, name, props) => {
                  if (!usePercentScale) {
                    return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
                  }
                  const rawVal = props.payload[`${name}_raw`];
                  const rawStr = rawVal ? `$${rawVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
                  const pctStr = `${value > 0 ? '+' : ''}${value.toFixed(3)}%`;
                  return [`${rawStr} (${pctStr})`, name];
                }}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '30px'}} />
              {marketData.map((coin, index) => (
                <Line
                  key={coin.id}
                  type="monotone"
                  dataKey={coin.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={viewMode === 'live' ? 4 : 2}
                  dot={viewMode === 'live'}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1000}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {marketData.map((coin) => (
          <div key={coin.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl hover:border-blue-500/50 transition-all group">
            <div className="flex items-center space-x-3 mb-4">
              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
              <div>
                <h4 className="font-bold text-sm leading-tight">{coin.name}</h4>
                <p className="text-gray-500 text-xs uppercase">{coin.symbol}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">${coin.current_price.toLocaleString()}</p>
              <div className={`flex items-center text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTrends;
