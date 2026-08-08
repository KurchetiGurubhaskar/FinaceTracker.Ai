import React, { useEffect, useState } from 'react';
import { Landmark, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get('loans/');
        setLoans(res.data);
      } catch (error) {
        console.error('Failed to fetch loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Loading loans...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Loan Management</h1>
        <p className="text-slate-600 mt-2">Track and manage your active loans and EMIs.</p>
      </div>

      {loans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan, idx) => {
            const progress = ((parseFloat(loan.principal_amount) - parseFloat(loan.outstanding_amount)) / parseFloat(loan.principal_amount)) * 100;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{loan.name}</h3>
                      <p className="text-xs font-medium text-slate-500 uppercase">{loan.loan_type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    {loan.interest_rate}% APR
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Principal</span>
                    <span className="font-bold text-slate-900">₹{parseFloat(loan.principal_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Outstanding</span>
                    <span className="font-bold text-rose-500">₹{parseFloat(loan.outstanding_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">EMI</span>
                    <span className="font-bold text-slate-900">₹{parseFloat(loan.emi_amount || '0').toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-500">Repayment Progress</span>
                    <span className="font-bold text-primary">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No active loans found</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            You don't have any active loans tracked in the system at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
