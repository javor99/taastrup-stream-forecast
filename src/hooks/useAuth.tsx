import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminStatus = localStorage.getItem('adminLoggedIn');
    const superAdminStatus = localStorage.getItem('superAdminLoggedIn');
    
    if (superAdminStatus === 'true') {
      setIsSuperAdmin(true);
      setIsAdmin(true);
      setIsAuthenticated(true);
    } else if (adminStatus === 'true') {
      setIsAdmin(true);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === 'supertest@supertest.com' && password === 'supertest') {
      setIsSuperAdmin(true);
      setIsAdmin(true);
      setIsAuthenticated(true);
      localStorage.setItem('superAdminLoggedIn', 'true');
      localStorage.removeItem('adminLoggedIn');
      return true;
    } else if (email === 'test@test.com' && password === 'test') {
      setIsAdmin(true);
      setIsSuperAdmin(false);
      setIsAuthenticated(true);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.removeItem('superAdminLoggedIn');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('superAdminLoggedIn');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isSuperAdmin, isAuthenticated, login, logout, isLoading }}>
      {children}
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