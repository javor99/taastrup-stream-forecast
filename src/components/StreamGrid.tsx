
import React from 'react';
import { StreamCard } from './StreamCard';
import { Stream } from '@/types/stream';

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
    predictedLevel: 1.8,
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:30:00'),
    trend: 'rising'
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
    predictedLevel: 1.1,
    maxLevel: 2.5,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:25:00'),
    trend: 'stable'
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
    predictedLevel: 2.7,
    maxLevel: 3.2,
    status: 'warning',
    lastUpdated: new Date('2025-01-04T10:35:00'),
    trend: 'rising'
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
    predictedLevel: 0.9,
    maxLevel: 2.8,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:20:00'),
    trend: 'rising'
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
    predictedLevel: 3.1,
    maxLevel: 3.5,
    status: 'danger',
    lastUpdated: new Date('2025-01-04T10:40:00'),
    trend: 'rising'
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
    predictedLevel: 1.3,
    maxLevel: 3.0,
    status: 'normal',
    lastUpdated: new Date('2025-01-04T10:15:00'),
    trend: 'falling'
  }
];

export const StreamGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockStreams.map((stream) => (
        <StreamCard key={stream.id} stream={stream} />
      ))}
    </div>
  );
};
