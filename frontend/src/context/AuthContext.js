import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = sessionStorage.getItem('mc_token');
    const stored = sessionStorage.getItem('mc_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch(_) {}
      authAPI.getMe()
        .then(({ data }) => setUser(data.data?.user || data.user))
        .catch(() => { sessionStorage.removeItem('mc_token'); sessionStorage.removeItem('mc_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    sessionStorage.setItem('mc_token', data.token);
    sessionStorage.setItem('mc_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    sessionStorage.setItem('mc_token', data.token);
    sessionStorage.setItem('mc_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Account created successfully!');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch(_) {}
    sessionStorage.removeItem('mc_token');
    sessionStorage.removeItem('mc_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const u = { ...prev, ...updates };
      sessionStorage.setItem('mc_user', JSON.stringify(u));
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
