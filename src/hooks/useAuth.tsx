import React, { createContext, useContext, useState, useEffect } from 'react';

console.log('useAuth hook file loaded');

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initializing...');
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const { isAuth, isAdminUser } = JSON.parse(authData);
        setIsAuthenticated(isAuth);
        setIsAdmin(isAdminUser);
        console.log('Auth state restored:', { isAuth, isAdminUser });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple hardcoded credentials for admin
    if (username === 'test' && password === 'test') {
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('auth', JSON.stringify({ isAuth: true, isAdminUser: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log('useAuth function called');
  const context = useContext(AuthContext);
  console.log('AuthContext value:', context);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};