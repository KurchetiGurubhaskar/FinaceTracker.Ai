import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertCircle, Plus, Loader2 } from 'lucide-react';
import api from '../api/axios';

export function Budget() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('finance/budgets/');
      setBudgets(res.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Budget Controls</h1>
          <p className="text-slate-600 mt-2">Monitor spending limits across projects and categories.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-bold shadow-sm hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length > 0 ? (
          budgets.map((b, idx) => {
            // Mocking spent amount for UI demonstration if backend doesn't provide it yet
            const spent = b.spent_amount || Math.random() * b.amount;
            const percentage = Math.min((spent / b.amount) * 100, 100);
            const isWarning = percentage > 85;
            
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <Target className={`w-6 h-6 ${isWarning ? 'text-rose-500' : 'text-primary'}`} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                    {b.period}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg mb-1">{b.name || (b.category ? b.category.name : 'General Budget')}</h3>
                <p className="text-slate-500 text-sm mb-6">Tracking {b.period.toLowerCase()} expenses</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">₹{parseFloat(spent.toString()).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    <span className="text-slate-400">₹{parseFloat(b.amount).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isWarning ? 'bg-rose-500' : 'bg-primary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {isWarning && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-2">
                      <AlertCircle className="w-3 h-3" /> Approaching limit
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Active Budgets</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Set up your first budget to start monitoring your spending and get intelligent alerts before you overspend.</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-md text-sm font-bold shadow-sm hover:bg-slate-800 transition-all">
              <Plus className="w-4 h-4" /> Create First Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
