import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';
import api from '../api/axios';

export function Calendar() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get('subscriptions/');
        setSubscriptions(res.data);
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Loading calendar events...</div>
      </div>
    );
  }

  // Sort by next billing date
  const upcomingSubs = [...subscriptions].sort((a, b) => 
    new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Calendar</h1>
          <p className="text-slate-600 mt-2">Track upcoming bills, subscriptions, and financial events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-sm min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Full Calendar View</h3>
            <p className="text-slate-500 font-medium">Coming soon in next update</p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Upcoming Bills</h2>
          </div>
          
          <div className="space-y-4">
            {upcomingSubs.length > 0 ? (
              upcomingSubs.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-white/80 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-danger/10 text-danger rounded-md">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sub.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{new Date(sub.next_billing_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{parseFloat(sub.amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-slate-500 font-medium">
                No upcoming bills or subscriptions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
