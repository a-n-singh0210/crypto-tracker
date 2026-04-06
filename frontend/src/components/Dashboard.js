import { useEffect, useState, useCallback } from "react";
import { getPortfolio, getAnalytics, getPredictions, deleteCrypto } from "../services/api";
import AddCryptoForm from "./AddCryptoForm";
import Layout from "./Layout";
import AllocationChart from "./AllocationChart";
import PredictionTrendChart from "./PredictionTrendChart";
import MarketTrends from "./MarketTrends";
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Trash2, Edit3, Check, X, PlusCircle } from 'lucide-react';

export default function Dashboard({ username = "test", onLogout }) {
  const [portfolio, setPortfolio] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editFormData, setEditFormData] = useState({ quantity: "", buyPrice: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [portfolioData, analyticsData, predictionsData] = await Promise.all([
        getPortfolio(username),
        getAnalytics(username),
        getPredictions(username)
      ]);
      setPortfolio(portfolioData || []);
      setAnalytics(analyticsData);
      setPredictions(predictionsData || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this specific holding?")) {
      try {
        await deleteCrypto(id);
        loadData();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete asset.");
      }
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setEditFormData({ quantity: asset.quantity, buyPrice: asset.buyPrice });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:8080/portfolio/update/${editingAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: parseFloat(editFormData.quantity),
          buyPrice: parseFloat(editFormData.buyPrice)
        })
      });
      setEditingAsset(null);
      loadData();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update asset.");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allocationData = Object.values(
    portfolio.reduce((acc, item) => {
      const name = item.cryptoName.toUpperCase().trim();
      const pred = predictions.find(p => p.crypto.toLowerCase() === name.toLowerCase());
      const value = (pred && pred.currentPrice > 0) ? pred.currentPrice * item.quantity : item.buyPrice * item.quantity;
      
      if (!acc[name]) {
        acc[name] = { name, value: 0 };
      }
      acc[name].value += value;
      return acc;
    }, {})
  ).map(item => ({
    ...item,
    value: parseFloat(item.value.toFixed(2))
  })).filter(item => item.value > 0);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-700" id="overview-section">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'total-balance', label: 'Total Balance', value: `₹${analytics?.currentValue?.toLocaleString() || 0}`, icon: Wallet, color: 'blue' },
          { id: 'total-invested', label: 'Total Invested', value: `₹${analytics?.totalInvestment?.toLocaleString() || 0}`, icon: PieChartIcon, color: 'purple' },
          { id: 'total-profit-loss', label: 'Profit / Loss', value: `₹${analytics?.profitLoss?.toLocaleString() || 0}`, icon: (analytics?.profitLoss || 0) >= 0 ? TrendingUp : TrendingDown, color: (analytics?.profitLoss || 0) >= 0 ? 'green' : 'red' },
          { id: 'top-asset', label: 'Top Asset', value: analytics?.topAsset || 'N/A', icon: PieChartIcon, color: 'orange' },
        ].map((card) => (
          <div key={card.id} id={card.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl hover:border-gray-600 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-500 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{card.label}</p>
            <h2 className="text-2xl font-bold tracking-tight">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl" id="allocation-chart-container">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Portfolio Allocation</h3>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-gray-500/10 rounded-full text-[10px] font-bold text-gray-400 flex items-center gap-1 border border-gray-500/20">
                Sync Status: On Demand
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <AllocationChart data={allocationData} />
          </div>
        </div>

        {/* Quick Add Section */}
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl flex flex-col" id="quick-add-section">
          <AddCryptoForm username={username} refresh={loadData} />
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500" id="portfolio-section">
      {/* Aggregated View (Summary) */}
      <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
          <div>
            <h3 className="text-xl font-bold">Portfolio Summary</h3>
            <p className="text-xs text-gray-500">Aggregated view by asset</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Quantity</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg. Buy Price</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Price</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {analytics?.assetDetails?.length > 0 ? (
                analytics.assetDetails.map((asset, idx) => (
                  <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center font-bold">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 mr-3 text-xs">
                          {asset.name.substring(0, 1)}
                        </div>
                        {asset.name}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-gray-300">{asset.quantity.toFixed(4)}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-gray-300">₹{asset.averageBuyPrice.toLocaleString()}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-gray-300">₹{asset.currentPrice.toLocaleString()}</td>
                    <td className={`px-8 py-6 whitespace-nowrap font-semibold text-right ${asset.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{asset.profitLoss.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Holdings (Management) */}
      <div className="bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden" id="manage-assets-section">
        <div className="p-8 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
          <div>
            <h3 className="text-xl font-bold">Manage Holdings</h3>
            <p className="text-xs text-gray-500">Edit or remove specific entries</p>
          </div>
          <button id="add-asset-btn" onClick={() => setActiveTab('add')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <PlusCircle size={16} /> Add New Entry
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" id="portfolio-table">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Asset</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Buy Price (₹)</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {portfolio.length > 0 ? (
                portfolio.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/30 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center font-bold">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-xs text-gray-400">
                          {item.cryptoName.substring(0, 1).toUpperCase()}
                        </div>
                        {item.cryptoName.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-gray-300">
                      {editingAsset?.id === item.id ? (
                        <input 
                          type="number" 
                          value={editFormData.quantity} 
                          onChange={e => setEditFormData({...editFormData, quantity: e.target.value})}
                          className="bg-gray-700 border border-blue-500 rounded px-2 py-1 w-24 text-white"
                        />
                      ) : item.quantity}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-gray-300">
                      {editingAsset?.id === item.id ? (
                        <input 
                          type="number" 
                          value={editFormData.buyPrice} 
                          onChange={e => setEditFormData({...editFormData, buyPrice: e.target.value})}
                          className="bg-gray-700 border border-blue-500 rounded px-2 py-1 w-24 text-white"
                        />
                      ) : `₹${item.buyPrice.toLocaleString()}`}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        {editingAsset?.id === item.id ? (
                          <>
                            <button onClick={handleUpdate} className="text-green-400 hover:text-green-500 p-2 rounded-lg bg-green-500/10"><Check size={18}/></button>
                            <button onClick={() => setEditingAsset(null)} className="text-gray-400 hover:text-gray-500 p-2 rounded-lg bg-gray-500/10"><X size={18}/></button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="text-blue-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-red-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-8 py-12 text-center text-gray-500">No holdings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPredictions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500" id="predictions-section">
      {predictions.length > 0 ? (
        predictions.map((p, i) => (
          <div key={i} className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <h4 className="text-2xl font-bold mb-2">{p.crypto}</h4>
            <div className="flex items-center space-x-2 mb-6">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                p.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' : 
                p.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' : 
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {p.recommendation}
              </span>
              <span className="text-gray-500 text-xs">Aggregate Forecast</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Price</span>
                <span className="font-semibold text-white">₹{p.currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-700 pb-2">
                <span className="text-gray-400">Final Predicted</span>
                <span className={`font-bold ${p.predictedPrice > p.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{p.predictedPrice.toLocaleString()}
                </span>
              </div>
              
              {/* Individual Sources */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Source Predictions</p>
                {Object.entries(p.sourcePredictions || {}).map(([source, val]) => (
                  <div key={source} className="flex justify-between text-[10px]">
                    <span className="text-gray-400">{source}</span>
                    <span className={val > p.currentPrice ? 'text-green-500/80' : 'text-red-500/80'}>₹{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <PredictionTrendChart 
                  currentPrice={p.currentPrice} 
                  predictedPrice={p.predictedPrice} 
                  historicalPrices={p.historicalPrices} 
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full bg-gray-800 p-12 rounded-3xl border border-gray-700 text-center">
          <p className="text-gray-500">No predictions available yet. Add some assets to your portfolio to see predictions!</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'portfolio': return renderPortfolio();
      case 'market': return <MarketTrends />;
      case 'analytics': return renderPredictions(); // Using predictions for analytics tab
      case 'add': return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-10 rounded-3xl border border-gray-700 shadow-2xl">
          <AddCryptoForm username={username} refresh={loadData} />
        </div>
      );
      default: return renderOverview();
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      username={username}
      onLogout={onLogout}
    >
      {renderContent()}
    </Layout>
  );
}