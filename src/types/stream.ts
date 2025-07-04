
export interface Stream {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  currentLevel: number; // in meters
  predictedLevel: number; // in meters
  maxLevel: number; // in meters
  status: 'normal' | 'warning' | 'danger';
  lastUpdated: Date;
  trend: 'rising' | 'falling' | 'stable';
}
