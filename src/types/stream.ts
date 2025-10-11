
export interface DailyPrediction {
  date: Date;
  predictedLevel: number; // in meters
  confidence?: number; // percentage 0-100 (optional)
}

export interface PastPrediction {
  predicted_water_level_m: number;
  predicted_water_level_cm: number;
  prediction_date: string;
  created_at: string;
  forecast_created_at: string;
  change_from_last_cm: number | null;
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
  pastPredictions?: PastPrediction[];
}
