import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('healthtwin_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('healthtwin_token')) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to authenticate token:', err);
      localStorage.removeItem('healthtwin_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { access_token } = response.data;
    localStorage.setItem('healthtwin_token', access_token);
    setToken(access_token);
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (email, password, fullName, termsAccepted) => {
    const response = await authAPI.register({
      email,
      password,
      full_name: fullName,
      terms_accepted: termsAccepted,
    });
    const { access_token } = response.data;
    localStorage.setItem('healthtwin_token', access_token);
    setToken(access_token);
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
    return userRes.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('healthtwin_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
