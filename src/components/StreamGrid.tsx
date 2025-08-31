
import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { Stream } from '@/types/stream';
import { fetchSummary, fetchAllPredictions } from '@/services/api';
import { transformApiDataToStreams } from '@/utils/dataTransformers';

export const StreamGrid = () => {
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStreams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [summary, predictions] = await Promise.all([
          fetchSummary(),
          fetchAllPredictions()
        ]);
        
        const transformedStreams = transformApiDataToStreams(summary, predictions);
        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
      } catch (err) {
        console.error('Failed to load stream data:', err);
        setError('Failed to load stream data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, []);

  const handleVisibleStreamsChange = React.useCallback((streams: Stream[]) => {
    console.log('Visible streams updated:', streams.length, streams.map(s => s.name));
    setVisibleStreams(streams);
  }, []);

  if (isLoading) {
    return <StreamGridSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading stream data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <StreamMap streams={allStreams} onVisibleStreamsChange={handleVisibleStreamsChange} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Stream Monitoring Stations</h2>
          <div className="text-sm text-muted-foreground">
            Showing {visibleStreams.length} of {allStreams.length} stations
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      </div>
    </div>
  );
};
