"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  phone_number?: string | null;
  is_active: boolean;
  role: string;
  careers: { id: number; name: string }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken: string, userData?: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', newToken);
    }
    setToken(newToken);
    if (userData) {
      setUser(userData);
    } else {
      // If user data isn't provided, fetch it
      api.users.me()
        .then(res => setUser(res))
        .catch(() => logout());
    }
  }, [logout]);

  useEffect(() => {
    const handleLogoutEvent = () => logout();
    window.addEventListener("auth-logout", handleLogoutEvent);

    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (storedToken) {
      setToken(storedToken);
      api.users.me()
        .then((res) => setUser(res))
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    return () => window.removeEventListener("auth-logout", handleLogoutEvent);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
}
