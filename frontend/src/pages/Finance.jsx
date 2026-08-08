import React, { useEffect, useState, useRef } from 'react';
import { IndianRupee, Search, Filter, Plus, Mic, UploadCloud, MapPin, CreditCard, Check, X, Loader2 } from 'lucide-react';
import api from '../api/axios';

export function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('finance/transactions/');
      setTransactions(res.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceEntry = () => {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Simple NLP mock: "Spent 500 at Starbucks"
        const amountMatch = transcript.match(/\d+/);
        if (amountMatch) setAmount(amountMatch[0]);
        
        const words = transcript.split(' ');
        const atIndex = words.findIndex((w) => w.toLowerCase() === 'at');
        if (atIndex !== -1 && words.length > atIndex + 1) {
          setMerchant(words.slice(atIndex + 1).join(' '));
        } else {
          setMerchant(transcript);
        }
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Voice entry is not supported in your browser.");
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('debit', amount);
    formData.append('merchant', merchant);
    formData.append('date', date);
    formData.append('payment_method', paymentMethod);
    if (file) {
      formData.append('receipt', file);
    }
    
    // For MVP, location tracking can be grabbed via navigator.geolocation here
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((pos) => {
           formData.append('location_lat', pos.coords.latitude.toString());
           formData.append('location_lng', pos.coords.longitude.toString());
           submitData(formData);
       }, () => {
           submitData(formData); // proceed without location if denied
       });
    } else {
       submitData(formData);
    }
  };

  const submitData = async (formData: FormData) => {
    try {
      await api.post('finance/transactions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsAdding(false);
      setAmount('');
      setMerchant('');
      setFile(null);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.merchant || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 mt-6 h-full flex flex-col sm:flex-row gap-6">
      
      {/* Left Column: Transaction List */}
      <div className={`flex-1 transition-all ${isAdding ? 'hidden sm:block sm:w-2/3' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Finance Ledger</h1>
            <p className="text-slate-600 mt-1 text-sm">Enterprise transaction tracking and auditing.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search ledger..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64"
              />
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Merchant / Details</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t, idx) => {
                    const isCredit = parseFloat(t.credit) > 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{t.date}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{t.merchant || t.description || 'Unknown'}</div>
                          {(t.location_lat || t.receipt) && (
                            <div className="flex gap-2 mt-1 text-xs text-slate-400">
                              {t.location_lat && <span className="flex items-center gap-1"><MapPin size={10}/> Geo-tagged</span>}
                              {t.receipt && <span className="flex items-center gap-1"><Check size={10}/> Receipt Attached</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center w-fit gap-1">
                            <CreditCard size={12} /> {t.payment_method || 'CARD'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${isCredit ? 'text-success' : 'text-slate-900'}`}>
                          {isCredit ? '+' : '-'}<IndianRupee size={12} className="inline-block mx-0.5" />
                          {isCredit ? t.credit : t.debit}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Column: Add Expense Panel */}
      {isAdding && (
        <div className="w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg shadow-xl p-6 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">New Record</h2>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <button 
              onClick={handleVoiceEntry}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-md border border-dashed transition-all ${
                isListening ? 'bg-primary/10 border-primary text-primary animate-pulse' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-primary' : ''}`} />
              <span className="font-semibold text-sm">
                {isListening ? 'Listening...' : 'Voice Entry (Beta)'}
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Merchant / Details</label>
              <input 
                type="text"
                required
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                className="px-4 py-2 w-full border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                placeholder="e.g. Amazon AWS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Date</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="px-3 py-2 w-full border border-slate-300 rounded-md text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Method</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="px-3 py-2 w-full border border-slate-300 rounded-md text-sm font-medium bg-white"
                >
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1 block">Receipt Attachment</label>
              <div 
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  {file ? file.name : 'Drag & drop receipt here, or click to browse'}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={e => e.target.files && setFile(e.target.files[0])}
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-md transition-colors flex justify-center items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Record'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
