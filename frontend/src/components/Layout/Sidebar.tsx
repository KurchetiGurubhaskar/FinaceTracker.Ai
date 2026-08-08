import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet,
  Landmark,
  PieChart, 
  Sparkles,
  BookOpen,
  FileText,
  CalendarDays,
  Settings,
  LogOut,
  Target,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Landmark, label: 'Bank Connect', path: '/bank-connect' },
  { icon: Wallet, label: 'Finance Ledger', path: '/finance' },
  { icon: Target, label: 'Budgets', path: '/budget' },
  { icon: TrendingUp, label: 'Investments', path: '/investments' },
  { icon: CreditCard, label: 'Loans', path: '/loans' },
  { icon: PieChart, label: 'Analytics', path: '/analytics' },
  { icon: Sparkles, label: 'AI Center', path: '/ai' },
  { icon: BookOpen, label: 'Learning (LMS)', path: '/lms' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          FinTrack
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={clsx(
                    'w-5 h-5 transition-colors', 
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  )} 
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            twMerge(
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group w-full',
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className={clsx('w-5 h-5 transition-colors', isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600')} />
              Settings
            </>
          )}
        </NavLink>
        <button 
          onClick={() => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left group"
        >
          <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
          Logout
        </button>
      </div>
    </aside>
  );
}
