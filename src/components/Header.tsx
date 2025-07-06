
import React from 'react';
import { Waves, MapPin } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg shadow-lg">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900 tracking-tight">AquaMonitor</h1>
              <p className="text-sm text-gray-500 font-medium">Stream Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 bg-gray-50/50 px-3 py-2 rounded-lg backdrop-blur-sm">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Høje-Taastrup, Denmark</span>
          </div>
        </div>
      </div>
    </header>
  );
};
