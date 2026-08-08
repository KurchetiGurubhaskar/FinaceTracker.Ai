import React, { useEffect, useState } from 'react';
import { Building2, Link2, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export function BankConnect() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBankConnections = async () => {
      try {
        const res = await api.get('bank/');
        setConnections(res.data);
      } catch (error) {
        console.error('Failed to fetch bank connections:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBankConnections();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Loading bank connections...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bank Connections</h1>
          <p className="text-slate-600 mt-2">Manage your connected bank accounts for automatic syncing.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-md flex items-center gap-2">
          <Link2 size={16} /> Link New Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.length > 0 ? (
          connections.map((conn, idx) => (
            <div key={idx} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{conn.institution_name}</h3>
                    <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">**** {conn.account_id ? conn.account_id.slice(-4) : 'XXXX'}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 text-xs font-bold rounded-md ${conn.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {conn.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs pt-4 border-t border-white/50">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <RefreshCw size={12} className={conn.is_active ? "animate-spin-slow" : ""} />
                  Last synced: {conn.last_sync ? new Date(conn.last_sync).toLocaleString() : 'Never'}
                </span>
                <button className="font-bold text-primary hover:underline">Sync Now</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Link2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bank accounts linked</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-6">
              Connect your bank account to automatically sync transactions and get real-time insights.
            </p>
            <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-md">
              Link Bank Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
