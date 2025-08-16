
import React from 'react';
import { StreamGrid } from '@/components/StreamGrid';
import { Header } from '@/components/Header';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';

const Index = () => {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
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

  // Mock streams data - in real app this would come from props or API
  const mockStreams = [
    {
      id: '70000864',
      name: 'Hove å, Tostholm bro',
      location: { lat: 55.680989, lng: 12.219433, address: 'Tostholm bro' },
      currentLevel: 1.2, maxLevel: 3.0, status: 'normal' as const,
      lastUpdated: new Date('2025-01-04T10:30:00'), trend: 'rising' as const,
      predictions: []
    },
    {
      id: '70000927',
      name: 'Hakkemosegrøften, Ole Rømers Vej',
      location: { lat: 55.681673, lng: 12.281167, address: 'Ole Rømers Vej' },
      currentLevel: 0.8, maxLevel: 2.5, status: 'normal' as const,
      lastUpdated: new Date('2025-01-04T10:25:00'), trend: 'stable' as const,
      predictions: []
    },
    {
      id: '70000865',
      name: 'Sengeløse å, Sengeløse mose',
      location: { lat: 55.689824, lng: 12.267812, address: 'Sengeløse mose' },
      currentLevel: 2.1, maxLevel: 3.2, status: 'warning' as const,
      lastUpdated: new Date('2025-01-04T10:35:00'), trend: 'rising' as const,
      predictions: []
    },
    {
      id: '70000925',
      name: 'Spangå, Ågesholmvej',
      location: { lat: 55.676561, lng: 12.239100, address: 'Ågesholmvej' },
      currentLevel: 2.8, maxLevel: 3.5, status: 'danger' as const,
      lastUpdated: new Date('2025-01-04T10:40:00'), trend: 'rising' as const,
      predictions: []
    }
  ];

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
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
              Høje-Taastrup Municipality
            </h1>
            <h2 className="text-3xl font-display font-semibold text-primary mb-3 tracking-wide">
              Stream Water Level Monitoring
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Real-time monitoring and predictions for six GPS-tagged streams across the municipality
            </p>
            
            {!isAuthenticated && (
              <div className="mt-8">
                <Button 
                  onClick={() => setShowAdminLogin(true)}
                  variant="outline" 
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Access
                </Button>
              </div>
            )}

            {isAuthenticated && isAdmin && (
              <div className="mt-8">
                <Button 
                  onClick={() => setShowAdminDashboard(true)}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Open Admin Dashboard
                </Button>
              </div>
            )}
          </div>
          <StreamGrid />
        </main>
      </div>

      {showAdminLogin && !isAuthenticated && (
        <AdminLogin />
      )}

      {showAdminDashboard && isAuthenticated && isAdmin && (
        <AdminDashboard 
          streams={mockStreams} 
        />
      )}
    </div>
  );
};

export default Index;
