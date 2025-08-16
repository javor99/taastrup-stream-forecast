
import React, { useState } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
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
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:30:00'),
    trend: 'rising',
    predictions: generatePredictions(1.2, 'rising')
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
    maxLevel: 2.5,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:25:00'),
    trend: 'stable',
    predictions: generatePredictions(0.8, 'stable')
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
    maxLevel: 3.2,
    status: 'warning',
    lastUpdated: new Date('2025-01-04T10:35:00'),
    trend: 'rising',
    predictions: generatePredictions(2.1, 'rising')
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
    maxLevel: 2.8,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:20:00'),
    trend: 'rising',
    predictions: generatePredictions(0.6, 'rising')
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
    maxLevel: 3.5,
    status: 'danger',
    lastUpdated: new Date('2025-01-04T10:40:00'),
    trend: 'rising',
    predictions: generatePredictions(2.8, 'rising')
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
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:15:00'),
    trend: 'falling',
    predictions: generatePredictions(1.5, 'falling')
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
    maxLevel: 2.7,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:10:00'),
    trend: 'stable',
    predictions: generatePredictions(1.1, 'stable')
  }
];

export const StreamGrid = () => {
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>(mockStreams);

  const handleVisibleStreamsChange = React.useCallback((streams: Stream[]) => {
    console.log('Visible streams updated:', streams.length, streams.map(s => s.name));
    setVisibleStreams(streams);
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <StreamMap streams={mockStreams} onVisibleStreamsChange={handleVisibleStreamsChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStreams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
};
