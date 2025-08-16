
import React from 'react';
import { StreamGrid } from '@/components/StreamGrid';
import { Header } from '@/components/Header';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';
import { Stream } from '@/types/stream';

const Index = () => {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = React.useState(false);

  // Stateful streams data 
  const [streams, setStreams] = React.useState<Stream[]>([
    {
      id: '70000864',
      name: 'Hove å, Tostholm bro',
      location: { lat: 55.6810, lng: 12.2194, address: 'Tostholm bro' },
      currentLevel: 1.2, maxLevel: 3.0, status: 'normal' as const,
      lastUpdated: new Date('2025-01-04T10:30:00'), trend: 'rising' as const,
      predictions: [
        { date: new Date('2025-01-05'), predictedLevel: 1.6, confidence: 93 },
        { date: new Date('2025-01-06'), predictedLevel: 1.7, confidence: 92 },
        { date: new Date('2025-01-07'), predictedLevel: 1.9, confidence: 82 },
        { date: new Date('2025-01-08'), predictedLevel: 2.1, confidence: 83 },
        { date: new Date('2025-01-09'), predictedLevel: 2.5, confidence: 90 },
        { date: new Date('2025-01-10'), predictedLevel: 2.6, confidence: 89 },
        { date: new Date('2025-01-11'), predictedLevel: 2.8, confidence: 80 }
      ]
    },
    {
      id: '70000927',
      name: 'Hakkemosegrøften, Ole Rømers Vej',
      location: { lat: 55.6817, lng: 12.2812, address: 'Ole Rømers Vej' },
      currentLevel: 0.8, maxLevel: 2.5, status: 'normal' as const,
      lastUpdated: new Date('2025-01-04T10:25:00'), trend: 'stable' as const,
      predictions: [
        { date: new Date('2025-01-05'), predictedLevel: 0.8, confidence: 94 },
        { date: new Date('2025-01-06'), predictedLevel: 0.8, confidence: 79 },
        { date: new Date('2025-01-07'), predictedLevel: 0.8, confidence: 86 },
        { date: new Date('2025-01-08'), predictedLevel: 0.8, confidence: 75 },
        { date: new Date('2025-01-09'), predictedLevel: 0.8, confidence: 90 },
        { date: new Date('2025-01-10'), predictedLevel: 0.8, confidence: 77 },
        { date: new Date('2025-01-11'), predictedLevel: 0.8, confidence: 80 }
      ]
    },
    {
      id: '70000865',
      name: 'Sengeløse å, Sengeløse mose',
      location: { lat: 55.6898, lng: 12.2678, address: 'Sengeløse mose' },
      currentLevel: 2.1, maxLevel: 3.2, status: 'warning' as const,
      lastUpdated: new Date('2025-01-04T10:35:00'), trend: 'rising' as const,
      predictions: [
        { date: new Date('2025-01-05'), predictedLevel: 2.4, confidence: 80 },
        { date: new Date('2025-01-06'), predictedLevel: 2.6, confidence: 76 },
        { date: new Date('2025-01-07'), predictedLevel: 2.8, confidence: 75 },
        { date: new Date('2025-01-08'), predictedLevel: 3.1, confidence: 86 },
        { date: new Date('2025-01-09'), predictedLevel: 3.2, confidence: 90 },
        { date: new Date('2025-01-10'), predictedLevel: 3.4, confidence: 93 },
        { date: new Date('2025-01-11'), predictedLevel: 3.7, confidence: 76 }
      ]
    },
    {
      id: '70000940',
      name: 'Nybølle Å, Ledøje Plantage',
      location: { lat: 55.6940, lng: 12.3099, address: 'Ledøje Plantage' },
      currentLevel: 0.6, maxLevel: 2.8, status: 'normal' as const,
      lastUpdated: new Date('2025-01-04T10:20:00'), trend: 'rising' as const,
      predictions: [
        { date: new Date('2025-01-05'), predictedLevel: 0.8, confidence: 75 },
        { date: new Date('2025-01-06'), predictedLevel: 1.1, confidence: 90 },
        { date: new Date('2025-01-07'), predictedLevel: 1.4, confidence: 91 },
        { date: new Date('2025-01-08'), predictedLevel: 1.6, confidence: 88 },
        { date: new Date('2025-01-09'), predictedLevel: 1.9, confidence: 94 },
        { date: new Date('2025-01-10'), predictedLevel: 2.2, confidence: 94 },
        { date: new Date('2025-01-11'), predictedLevel: 2.4, confidence: 83 }
      ]
    },
    {
      id: '70000925',
      name: 'Spangå, Ågesholmvej',
      location: { lat: 55.6766, lng: 12.2391, address: 'Ågesholmvej' },
      currentLevel: 2.8, maxLevel: 3.5, status: 'danger' as const,
      lastUpdated: new Date('2025-01-04T10:40:00'), trend: 'rising' as const,
      predictions: [
        { date: new Date('2025-01-05'), predictedLevel: 3.0, confidence: 86 },
        { date: new Date('2025-01-06'), predictedLevel: 3.3, confidence: 87 },
        { date: new Date('2025-01-07'), predictedLevel: 3.5, confidence: 86 },
        { date: new Date('2025-01-08'), predictedLevel: 3.9, confidence: 86 },
        { date: new Date('2025-01-09'), predictedLevel: 4.1, confidence: 86 },
        { date: new Date('2025-01-10'), predictedLevel: 4.4, confidence: 87 },
        { date: new Date('2025-01-11'), predictedLevel: 4.7, confidence: 75 }
      ]
    },
    {
      id: '70000879',
      name: 'Enghave Å, Rolandsvej 3',
      location: { lat: 55.6879, lng: 12.2011, address: 'Rolandsvej 3' },
      currentLevel: 1.5, maxLevel: 3.0, status: 'normal' as const,
      lastUpdated: new Date('2025-01-04T10:15:00'), trend: 'falling' as const,
      predictions: [
        { date: new Date('2025-01-05'), predictedLevel: 1.3, confidence: 92 },
        { date: new Date('2025-01-06'), predictedLevel: 1.2, confidence: 91 },
        { date: new Date('2025-01-07'), predictedLevel: 1.0, confidence: 83 },
        { date: new Date('2025-01-08'), predictedLevel: 0.9, confidence: 85 },
        { date: new Date('2025-01-09'), predictedLevel: 0.8, confidence: 93 },
        { date: new Date('2025-01-10'), predictedLevel: 0.6, confidence: 92 },
        { date: new Date('2025-01-11'), predictedLevel: 0.4, confidence: 82 }
      ]
    }
  ]);

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

  const generateDummyStation = (id: string): Stream => {
    const locations = [
      { lat: 55.680989, lng: 12.219433, name: 'Bro' },
      { lat: 55.681673, lng: 12.281167, name: 'Vej' },
      { lat: 55.689824, lng: 12.267812, name: 'Mose' },
      { lat: 55.676561, lng: 12.239100, name: 'Holmvej' },
      { lat: 55.675000, lng: 12.230000, name: 'Park' },
      { lat: 55.690000, lng: 12.250000, name: 'Station' }
    ];
    
    const waterNames = ['å', 'grøft', 'kanal', 'strøm', 'vandløb'];
    const locationNames = ['bro', 'vej', 'mose', 'park', 'station', 'skov'];
    const statuses: Array<'normal' | 'warning' | 'danger'> = ['normal', 'warning', 'danger'];
    const trends: Array<'rising' | 'falling' | 'stable'> = ['rising', 'falling', 'stable'];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomWaterName = waterNames[Math.floor(Math.random() * waterNames.length)];
    const randomLocationName = locationNames[Math.floor(Math.random() * locationNames.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomTrend = trends[Math.floor(Math.random() * trends.length)];
    
    const maxLevel = 2 + Math.random() * 3; // 2-5m
    const currentLevel = 0.5 + Math.random() * (maxLevel - 0.5); // 0.5 to maxLevel
    
    return {
      id,
      name: `${randomWaterName.charAt(0).toUpperCase() + randomWaterName.slice(1)}, ${randomLocationName}`,
      location: { 
        lat: randomLocation.lat + (Math.random() - 0.5) * 0.01, 
        lng: randomLocation.lng + (Math.random() - 0.5) * 0.01, 
        address: `${randomLocationName} ${Math.floor(Math.random() * 100) + 1}` 
      },
      currentLevel: Math.round(currentLevel * 10) / 10,
      maxLevel: Math.round(maxLevel * 10) / 10,
      status: randomStatus,
      lastUpdated: new Date(),
      trend: randomTrend,
      predictions: []
    };
  };

  const addNewStation = (id: string) => {
    const newStation = generateDummyStation(id);
    setStreams(prev => [...prev, newStation]);
  };

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
          streams={streams}
          onAddStation={addNewStation}
        />
      )}
    </div>
  );
};

export default Index;
