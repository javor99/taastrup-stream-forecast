
export interface DailyPrediction {
  date: Date;
  predictedLevel: number; // in meters
  confidence?: number; // percentage 0-100 (optional)
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
  minLevel: number; // in meters (5-year minimum)
  maxLevel: number; // in meters (5-year maximum / danger level)
  status: 'normal' | 'warning' | 'danger';
  lastUpdated: Date;
  trend: 'rising' | 'falling' | 'stable';
  predictions: DailyPrediction[]; // 7 days of predictions
  last30DaysRange: {
    min_cm: number;
    max_cm: number;
    min_m: number;
    max_m: number;
  };
  last30DaysHistorical: {
    date: string;
    water_level_cm: number;
    water_level_m: number;
  }[];
}
