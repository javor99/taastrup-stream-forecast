
import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { Stream } from '@/types/stream';
import { fetchSummary, ApiSummaryStation } from '@/services/api';
import { transformApiDataToStreams } from '@/utils/dataTransformers';
import { useToast } from '@/hooks/use-toast';
import { mockStreams } from '@/data/mockStreams';

export const StreamGrid = () => {
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);
  const [apiData, setApiData] = useState<ApiSummaryStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadStreams = async () => {
      try {
        setIsLoading(true);
        setUsingDummyData(false);
        
        const { summary, lastUpdated } = await fetchSummary();
        
        const transformedStreams = transformApiDataToStreams(summary);
        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
        setApiData(summary);
        setLastUpdated(lastUpdated);
      } catch (err) {
        console.error('Failed to load stream data:', err);
        
        // Use dummy data as fallback
        setAllStreams(mockStreams);
        setVisibleStreams(mockStreams);
        setApiData([]);
        setUsingDummyData(true);
        setLastUpdated(null);
        
        // Show toast notification
        toast({
          title: "Using Demo Data",
          description: "Unable to connect to live data. Displaying demo stream monitoring data for demonstration purposes.",
          variant: "default",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, [toast]);

  const handleVisibleStreamsChange = React.useCallback((streams: Stream[]) => {
    setVisibleStreams(streams);
  }, []);

  if (isLoading) {
    return <StreamGridSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <StreamMap streams={allStreams} apiData={apiData} onVisibleStreamsChange={handleVisibleStreamsChange} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Stream Monitoring Stations</h2>
            {usingDummyData && (
              <p className="text-sm text-muted-foreground mt-1">
                ⚠️ Displaying demo data - Live data unavailable
              </p>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Showing {visibleStreams.length} of {allStreams.length} stations</div>
            {lastUpdated && !usingDummyData && (
              <div>Last updated: {new Date(lastUpdated).toLocaleString('en-DK', { 
                timeZone: 'Europe/Copenhagen',
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            )}
            {usingDummyData && (
              <div>Demo data for testing purposes</div>
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
