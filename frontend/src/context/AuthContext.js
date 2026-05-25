import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem('mc_token');
    const stored = localStorage.getItem('mc_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch(_) {}
      authAPI.getMe()
        .then(({ data }) => setUser(data.data?.user || data.user))
        .catch(() => { localStorage.removeItem('mc_token'); localStorage.removeItem('mc_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('mc_token', data.token);
    localStorage.setItem('mc_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('mc_token', data.token);
    localStorage.setItem('mc_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Account created successfully!');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch(_) {}
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const u = { ...prev, ...updates };
      localStorage.setItem('mc_user', JSON.stringify(u));
      return u;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
