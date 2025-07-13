import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';

export const StreamCardSkeleton = ({ index = 0 }: { index?: number }) => {
  return (
    <div 
      className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-sm border border-border/50 p-6 animate-fade-in relative overflow-hidden hover:shadow-md transition-shadow duration-300"
      style={{ 
        animationDelay: `${index * 0.08}s`,
        animationDuration: '0.5s'
      }}
    >
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-full" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-md" />
        </div>
      </div>

      {/* Water Level Indicator Skeleton */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-10 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-4 bg-muted/20 rounded-xl border border-border/30">
            <Skeleton className="h-3 w-20 mx-auto mb-3 rounded-full" />
            <Skeleton className="h-7 w-14 mx-auto rounded-lg" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const StreamMapSkeleton = () => {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl border border-border/50 flex items-center justify-center animate-fade-in relative overflow-hidden">
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="text-center space-y-4 z-10">
        <div className="relative">
          <Skeleton className="h-16 w-16 mx-auto rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-48 mx-auto rounded-full" />
          <Skeleton className="h-4 w-36 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const StreamGridSkeleton = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Modern Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative mb-8">
          <Loader className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-medium text-foreground tracking-tight">Loading Stream Data</h3>
          <p className="text-muted-foreground max-w-md">Fetching real-time water level information from monitoring stations</p>
        </div>
      </div>
      
      <StreamMapSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <StreamCardSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
};