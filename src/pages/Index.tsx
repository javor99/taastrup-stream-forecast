
import React from 'react';
import { StreamGrid } from '@/components/StreamGrid';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Høje-Taastrup Municipality
          </h1>
          <h2 className="text-2xl font-semibold text-blue-700 mb-2">
            Stream Water Level Monitoring
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real-time monitoring and predictions for six GPS-tagged streams across the municipality
          </p>
        </div>
        <StreamGrid />
      </main>
    </div>
  );
};

export default Index;
