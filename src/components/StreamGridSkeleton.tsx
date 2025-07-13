import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';

export const StreamCardSkeleton = ({ index = 0 }: { index?: number }) => {
  return (
    <div 
      className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-border p-6 animate-fade-in relative overflow-hidden"
      style={{ 
        animationDelay: `${index * 0.1}s`,
        animationDuration: '0.6s'
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>

      {/* Water Level Indicator Skeleton */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-3 bg-muted/30 rounded-lg border border-border/30">
            <Skeleton className="h-3 w-16 mx-auto mb-2" />
            <Skeleton className="h-7 w-12 mx-auto" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </div>
  );
};

export const StreamMapSkeleton = () => {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl border border-border flex items-center justify-center animate-fade-in relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="text-center space-y-4 z-10">
        <div className="relative">
          <Skeleton className="h-12 w-12 mx-auto rounded-full" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="flex justify-center space-x-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-2 w-2 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StreamGridSkeleton = () => {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Loading Indicator */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          <div className="flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Loading Stream Data</h3>
          <p className="text-sm text-muted-foreground">Fetching real-time water level information...</p>
          <div className="flex justify-center space-x-1 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
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