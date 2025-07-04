
export interface DailyPrediction {
  date: Date;
  predictedLevel: number; // in meters
  confidence: number; // percentage 0-100
}

export interface Stream {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  currentLevel: number; // in meters
  maxLevel: number; // in meters
  status: 'normal' | 'warning' | 'danger';
  lastUpdated: Date;
  trend: 'rising' | 'falling' | 'stable';
  predictions: DailyPrediction[]; // 7 days of predictions
}
