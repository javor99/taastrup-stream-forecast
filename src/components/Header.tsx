
import React from 'react';
import { Waves, MapPin, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Header = () => {
  console.log('Header component rendering, useAuth available:', typeof useAuth);
  
  let authState;
  try {
    authState = useAuth();
    console.log('useAuth successful:', authState);
  } catch (error) {
    console.error('useAuth error:', error);
    // Fallback values if useAuth fails
    authState = { isAuthenticated: false, isAdmin: false, isLoading: false, logout: () => {} };
  }
  
  const { isAuthenticated, isAdmin, isLoading, logout } = authState;
  
  // Show loading state if auth is still initializing
  if (isLoading) {
    return (
      <header className="bg-background/90 backdrop-blur-md shadow-lg border-b border-border/50 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-br from-primary to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
                <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-display font-bold text-foreground tracking-tight truncate">AquaMonitor</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">Stream Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="bg-background/90 backdrop-blur-md shadow-lg border-b border-border/50 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-display font-bold text-foreground tracking-tight truncate">AquaMonitor</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">Stream Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-muted-foreground bg-muted/60 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-sm border border-border/30 hover:bg-muted/80 transition-all duration-300">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Høje-Taastrup, Denmark</span>
            </div>
            
            {!isAuthenticated ? (
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            ) : isAdmin ? (
              <div className="flex items-center space-x-2">
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : null}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
