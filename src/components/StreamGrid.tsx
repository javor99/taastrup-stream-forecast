
import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { Stream } from '@/types/stream';
import { fetchSummary } from '@/services/api';
import { transformApiDataToStreams } from '@/utils/dataTransformers';
import { useToast } from '@/hooks/use-toast';

// Generate 7-day predictions for a stream
const generatePredictions = (baseLevel: number, trend: 'rising' | 'falling' | 'stable') => {
  const predictions = [];
  let currentLevel = baseLevel;
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Apply trend with some randomness
    if (trend === 'rising') {
      currentLevel += Math.random() * 0.3 + 0.1;
    } else if (trend === 'falling') {
      currentLevel -= Math.random() * 0.2 + 0.05;
    } else {
      currentLevel += (Math.random() - 0.5) * 0.1;
    }
    
    // Ensure level doesn't go below 0
    currentLevel = Math.max(0, currentLevel);
    
    predictions.push({
      date,
      predictedLevel: Math.round(currentLevel * 10) / 10,
      confidence: Math.floor(Math.random() * 20) + 75 // 75-95% confidence
    });
  }
  
  return predictions;
};

// Mock streams for fallback when API fails
const mockStreams: Stream[] = [
  {
    id: '70000864',
    name: 'Hove å, Tostholm bro',
    location: {
      lat: 55.680989,
      lng: 12.219433,
      address: 'Tostholm bro'
    },
    currentLevel: 1.2,
    minLevel: 0.5,
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:30:00'),
    trend: 'rising',
    predictions: generatePredictions(1.2, 'rising'),
    last30DaysRange: {
      min_cm: 1408.5,
      max_cm: 1419.9,
      min_m: 14.085,
      max_m: 14.199,
    },
    last30DaysHistorical: [],
  },
  {
    id: '70000927',
    name: 'Hakkemosegrøften, Ole Rømers Vej',
    location: {
      lat: 55.681673,
      lng: 12.281167,
      address: 'Ole Rømers Vej'
    },
    currentLevel: 0.8,
    minLevel: 0.3,
    maxLevel: 2.5,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:25:00'),
    trend: 'stable',
    predictions: generatePredictions(0.8, 'stable'),
    last30DaysRange: {
      min_cm: 1140.5,
      max_cm: 1151.4,
      min_m: 11.405,
      max_m: 11.514,
    },
    last30DaysHistorical: [],
  },
  {
    id: '70000865',
    name: 'Sengeløse å, Sengeløse mose',
    location: {
      lat: 55.689824,
      lng: 12.267812,
      address: 'Sengeløse mose'
    },
    currentLevel: 2.1,
    minLevel: 1.0,
    maxLevel: 3.2,
    status: 'warning',
    lastUpdated: new Date('2025-01-04T10:35:00'),
    trend: 'rising',
    predictions: generatePredictions(2.1, 'rising'),
    last30DaysRange: {
      min_cm: 1587.1,
      max_cm: 1587.6,
      min_m: 15.871,
      max_m: 15.876,
    },
    last30DaysHistorical: [],
  },
  {
    id: '70000926',
    name: 'Nybølle Å, Ledøje Plantage',
    location: {
      lat: 55.693957,
      lng: 12.309862,
      address: 'Ledøje Plantage'
    },
    currentLevel: 0.6,
    minLevel: 0.2,
    maxLevel: 2.8,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:20:00'),
    trend: 'rising',
    predictions: generatePredictions(0.6, 'rising'),
    last30DaysRange: {
      min_cm: 2765.7,
      max_cm: 2802.1,
      min_m: 27.657,
      max_m: 28.021,
    },
    last30DaysHistorical: [],
  },
  {
    id: '70000925',
    name: 'Spangå, Ågesholmvej',
    location: {
      lat: 55.676561,
      lng: 12.239100,
      address: 'Ågesholmvej'
    },
    currentLevel: 2.8,
    minLevel: 1.5,
    maxLevel: 3.5,
    status: 'danger',
    lastUpdated: new Date('2025-01-04T10:40:00'),
    trend: 'rising',
    predictions: generatePredictions(2.8, 'rising'),
    last30DaysRange: {
      min_cm: 1924.3,
      max_cm: 2002.1,
      min_m: 19.243,
      max_m: 20.021,
    },
    last30DaysHistorical: [],
  },
  {
    id: '70000923',
    name: 'Enghave Å, Rolandsvej 3',
    location: {
      lat: 55.687870,
      lng: 12.201108,
      address: 'Rolandsvej 3'
    },
    currentLevel: 1.5,
    minLevel: 0.8,
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:15:00'),
    trend: 'falling',
    predictions: generatePredictions(1.5, 'falling'),
    last30DaysRange: {
      min_cm: 1244.6,
      max_cm: 1280.7,
      min_m: 12.446,
      max_m: 12.807,
    },
    last30DaysHistorical: [],
  },
  {
    id: '70000924',
    name: 'Ll. Vejleå, Lille Solhøjvej 42',
    location: {
      lat: 55.636369,
      lng: 12.212559,
      address: 'Lille Solhøjvej 42'
    },
    currentLevel: 1.1,
    minLevel: 0.4,
    maxLevel: 2.7,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:10:00'),
    trend: 'stable',
    predictions: generatePredictions(1.1, 'stable'),
    last30DaysRange: {
      min_cm: 1838.8,
      max_cm: 1856.6,
      min_m: 18.388,
      max_m: 18.566,
    },
    last30DaysHistorical: [],
  }
];

export const StreamGrid = () => {
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);
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
        setLastUpdated(lastUpdated);
      } catch (err) {
        console.error('Failed to load stream data:', err);
        
        // Use dummy data as fallback
        setAllStreams(mockStreams);
        setVisibleStreams(mockStreams);
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
        <StreamMap streams={allStreams} onVisibleStreamsChange={handleVisibleStreamsChange} />
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
