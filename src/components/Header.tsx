
import React from 'react';
import { Waves, MapPin } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Header = () => {
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
            <div className="md:hidden flex items-center text-muted-foreground bg-muted/60 p-2 rounded-lg backdrop-blur-sm border border-border/30">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
