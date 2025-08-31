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
    last30DaysRange: { min_cm: 50, max_cm: 180, min_m: 0.5, max_m: 1.8 }
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
    last30DaysRange: { min_cm: 40, max_cm: 120, min_m: 0.4, max_m: 1.2 }
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
    last30DaysRange: { min_cm: 150, max_cm: 280, min_m: 1.5, max_m: 2.8 }
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
    last30DaysRange: { min_cm: 30, max_cm: 90, min_m: 0.3, max_m: 0.9 }
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
    last30DaysRange: { min_cm: 220, max_cm: 320, min_m: 2.2, max_m: 3.2 }
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
    last30DaysRange: { min_cm: 100, max_cm: 200, min_m: 1.0, max_m: 2.0 }
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
    last30DaysRange: { min_cm: 60, max_cm: 150, min_m: 0.6, max_m: 1.5 }
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