'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSessionUserAction, logoutAction } from '@/actions/auth';
import { AuthenticatedUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthenticatedUser | null;
  loading: boolean;
  logout: (customRedirect?: string | unknown) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getSessionUserAction();
      setUser(currentUser);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async (customRedirect?: string | unknown) => {
    await logoutAction();
    const redirectUrl = typeof customRedirect === 'string'
      ? customRedirect
      : (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin/login' : '/connexion');
    setUser(null);
    window.location.href = redirectUrl;
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
