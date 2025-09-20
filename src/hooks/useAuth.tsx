import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

interface AuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role: 'user' | 'admin' | 'superadmin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://9432528b1d46.ngrok-free.app';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by verifying stored token
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      verifyToken(token)
        .then((verificationData) => {
          if (verificationData) {
            setUser(verificationData.user);
            setIsAuthenticated(true);
            
            // Set admin status based on role from API
            const role = verificationData.user.role;
            if (role === 'superadmin') {
              setIsSuperAdmin(true);
              setIsAdmin(true);
            } else if (role === 'admin') {
              setIsAdmin(true);
              setIsSuperAdmin(false);
            } else {
              setIsAdmin(false);
              setIsSuperAdmin(false);
            }
          } else {
            // Token is invalid, clear stored data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string): Promise<{ user: User } | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.valid === true) {
          return { user: data.user };
        }
      }
      return null;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        // Set admin status based on role from API response
        const role = data.user.role;
        if (role === 'superadmin') {
          setIsSuperAdmin(true);
          setIsAdmin(true);
        } else if (role === 'admin') {
          setIsAdmin(true);
          setIsSuperAdmin(false);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (email: string, password: string, role: 'user' | 'admin' | 'superadmin'): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isSuperAdmin, isAuthenticated, user, login, register, logout, isLoading, getToken }}>
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