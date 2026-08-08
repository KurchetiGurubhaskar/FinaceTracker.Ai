import React, { useEffect, useState } from 'react';
import { FileText, Download, Clock } from 'lucide-react';
import api from '../api/axios';

export function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('reports/');
        setReports(res.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-lg font-medium text-slate-500 animate-pulse">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 mt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-2">Generate and view your financial reports.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-md">
          Generate New
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white/60 text-xs uppercase text-slate-700 font-bold border-b border-white/50">
            <tr>
              <th className="px-6 py-4">Report Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Generated Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/50">
            {reports.length > 0 ? (
              reports.map((report, idx) => (
                <tr key={idx} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 text-secondary rounded-md"><FileText size={16} /></div>
                    {report.name || 'Financial Report'}
                  </td>
                  <td className="px-6 py-4 font-medium">{report.report_type || 'Summary'}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-primary/80 font-bold text-sm inline-flex items-center gap-1">
                      <Download size={14} /> Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No reports generated yet. Click "Generate New" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
