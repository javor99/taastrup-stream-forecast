import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { Stream } from '@/types/stream';

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

const mockStreams: Stream[] = [
  {
    id: 'stream-001',
    name: 'Høje Taastrup Å',
    location: {
      lat: 55.6493,
      lng: 12.2725,
      address: 'Høje Taastrup Hovedgade'
    },
    currentLevel: 1.2,
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:30:00'),
    trend: 'rising',
    predictions: generatePredictions(1.2, 'rising')
  },
  {
    id: 'stream-002',
    name: 'Vestvolden Bæk',
    location: {
      lat: 55.6421,
      lng: 12.2891,
      address: 'Vestvolden Park'
    },
    currentLevel: 0.8,
    maxLevel: 2.5,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:25:00'),
    trend: 'stable',
    predictions: generatePredictions(0.8, 'stable')
  },
  {
    id: 'stream-003',
    name: 'Hedehusene Kanal',
    location: {
      lat: 55.6571,
      lng: 12.2456,
      address: 'Hedehusene Centervej'
    },
    currentLevel: 2.1,
    maxLevel: 3.2,
    status: 'warning',
    lastUpdated: new Date('2025-01-04T10:35:00'),
    trend: 'rising',
    predictions: generatePredictions(2.1, 'rising')
  },
  {
    id: 'stream-004',
    name: 'Fløng Møllebæk',
    location: {
      lat: 55.6325,
      lng: 12.2612,
      address: 'Fløng Møllevej'
    },
    currentLevel: 0.6,
    maxLevel: 2.8,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:20:00'),
    trend: 'rising',
    predictions: generatePredictions(0.6, 'rising')
  },
  {
    id: 'stream-005',
    name: 'Taastrup Eng Vandløb',
    location: {
      lat: 55.6678,
      lng: 12.2834,
      address: 'Taastrup Eng Nature Area'
    },
    currentLevel: 2.8,
    maxLevel: 3.5,
    status: 'danger',
    lastUpdated: new Date('2025-01-04T10:40:00'),
    trend: 'rising',
    predictions: generatePredictions(2.8, 'rising')
  },
  {
    id: 'stream-006',
    name: 'Reerslev Bæk',
    location: {
      lat: 55.6402,
      lng: 12.2123,
      address: 'Reerslev Bymidte'
    },
    currentLevel: 1.5,
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:15:00'),
    trend: 'falling',
    predictions: generatePredictions(1.5, 'falling')
  }
];

// Simulate data fetching
const fetchStreams = (): Promise<Stream[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockStreams);
    }, 2000); // 2 second delay to show skeleton
  });
};

export const StreamGrid = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStreams = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStreams();
        setStreams(data);
      } catch (error) {
        console.error('Error loading streams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreams();
  }, []);

  if (isLoading) {
    return <StreamGridSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <StreamMap streams={streams} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
};