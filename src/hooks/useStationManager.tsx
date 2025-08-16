import { useState, useEffect, useCallback } from 'react';
import { Station, TrainingSession } from '@/types/station';

// Generate random Copenhagen area coordinates
const generateCopenhagenCoordinates = () => {
  const baseLat = 55.6761;
  const baseLng = 12.5683;
  const radius = 0.1; // Roughly 10km radius
  
  const lat = baseLat + (Math.random() - 0.5) * radius;
  const lng = baseLng + (Math.random() - 0.5) * radius;
  
  return { lat, lng };
};

// Generate dummy address
const generateAddress = () => {
  const streets = ['Strømgade', 'Vandvej', 'Bækgade', 'Åvej', 'Søgade', 'Elvegade'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 200) + 1;
  return `${street} ${number}, København`;
};

// Generate dummy water level data
const generateWaterData = () => {
  const maxLevel = Math.random() * 3 + 2; // 2-5 meters max
  const currentLevel = Math.random() * maxLevel;
  const levels = ['normal', 'warning', 'danger'] as const;
  const trends = ['rising', 'falling', 'stable'] as const;
  
  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (currentLevel > maxLevel * 0.8) status = 'danger';
  else if (currentLevel > maxLevel * 0.6) status = 'warning';
  
  return {
    currentLevel: Math.round(currentLevel * 100) / 100,
    maxLevel: Math.round(maxLevel * 100) / 100,
    waterLevelStatus: status,
    trend: trends[Math.floor(Math.random() * trends.length)],
  };
};

export const useStationManager = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedStations = localStorage.getItem('stations');
    const savedSessions = localStorage.getItem('trainingSessions');
    
    if (savedStations) {
      setStations(JSON.parse(savedStations));
    }
    if (savedSessions) {
      setTrainingSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('trainingSessions', JSON.stringify(trainingSessions));
  }, [trainingSessions]);

  // Poll training progress every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateTrainingProgress();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [trainingSessions]);

  const updateTrainingProgress = useCallback(() => {
    const now = new Date();
    
    setTrainingSessions(prevSessions => {
      return prevSessions.map(session => {
        const elapsed = now.getTime() - session.startTime.getTime();
        const totalDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        
        return {
          ...session,
          progress: Math.round(progress)
        };
      });
    });

    // Update station progress and complete training if ready
    setStations(prevStations => {
      return prevStations.map(station => {
        if (station.status === 'training') {
          const session = trainingSessions.find(s => s.stationId === station.id);
          if (session) {
            const elapsed = now.getTime() - session.startTime.getTime();
            const totalDuration = 5 * 60 * 1000; // 5 minutes
            const progress = Math.min(100, (elapsed / totalDuration) * 100);
            
            if (progress >= 100) {
              // Training complete - add water data and make active
              const waterData = generateWaterData();
              return {
                ...station,
                status: 'active' as const,
                trainingProgress: 100,
                trainingCompleted: now,
                lastUpdated: now,
                ...waterData
              };
            } else {
              return {
                ...station,
                trainingProgress: Math.round(progress)
              };
            }
          }
        }
        return station;
      });
    });

    // Remove completed training sessions
    setTrainingSessions(prevSessions => {
      return prevSessions.filter(session => {
        const elapsed = now.getTime() - session.startTime.getTime();
        const totalDuration = 5 * 60 * 1000;
        return (elapsed / totalDuration) * 100 < 100;
      });
    });
  }, [trainingSessions]);

  const addStation = (stationId: string) => {
    const coordinates = generateCopenhagenCoordinates();
    const now = new Date();
    const estimatedCompletion = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    
    const newStation: Station = {
      id: stationId,
      name: `Station ${stationId}`,
      location: {
        ...coordinates,
        address: generateAddress()
      },
      status: 'training',
      trainingProgress: 0,
      trainingStarted: now
    };

    const trainingSession: TrainingSession = {
      stationId,
      startTime: now,
      progress: 0,
      estimatedCompletion
    };

    setStations(prev => [...prev, newStation]);
    setTrainingSessions(prev => [...prev, trainingSession]);
    
    return newStation;
  };

  const removeStation = (stationId: string) => {
    setStations(prev => prev.filter(station => station.id !== stationId));
    setTrainingSessions(prev => prev.filter(session => session.stationId !== stationId));
  };

  const getActiveStations = () => stations.filter(station => station.status === 'active');
  const getTrainingStations = () => stations.filter(station => station.status === 'training');

  return {
    stations,
    trainingSessions,
    addStation,
    removeStation,
    getActiveStations,
    getTrainingStations,
    updateTrainingProgress
  };
};