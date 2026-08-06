import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Left Pane - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              FinTrack<span className="text-primary">.ai</span>
            </h1>
          </div>
          
          <Outlet />
          
        </motion.div>
      </div>
      
      {/* Right Pane - Visual/Marketing */}
      <div className="hidden lg:block relative w-0 flex-1 bg-card">
        <div className="absolute inset-0 h-full w-full object-cover bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-card to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        
        <div className="absolute bottom-12 left-12 right-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise-grade financial intelligence.</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Automate your bookkeeping, track expenses with AI, and predict your cash flow with unparalleled accuracy. Built for modern financial teams.
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-lg bg-success/20 text-success">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">SOC2 Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
