import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await api.post('auth/login/', {
        username: data.email, // backend expects username or email depending on config
        password: data.password
      });
      
      if (response.data.access && response.data.refresh) {
        login(response.data.access, response.data.refresh);
        navigate('/');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setServerError('Invalid email or password.');
      } else {
        setServerError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 w-full relative z-10 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 bg-slate-900 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck size={120} />
          </div>
          <ShieldCheck className="mx-auto text-primary w-12 h-12 mb-4 relative z-10" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider relative z-10">EFIP Connect</h2>
          <p className="text-slate-400 text-sm mt-2 relative z-10">Authenticate to access Command Center</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {serverError}
              </div>
            )}
            
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="operator@efip.com"
              />
              {errors.email && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3 h-3 text-slate-400" /> Passphrase
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate'}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500 font-medium">
              Don't have clearance? <a href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">Request Access</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
