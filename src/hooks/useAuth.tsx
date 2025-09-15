import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://ee870f0e958a.ngrok-free.app';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by verifying stored token
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (token && storedUser) {
      verifyToken(token)
        .then((isValid) => {
          if (isValid) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            // Set admin status based on email (you might want to add role to the API response)
            if (userData.email === 'supertest@supertest.com') {
              setIsSuperAdmin(true);
              setIsAdmin(true);
            } else if (userData.email === 'test@test.com') {
              setIsAdmin(true);
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

  const verifyToken = async (token: string): Promise<boolean> => {
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
        return data.valid === true;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
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
        
        // Set admin status based on email (you might want to add role to the API response)
        if (email === 'supertest@supertest.com') {
          setIsSuperAdmin(true);
          setIsAdmin(true);
        } else if (email === 'test@test.com') {
          setIsAdmin(true);
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

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
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

  return (
    <AuthContext.Provider value={{ isAdmin, isSuperAdmin, isAuthenticated, user, login, register, logout, isLoading }}>
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