import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  LineChart, 
  BrainCircuit, 
  GraduationCap, 
  FileText,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const sitemap = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Wallet, label: 'Finance', path: '/finance' },
  { icon: UploadCloud, label: 'Upload Statement', path: '/upload' },
  { icon: LineChart, label: 'Analytics', path: '/analytics' },
  { icon: BrainCircuit, label: 'AI Center', path: '/ai' },
  { icon: GraduationCap, label: 'LMS', path: '/lms' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
];

export function EnterpriseSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="bg-white/40 backdrop-blur-xl border-r border-white/50 h-screen sticky top-0 flex flex-col z-20 text-slate-800 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
        <motion.div 
          animate={{ opacity: isCollapsed ? 0 : 1, display: isCollapsed ? 'none' : 'block' }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            FinTrack<span className="text-primary">.ai</span>
          </h1>
        </motion.div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/50 transition-colors text-slate-500 hover:text-slate-800 absolute right-4"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
        {sitemap.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  isActive 
                    ? 'text-primary' 
                    : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                )
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav" 
                    className="absolute inset-0 bg-white/60 rounded-lg border border-white/80 shadow-sm" 
                    initial={false} 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                  />
                )}
                <item.icon 
                  className={clsx(
                    'w-5 h-5 transition-colors relative z-10', 
                    isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-800'
                  )} 
                />
                <motion.span 
                  animate={{ opacity: isCollapsed ? 0 : 1, display: isCollapsed ? 'none' : 'block' }}
                  className="relative z-10 whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/50 space-y-1">
        <button className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/50 hover:text-slate-900 w-full transition-colors group">
          <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-800" />
          <motion.span animate={{ opacity: isCollapsed ? 0 : 1, display: isCollapsed ? 'none' : 'block' }}>Settings</motion.span>
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-danger hover:bg-white/50 w-full transition-colors group"
        >
          <LogOut className="w-5 h-5 text-danger" />
          <motion.span animate={{ opacity: isCollapsed ? 0 : 1, display: isCollapsed ? 'none' : 'block' }}>Logout</motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
