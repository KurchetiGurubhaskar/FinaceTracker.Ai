import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('finance/transactions/');
        setTransactions(res.data);
      } catch (error) {
        console.error('Failed to fetch for analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  // Calculate expenses by category
  const categoryData: Record<string, number> = {};
  let totalExpenses = 0;
  
  transactions.forEach(t => {
    const amount = parseFloat(t.debit);
    if (amount > 0) {
      const catName = t.category ? t.category.name : 'Uncategorized';
      categoryData[catName] = (categoryData[catName] || 0) + amount;
      totalExpenses += amount;
    }
  });

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Income vs Expenses
  let totalIncome = 0;
  transactions.forEach(t => {
    const amount = parseFloat(t.credit);
    if (amount > 0) totalIncome += amount;
  });

  const barData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpenses }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">Visualize your spending patterns and financial health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Expenses by Category</h2>
          <div className="h-80">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 font-medium">
                No expense data available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Income vs Expenses</h2>
          <div className="h-80">
            {(totalIncome > 0 || totalExpenses > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} cursor={{fill: 'rgba(255,255,255,0.2)'}} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 font-medium">
                No transaction data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
