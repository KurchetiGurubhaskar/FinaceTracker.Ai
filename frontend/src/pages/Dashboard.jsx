import React, { useEffect, useState } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, Target, Wallet, Activity, 
  BrainCircuit, Sparkles, AlertTriangle, Plus, UploadCloud, Mic, Landmark, 
  BookOpen, CreditCard, PieChart as PieChartIcon, ArrowRight, ShieldCheck, 
  History, Calendar as CalendarIcon, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../api/axios';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
const SLATE_COLORS = ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];



export function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loans, setLoans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  
  // Computed Stats State
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    loans: 0,
    savings: 12500, // Mock base savings
    investments: 158000, // Mock base investments
    netWorth: 0,
    creditScore: 782, // Mock credit score
  });

  // Graph Data State
  const [cashFlowData, setCashFlowData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [investmentData, setInvestmentData] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [txnRes, goalsRes, loansRes, subsRes, budgetsRes, portfoliosRes] = await Promise.all([
          api.get('transactions/').catch(() => ({ data: [] })),
          api.get('goals/').catch(() => ({ data: [] })),
          api.get('loans/').catch(() => ({ data: [] })),
          api.get('subscriptions/').catch(() => ({ data: [] })),
          api.get('budgets/').catch(() => ({ data: [] })),
          api.get('portfolios/').catch(() => ({ data: [] }))
        ]);

        const allTxns = txnRes.data;
        setTransactions(allTxns.slice(0, 5));

        let income = 0;
        let expenses = 0;
        const flowMap = {};
        const catMap = {};

        allTxns.forEach((t) => {
          const credit = parseFloat(t.credit);
          const debit = parseFloat(t.debit);
          const date = t.date;

          if (credit > 0) income += credit;
          if (debit > 0) expenses += debit;

          if (!flowMap[date]) flowMap[date] = { income: 0, expenses: 0 };
          if (credit > 0) flowMap[date].income += credit;
          if (debit > 0) flowMap[date].expenses += debit;

          if (debit > 0) {
            const catName = t.category ? t.category.name : 'Uncategorized';
            catMap[catName] = (catMap[catName] || 0) + debit;
          }
        });

        // Total Loans
        let totalLoans = 0;
        loansRes.data.forEach((l) => {
          totalLoans += parseFloat(l.outstanding_amount || 0);
        });

        // Compute Net Worth
        const netWorth = (income - expenses) + stats.savings + stats.investments - totalLoans;

        setStats(prev => ({
          ...prev,
          balance: income - expenses,
          income,
          expenses,
          loans: totalLoans,
          netWorth
        }));

        // Format Graphs
        const formattedFlow = Object.keys(flowMap).sort().slice(-7).map(date => ({
          date: date.substring(5),
          Income: flowMap[date].income,
          Expenses: flowMap[date].expenses,
        }));
        
        const formattedCat = Object.entries(catMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value).slice(0, 5);

        setCashFlowData(formattedFlow);
        setCategoryData(formattedCat);
        setGoals(goalsRes.data);
        setLoans(loansRes.data);
        
        const upcomingSubs = [...subsRes.data].sort((a, b) => 
          new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()
        ).slice(0, 4);
        setSubscriptions(upcomingSubs);

        // Process Budgets
        const budgets = budgetsRes.data.map(b => {
          const catName = b.category ? b.category.name : b.name || 'Uncategorized';
          const spent = catMap[catName] || 0;
          return { category: catName, spent: spent, total: parseFloat(b.amount) };
        });
        setBudgetData(budgets.length > 0 ? budgets : [
          { category: 'General', spent: expenses, total: expenses > 0 ? expenses * 1.5 : 1000 }
        ]);

        // Process Portfolios
        let totalInvestments = 0;
        const invData = portfoliosRes.data.map(p => {
          totalInvestments += parseFloat(p.total_value || 0);
          return { month: new Date(p.created_at || new Date()).toLocaleString('default', { month: 'short' }), value: parseFloat(p.total_value || 0) };
        });
        setInvestmentData(invData.length > 0 ? invData : [{ month: 'Current', value: stats.investments }]);
        
        // Update Investments Stat if we got portfolios
        if (totalInvestments > 0) {
           setStats(prev => ({...prev, investments: totalInvestments, netWorth: prev.netWorth - prev.investments + totalInvestments}));
        }

        // Process Activity Timeline
        const activities = allTxns.slice(0, 5).map(t => {
          const isCredit = parseFloat(t.credit) > 0;
          return {
            time: t.date,
            action: t.description || t.merchant || 'Transaction',
            amount: (isCredit ? '+' : '-') + '₹' + (isCredit ? t.credit : t.debit),
            type: isCredit ? 'income' : 'expense'
          };
        });
        setActivityTimeline(activities);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-slate-50 min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <ShieldCheck className="text-primary w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Initializing EFIP Engine...</span>
        </div>
      </div>
    );
  }

  // Helper for formatting currency
  const formatINR = (val) => '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 font-sans pb-24">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER & QUICK ACTIONS --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <ShieldCheck className="text-primary w-8 h-8" />
              EFIP Command Center
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-wide mt-1 uppercase">v3.0 Enterprise Edition</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <UploadCloud size={16} /> Upload Bill
            </button>
            <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <Mic size={16} /> Voice Entry
            </button>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </div>

        {/* --- AI WIDGET --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-lg p-1 shadow-lg"
        >
          <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <BrainCircuit size={32} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  Good Morning, Bhaskar <Sparkles className="text-amber-400 w-4 h-4" />
                </h2>
                <p className="text-indigo-200 text-sm font-medium mt-1">
                  You spent <span className="text-white font-bold">{formatINR(8400)}</span> last week. 
                  <span className="text-rose-400 ml-2">Prediction: Food expenses may increase 12% this month.</span>
                </p>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="bg-black/30 border border-indigo-500/30 p-3 rounded text-center flex-1 md:flex-none md:min-w-[120px]">
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Suggested Budget</p>
                <p className="text-white font-black text-xl">{formatINR(4000)}</p>
              </div>
              <div className="bg-black/30 border border-emerald-500/30 p-3 rounded text-center flex-1 md:flex-none md:min-w-[120px]">
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">Potential Savings</p>
                <p className="text-emerald-400 font-black text-xl">{formatINR(1250)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- TOP KPI CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total Balance', val: formatINR(stats.balance), icon: Wallet, color: 'text-slate-700' },
            { label: 'Income (MTD)', val: formatINR(stats.income), icon: TrendingUp, color: 'text-emerald-600' },
            { label: 'Expenses (MTD)', val: formatINR(stats.expenses), icon: TrendingDown, color: 'text-rose-600' },
            { label: 'Total Savings', val: formatINR(stats.savings), icon: Target, color: 'text-blue-600' },
            { label: 'Investments', val: formatINR(stats.investments), icon: PieChartIcon, color: 'text-indigo-600' },
            { label: 'Active Loans', val: formatINR(stats.loans), icon: Landmark, color: 'text-amber-600' },
            { label: 'Net Worth', val: formatINR(stats.netWorth), icon: Activity, color: 'text-purple-600' },
            { label: 'Credit Score', val: stats.creditScore, icon: ShieldCheck, color: 'text-teal-600' },
          ].map((kpi, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="bg-white border border-slate-200 p-3 rounded-sm shadow-sm flex flex-col justify-between group hover:border-slate-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                <kpi.icon size={14} className={`${kpi.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              </div>
              <h3 className={`text-lg font-black ${kpi.color}`}>{kpi.val}</h3>
            </motion.div>
          ))}
        </div>

        {/* --- CHARTS GRID ROW 1 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* Cash Flow */}
          <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-sm flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Cash Flow Trajectory</h2>
            </div>
            <div className="p-4 flex-1 h-[250px]">
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#f8fafc', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">Insufficient Data</div>
              )}
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Budget Utilization</h2>
            </div>
            <div className="p-4 flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontSize: '12px', borderRadius: '4px' }} />
                  <Bar dataKey="spent" fill="#3b82f6" radius={[0, 2, 2, 0]} barSize={12}>
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.spent > entry.total * 0.9 ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Growth */}
          <div className="xl:col-span-1 bg-white border border-slate-200 shadow-sm rounded-sm flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Investment Growth</h2>
            </div>
            <div className="p-4 flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={investmentData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '4px' }} formatter={(val) => formatINR(val)} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* --- LISTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-sm flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Recent Transactions</h2>
              <a href="/finance" className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">View All →</a>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Merchant/Desc</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length > 0 ? (
                    transactions.map((t, idx) => {
                      const isCredit = parseFloat(t.credit) > 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 whitespace-nowrap font-mono text-xs text-slate-500">{t.date}</td>
                          <td className="px-4 py-2 font-bold text-slate-800 text-xs">{t.description || t.merchant || 'UNKNOWN'}</td>
                          <td className="px-4 py-2 text-xs">
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm font-semibold text-[10px] uppercase">
                              {t.category ? t.category.name : 'MISC'}
                            </span>
                          </td>
                          <td className={`px-4 py-2 text-right font-mono font-bold text-xs ${isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {isCredit ? '+' : '-'}{formatINR(isCredit ? parseFloat(t.credit) : parseFloat(t.debit))}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No transactions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Bills & Subscriptions */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Upcoming Bills</h2>
              <CalendarIcon size={14} className="text-slate-400" />
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub, idx) => (
                  <div key={idx} className="flex justify-between items-center border border-slate-100 p-2 rounded-sm bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{sub.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(sub.next_billing_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-slate-700">{formatINR(parseFloat(sub.amount))}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No Upcoming Bills</div>
              )}
            </div>
          </div>

          {/* Activity & LMS Timeline */}
          <div className="xl:col-span-1 bg-white border border-slate-200 shadow-sm rounded-sm flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Activity Timeline</h2>
              <History size={14} className="text-slate-400" />
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-6">
                {activityTimeline.map((item, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ring-2 ring-white ${
                      item.type === 'expense' ? 'bg-rose-500' :
                      item.type === 'income' ? 'bg-emerald-500' :
                      item.type === 'lms' ? 'bg-indigo-500' : 'bg-blue-500'
                    }`}></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{item.action}</p>
                    <p className={`text-xs font-mono font-bold mt-0.5 ${
                      item.type === 'expense' || item.type === 'investment' ? 'text-rose-500' : 'text-emerald-500'
                    }`}>{item.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

