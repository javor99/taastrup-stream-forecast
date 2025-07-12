import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const StreamCardSkeleton = () => {
  return (
    <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-border p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="flex items-center mb-2">
            <Skeleton className="h-4 w-4 mr-2 rounded" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>

      {/* Water Level Indicator Skeleton */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full rounded-full" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-3 bg-muted/50 rounded-lg border border-border/50">
            <Skeleton className="h-3 w-12 mx-auto mb-2" />
            <Skeleton className="h-6 w-10 mx-auto" />
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center">
          <Skeleton className="h-3 w-3 mr-2 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
};

export const StreamMapSkeleton = () => {
  return (
    <div className="w-full h-96 bg-muted/50 rounded-xl border border-border flex items-center justify-center animate-fade-in">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-24 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export const StreamGridSkeleton = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <StreamMapSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <StreamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};