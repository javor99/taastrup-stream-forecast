export interface Station {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'training' | 'active' | 'inactive';
  trainingProgress: number; // 0-100
  trainingStarted?: Date;
  trainingCompleted?: Date;
  currentLevel?: number;
  maxLevel?: number;
  waterLevelStatus?: 'normal' | 'warning' | 'danger';
  lastUpdated?: Date;
  trend?: 'rising' | 'falling' | 'stable';
}

export interface TrainingSession {
  stationId: string;
  startTime: Date;
  progress: number;
  estimatedCompletion: Date;
}