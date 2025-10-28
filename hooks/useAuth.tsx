import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, getLoggedInUser, apiLogout } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkLoggedIn = async () => {
    try {
      const loggedInUser = await getLoggedInUser();
      setUser(loggedInUser);
    } catch (error) {
      console.log("No user logged in");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
        const loggedInUser = await apiLogin(email, pass);
        setUser(loggedInUser);
        return loggedInUser;
    } catch (error) {
        setUser(null);
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
      setLoading(true);
      await checkLoggedIn();
  }

  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};