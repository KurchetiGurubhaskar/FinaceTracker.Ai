import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, LineChart, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AiCenter() {
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat State
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your FinTrack AI assistant. How can I help you analyze your finances today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Predictions State
  const [predictions, setPredictions] = useState([]);
  const [isPredLoading, setIsPredLoading] = useState(false);

  // Anomalies State
  const [anomalies, setAnomalies] = useState([]);
  const [isAnomLoading, setIsAnomLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'predictions' && predictions.length === 0) {
      fetchPredictions();
    }
    if (activeTab === 'anomalies' && anomalies.length === 0) {
      fetchAnomalies();
    }
  }, [activeTab]);

  const fetchPredictions = async () => {
    setIsPredLoading(true);
    try {
      const res = await api.get('ai/predict-spending/');
      setPredictions(res.data.predictions);
    } catch (error) {
      console.error('Failed to fetch predictions', error);
    } finally {
      setIsPredLoading(false);
    }
  };

  const fetchAnomalies = async () => {
    setIsAnomLoading(true);
    try {
      const res = await api.get('ai/detect-anomalies/');
      setAnomalies(res.data.anomalies);
    } catch (error) {
      console.error('Failed to fetch anomalies', error);
    } finally {
      setIsAnomLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput('');
    setIsChatLoading(true);

    try {
      const res = await api.post('ai/chat/', { message: userMsg });
      setMessages(prev => [...prev, { text: res.data.reply || "I processed that.", isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "I'm currently unable to connect to my brain. Please ensure the AI service is running.", 
        isUser: false 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 mt-6 h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Sparkles className="text-indigo-600" /> Financial Intelligence Center
        </h1>
        <p className="text-slate-600 mt-2">Chat with your data, view AI forecasts, and detect spending anomalies.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-2 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare className="w-4 h-4" /> AI Assistant
        </button>
        <button 
          onClick={() => setActiveTab('predictions')}
          className={`pb-3 px-2 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'predictions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <LineChart className="w-4 h-4" /> 30-Day Forecast
        </button>
        <button 
          onClick={() => setActiveTab('anomalies')}
          className={`pb-3 px-2 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'anomalies' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <AlertTriangle className="w-4 h-4" /> Anomaly Detection
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="absolute inset-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isUser ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                      {msg.isUser ? <span className="text-xs font-bold">You</span> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium ${msg.isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-75">●</span>
                      <span className="animate-bounce delay-150">●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask something like 'predict my future' or 'check for anomalies'"
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={isChatLoading || !input.trim()}
                  className="px-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PREDICTIONS TAB */}
        {activeTab === 'predictions' && (
          <div className="absolute inset-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" /> 30-Day Spending Forecast
            </h3>
            
            {isPredLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">Loading AI Forecast...</div>
            ) : predictions.length > 0 ? (
              <div className="flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictions} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      tick={{fill: '#64748b', fontSize: 12}}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `₹${val}`}
                      tick={{fill: '#64748b', fontSize: 12}}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Predicted Spend']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="predicted_amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">Not enough data to generate forecast.</div>
            )}
          </div>
        )}

        {/* ANOMALIES TAB */}
        {activeTab === 'anomalies' && (
          <div className="absolute inset-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-rose-600" /> Recent Spending Anomalies
            </h3>
            
            {isAnomLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">Scanning for unusual activity...</div>
            ) : anomalies.length > 0 ? (
              <div className="space-y-4">
                {anomalies.map((anom, idx) => (
                  <div key={idx} className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{anom.merchant}</h4>
                        <p className="text-sm text-slate-600 mt-1">{anom.reason}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                          <span className="bg-white px-2 py-1 rounded border border-slate-200">{anom.category}</span>
                          <span>{anom.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-black text-rose-600 bg-white px-4 py-2 rounded-lg shadow-sm whitespace-nowrap">
                      ₹{anom.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Looking Good!</h3>
                <p className="text-sm max-w-sm text-center">We couldn't detect any highly unusual spending patterns in your recent transactions.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
