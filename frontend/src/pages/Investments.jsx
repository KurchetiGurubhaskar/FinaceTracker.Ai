import React, { useEffect, useState } from 'react';
import { TrendingUp, Plus, Loader2, DollarSign, Activity, PieChart as PieChartIcon } from 'lucide-react';
import api from '../api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Investments() {
  const [portfolios, setPortfolios] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfoliosRes, assetsRes] = await Promise.all([
        api.get('portfolios/'),
        api.get('assets/')
      ]);
      setPortfolios(portfoliosRes.data);
      setAssets(assetsRes.data);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate metrics
  const totalInvested = assets.reduce((sum, asset) => sum + (parseFloat(asset.quantity) * parseFloat(asset.average_buy_price)), 0);
  const currentValue = assets.reduce((sum, asset) => {
    const price = asset.current_price ? parseFloat(asset.current_price) : parseFloat(asset.average_buy_price);
    return sum + (parseFloat(asset.quantity) * price);
  }, 0);
  const totalPnL = currentValue - totalInvested;
  const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Prepare chart data (Group by asset type)
  const allocationMap = {};
  assets.forEach(asset => {
    const price = asset.current_price ? parseFloat(asset.current_price) : parseFloat(asset.average_buy_price);
    const value = parseFloat(asset.quantity) * price;
    allocationMap[asset.type] = (allocationMap[asset.type] || 0) + value;
  });
  
  const chartData = Object.keys(allocationMap).map(key => ({
    name: key.replace('_', ' '),
    value: allocationMap[key]
  }));

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investment Portfolio</h1>
          <p className="text-slate-600 mt-2">Track your wealth, stocks, and crypto across all accounts.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-bold shadow-sm hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Current Value</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{currentValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <Activity className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Invested</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{totalInvested.toLocaleString(undefined, {maximumFractionDigits: 2})}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${totalPnL >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <TrendingUp className={`w-6 h-6 ${totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overall Return</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </h3>
                <span className={`text-sm font-medium ${totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ({pnlPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-indigo-500" /> Asset Allocation
          </h3>
          
          {chartData.length > 0 ? (
            <div className="h-64 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {chartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              No assets to display
            </div>
          )}
        </div>

        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900">Your Holdings</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-bold">Asset</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold text-right">Holdings</th>
                  <th className="p-4 font-bold text-right">Avg Buy Price</th>
                  <th className="p-4 font-bold text-right">Current Price</th>
                  <th className="p-4 font-bold text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      You haven't added any assets yet.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const buyPrice = parseFloat(asset.average_buy_price);
                    const currentPrice = asset.current_price ? parseFloat(asset.current_price) : buyPrice;
                    const qty = parseFloat(asset.quantity);
                    const pnl = (currentPrice - buyPrice) * qty;
                    const isProfitable = pnl >= 0;

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{asset.name}</div>
                          {asset.ticker && <div className="text-xs text-slate-500">{asset.ticker}</div>}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">
                            {asset.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-slate-700">
                          {qty.toLocaleString(undefined, {maximumFractionDigits: 4})}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-700">
                          ₹{buyPrice.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-700">
                          ₹{currentPrice.toLocaleString()}
                        </td>
                        <td className={`p-4 text-right font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfitable ? '+' : ''}₹{pnl.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
