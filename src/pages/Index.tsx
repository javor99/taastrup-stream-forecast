
import React from 'react';
import { StreamGrid } from '@/components/StreamGridWithLoading';
import { Header } from '@/components/Header';

const Index = () => {
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
          </div>
          <StreamGrid />
        </main>
      </div>
    </div>
  );
};

export default Index;
