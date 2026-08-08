import React, { useState } from 'react';
import { Bell, Search, Sparkles, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function EnterpriseHeader() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [aiSearch, setAiSearch] = useState('');
  const navigate = useNavigate();

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      // Navigate to dashboard with search query
      navigate(`/?q=${encodeURIComponent(globalSearch.trim())}`);
      toast.success(`Filtering transactions for "${globalSearch}"`);
    }
  };

  const handleAiSearch = (e) => {
    if (e.key === 'Enter' && aiSearch.trim()) {
      toast.success(`AI is analyzing "${aiSearch}"... (Coming soon)`);
      setAiSearch('');
    }
  };

  return (
    <header className="bg-white/40 backdrop-blur-xl border-b border-white/50 h-16 flex items-center justify-between px-8 sticky top-0 z-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-6 text-slate-500 w-full max-w-2xl">
        {/* Global Search (Command Palette Simulation) */}
        <div className="relative group w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={handleGlobalSearch}
            placeholder="Search anything... (Press Enter)"
            className="w-full pl-10 pr-12 py-2 bg-white/60 border border-white/80 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60 pointer-events-none">
            <Command className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500">K</span>
          </div>
        </div>

        {/* AI Search */}
        <div className="relative group w-full max-w-sm hidden md:block">
          <Sparkles className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary group-focus-within:animate-pulse" />
          <input 
            type="text" 
            value={aiSearch}
            onChange={(e) => setAiSearch(e.target.value)}
            onKeyDown={handleAiSearch}
            placeholder="Ask AI (e.g. 'Show my Q3 spending')"
            className="w-full pl-10 pr-4 py-2 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-primary/60"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-white/60"></div>
        
        <button className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">Bhaskar</p>
            <p className="text-xs text-slate-500">Enterprise Admin</p>
          </div>
          <motion.img 
            whileHover={{ scale: 1.05 }}
            src="https://ui-avatars.com/api/?name=Bhaskar&background=4F46E5&color=fff" 
            alt="User avatar" 
            className="w-9 h-9 rounded-full ring-2 ring-white/80 group-hover:ring-primary transition-all shadow-sm"
          />
        </button>
      </div>
    </header>
  );
}
