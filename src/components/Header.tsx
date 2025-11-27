// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2025 Your Name
// Part of AquaMonitor/InnoTech-TaskForce. See LICENSE for license terms.

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Waves, MapPin, UserCog, LayoutDashboard, Home, LogOut, Info } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';

interface HeaderProps {
  onShowAdminLogin?: () => void;
  onShowAdminDashboard?: () => void;
  isInDashboard?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onShowAdminLogin, onShowAdminDashboard, isInDashboard }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  };

  const handleShowAdminLogin = () => {
    if (onShowAdminLogin) {
      onShowAdminLogin();
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleShowAdminDashboard = () => {
    if (onShowAdminDashboard) {
      onShowAdminDashboard();
    } else {
      setShowAdminDashboard(true);
    }
  };

  return (
    <header className="bg-background/90 backdrop-blur-md shadow-lg border-b border-border/50 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-primary to-blue-600 p-2 sm:p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-display font-bold text-foreground tracking-tight truncate">AquaMonitor</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">Stream Monitoring System</p>
              </div>
            </Link>
            
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/about">
              <Button 
                variant={location.pathname === '/about' ? 'secondary' : 'ghost'} 
                size="sm"
                className="gap-2 hidden md:flex"
              >
                <Info className="h-4 w-4" />
                About
              </Button>
            </Link>
            
            {!isAuthenticated && (
              <Button 
                onClick={handleShowAdminLogin}
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <UserCog className="h-4 w-4" />
                Admin
              </Button>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <div className="flex items-center space-x-2 text-muted-foreground bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                  <UserCog className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{isSuperAdmin ? 'Superadmin Mode' : 'Admin Mode'}</span>
                </div>
                
                <Button 
                  onClick={handleShowAdminDashboard}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  {isInDashboard ? <Home className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                  {isInDashboard ? 'Home' : 'Dashboard'}
                </Button>
              </>
            )}

            {isAuthenticated && (
              <Button 
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Render modals using portal to document body */}
      {showAdminLogin && createPortal(
        <AdminLogin onClose={() => setShowAdminLogin(false)} />,
        document.body
      )}
      
      {showAdminDashboard && createPortal(
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />,
        document.body
      )}
    </header>
  );
};