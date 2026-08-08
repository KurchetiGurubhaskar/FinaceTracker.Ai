import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';





const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        try {
          // If we had a /api/auth/me/ endpoint we could fetch the user.
          // For now, we assume if we have a token, we are somewhat logged in.
          // You can expand this later to actually fetch user details.
          setUser({ email: 'user@example.com' }); // placeholder
        } catch (error) {
          console.error("Auth init failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (access: string, refresh: string) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    setUser({ email: 'user@example.com' });
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
