
import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { Stream } from '@/types/stream';
import { fetchSummary } from '@/services/api';
import { transformApiDataToStreams } from '@/utils/dataTransformers';

export const StreamGrid = () => {
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadStreams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { summary, lastUpdated } = await fetchSummary();
        
        const transformedStreams = transformApiDataToStreams(summary);
        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
        setLastUpdated(lastUpdated);
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
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Showing {visibleStreams.length} of {allStreams.length} stations</div>
            {lastUpdated && (
              <div>Last updated: {new Date(lastUpdated).toLocaleString('en-DK', { 
                timeZone: 'Europe/Copenhagen',
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            )}
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
