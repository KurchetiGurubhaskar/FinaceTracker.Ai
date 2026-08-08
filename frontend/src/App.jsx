import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthLayout } from './components/Layout/AuthLayout';
import { Dashboard } from './pages/Dashboard';
import { UploadStatement } from './pages/UploadStatement';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Finance } from './pages/Finance';
import { Budget } from './pages/Budget';
import { Investments } from './pages/Investments';
import { BankConnect } from './pages/BankConnect';
import { Analytics } from './pages/Analytics';
import { AiCenter } from './pages/AiCenter';
import { Lms } from './pages/Lms';
import { Loans } from './pages/Loans';
import { Reports } from './pages/Reports';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ParticlesBackground } from './components/UI/ParticlesBackground';
import { AuthProvider, useAuth } from './context/AuthContext';

// Simple PrivateRoute wrapper for auth checking
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold uppercase tracking-widest">Loading...</div>;
  }
  
  const token = localStorage.getItem('access');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  // Use env variable or fallback placeholder for client ID
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-placeholder.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <ParticlesBackground />
        <BrowserRouter>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              },
              success: {
                iconTheme: { primary: '#22C55E', secondary: '#FFFFFF' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
              },
            }} 
          />
          <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected App Routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadStatement />} />
            <Route path="finance" element={<Finance />} />
            <Route path="budget" element={<Budget />} />
            <Route path="investments" element={<Investments />} />
            <Route path="bank-connect" element={<BankConnect />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai" element={<AiCenter />} />
            <Route path="lms" element={<Lms />} />
            <Route path="loans" element={<Loans />} />
            <Route path="reports" element={<Reports />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
