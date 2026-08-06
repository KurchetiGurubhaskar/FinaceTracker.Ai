import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, FileSpreadsheet, Key, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function UploadStatement() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await axios.get('http://127.0.0.1:8000/api/statement/history/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch upload history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    
    // Auto-refresh history every 5 seconds to catch updates from the background task
    const intervalId = setInterval(() => {
      fetchHistory();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    }
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const token = localStorage.getItem('access') || '';
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (password && file.type === 'application/pdf') {
        formData.append('password', password);
      }

      try {
        await axios.post('http://127.0.0.1:8000/api/statement/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        successCount++;
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ` + (err.response?.data?.error || 'Unknown error'));
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully started processing ${successCount} file(s)!`);
      setFiles([]);
      setPassword('');
      fetchHistory(); // Refresh history
    }
    
    setIsUploading(false);
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 mt-10"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Import Statement</h1>
        <p className="text-slate-600 mt-2">
          Upload your Kotak Mahindra Bank PDF or CSV statement. Our AI will automatically parse and categorize your transactions.
        </p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all
          ${isDragActive ? 'border-primary bg-white/60' : 'border-white/80 hover:border-primary/50 hover:bg-white/60 shadow-sm'}
          ${files.length > 0 ? 'border-success/50 bg-success/5' : 'bg-white/40 backdrop-blur-xl'}`}
      >
        <input {...getInputProps()} />
        
        {files.length > 0 ? (
          <div className="w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-left">Files to upload:</h3>
            <div className="space-y-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-white/80 shadow-sm">
                  <div className="flex items-center gap-3">
                    {f.type === 'application/pdf' ? (
                      <FileText className="w-8 h-8 text-danger" />
                    ) : (
                      <FileSpreadsheet className="w-8 h-8 text-success" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[400px]">{f.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="text-sm text-danger hover:text-danger/80 px-2 py-1 bg-danger/10 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
               <p className="text-sm text-slate-600 font-medium">Drag & drop more files or click to add.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <UploadCloud className="w-10 h-10 text-secondary" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">Drag & drop your file here</p>
            <p className="text-slate-600 font-medium">or click to browse from your computer</p>
            <div className="flex gap-4 mt-8">
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-md">.PDF</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-md">.CSV</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {files.some(f => f.type === 'application/pdf') && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/40 backdrop-blur-xl border border-white/60 p-5 rounded-xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-3 text-warning">
              <Key className="w-5 h-5" />
              <h3 className="font-semibold">Password Protected PDF?</h3>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              If your Kotak statement is password protected (usually your CRN or date of birth), please enter it below so we can extract the transactions.
            </p>
            <input 
              type="password"
              placeholder="PDF Password (Optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-md border border-white/80 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-slate-400 font-medium"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end gap-4 pt-4 border-t border-white/50">
        <button 
          onClick={() => setFiles([])}
          disabled={isUploading || files.length === 0}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-white/60 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Process Statement'
          )}
        </button>
      </div>

      {/* Upload History Section */}
      <div className="pt-8 border-t border-white/50 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Upload History</h2>
          <button onClick={fetchHistory} className="text-sm font-bold text-primary hover:text-primary/80">Refresh</button>
        </div>
        
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white/60 text-xs uppercase text-slate-700 font-bold border-b border-white/50">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Uploaded At</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {history.length > 0 ? history.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.file_name}</td>
                  <td className="px-6 py-4 uppercase font-medium">{item.file_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      {item.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {item.status === 'FAILED' && <XCircle className="w-4 h-4 text-danger" />}
                      {item.status === 'PENDING' && <Clock className="w-4 h-4 text-warning" />}
                      <span className={`
                        ${item.status === 'COMPLETED' ? 'text-success' : ''}
                        ${item.status === 'FAILED' ? 'text-danger' : ''}
                        ${item.status === 'PENDING' ? 'text-warning' : ''}
                      `}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No upload history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}
