import React from 'react';
import { StreamGrid } from '@/components/StreamGrid';
import { Header } from '@/components/Header';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';


const Index = () => {
  const auth = useAuth();
  
  if (!auth) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-lg">Loading authentication...</div>
    </div>;
  }
  
  const { isAdmin, isAuthenticated, isLoading } = auth;
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = React.useState(false);


  // Auto-close admin login when authenticated
  React.useEffect(() => {
    if (isAuthenticated && showAdminLogin) {
      setShowAdminLogin(false);
    }
  }, [isAuthenticated, showAdminLogin]);

  // Auto-close admin dashboard with escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAdminDashboard(false);
      }
    };
    
    if (showAdminDashboard) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showAdminDashboard]);


  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 dark:from-background dark:via-card/20 dark:to-accent/5 relative overflow-hidden transition-all duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23059669%22%20fill-opacity=%220.08%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%2306b6d4%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse dark:from-primary/10 dark:to-cyan-500/10"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000 dark:from-cyan-400/10 dark:to-blue-600/10"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000 dark:from-indigo-400/10 dark:to-purple-500/10"></div>
      
      <div className="relative z-10">
        <Header 
          onShowAdminLogin={() => setShowAdminLogin(true)}
          onShowAdminDashboard={() => setShowAdminDashboard(true)}
        />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
              Water Level Monitoring System
            </h1>
            <h2 className="text-3xl font-display font-semibold text-primary mb-3 tracking-wide">
              Stream Monitoring Dashboard
            </h2>
            
          </div>
          <StreamGrid />
        </main>
      </div>

      {showAdminLogin && !isAuthenticated && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}

      {showAdminDashboard && isAuthenticated && isAdmin && (
        <AdminDashboard 
          onClose={() => setShowAdminDashboard(false)}
        />
      )}
    </div>
  );
};

export default Index;