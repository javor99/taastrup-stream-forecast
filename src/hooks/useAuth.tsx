import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  municipalityId?: number;
}

interface AuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  user: User | null;
  userMunicipalityId: number | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role: 'user' | 'admin' | 'superadmin') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/error';
import { fetchUserMunicipalities } from '@/services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMunicipalityId, setUserMunicipalityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by verifying stored token
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      verifyToken(token)
        .then((verificationData) => {
      if (verificationData) {
            const role = verificationData.user.role;
            
            // Only allow admin and superadmin users
            if (role === 'superadmin' || role === 'admin') {
              setUser(verificationData.user);
              setIsAuthenticated(true);
              
              if (role === 'superadmin') {
                setIsSuperAdmin(true);
                setIsAdmin(true);
              } else {
                setIsAdmin(true);
                setIsSuperAdmin(false);
              }
            } else {
              // Non-admin user - log them out
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
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
      console.log('[useAuth] Verifying token...');
      const { data, error } = await supabase.functions.invoke('auth-proxy', {
        body: {
          path: 'auth/verify',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      });

      if (error) {
        console.error('[useAuth] Token verification error:', error);
        return null;
      }
      
      console.log('[useAuth] Token verification response:', data);
      
      if (data && data.valid === true) {
        console.log('[useAuth] Token is valid, user:', data.user);
        
        // Fetch user's municipality
        try {
          const muniData = await fetchUserMunicipalities(token);
          const municipalityId = muniData.municipality?.id || muniData.municipalities?.[0]?.id;
          if (municipalityId) {
            setUserMunicipalityId(municipalityId);
          }
        } catch (muniError) {
          console.warn('[useAuth] Failed to fetch user municipality:', muniError);
        }
        
        return { user: data.user };
      }
      
      console.warn('[useAuth] Token is invalid or expired');
      return null;
    } catch (error) {
      console.error('[useAuth] Token verification exception:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-proxy', {
        body: {
          path: 'auth/login',
          method: 'POST',
          data: { email, password }
        }
      });

      if (error) {
        const message = getEdgeFunctionErrorMessage(error, 'Login failed');
        return { success: false, error: message };
      }

      if (data && !data.error) {
        const role = data.user.role;
        
        // Only allow admin and superadmin users to login
        if (role === 'superadmin' || role === 'admin') {
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Store token and user data
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          
          if (role === 'superadmin') {
            setIsSuperAdmin(true);
            setIsAdmin(true);
          } else {
            setIsAdmin(true);
            setIsSuperAdmin(false);
          }
          
          // Fetch user's municipality
          try {
            const muniData = await fetchUserMunicipalities(data.token);
            const municipalityId = muniData.municipality?.id || muniData.municipalities?.[0]?.id;
            if (municipalityId) {
              setUserMunicipalityId(municipalityId);
            }
          } catch (muniError) {
            console.warn('[useAuth] Failed to fetch user municipality:', muniError);
          }
          
          return { success: true };
        } else {
          return { success: false, error: 'Access denied. Admin privileges required.' };
        }
      } else {
        return { success: false, error: data?.error || 'Login failed' };
      }
    } catch (error) {
      const message = getEdgeFunctionErrorMessage(error, 'Network error occurred');
      console.error('Login error:', error);
      return { success: false, error: message };
    }
  };

  const register = async (email: string, password: string, role: 'user' | 'admin' | 'superadmin'): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('auth_token');
      const { data, error } = await supabase.functions.invoke('auth-proxy', {
        body: {
          path: 'auth/register',
          method: 'POST',
          data: { email, password, role },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      });

      if (error) {
        const message = getEdgeFunctionErrorMessage(error, 'Registration failed');
        return { success: false, error: message };
      }

      if (data && !data.error) {
        return { success: true };
      } else {
        return { success: false, error: data?.error || 'Registration failed' };
      }
    } catch (error) {
      const message = getEdgeFunctionErrorMessage(error, 'Network error occurred');
      console.error('Registration error:', error);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsAuthenticated(false);
    setUser(null);
    setUserMunicipalityId(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isSuperAdmin, isAuthenticated, user, userMunicipalityId, login, register, logout, isLoading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log('useAuth called, AuthContext:', AuthContext);
  const context = useContext(AuthContext);
  console.log('useAuth context:', context);
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider - context is undefined');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};