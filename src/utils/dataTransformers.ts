import { Stream, DailyPrediction } from '@/types/stream';
import { ApiSummaryStation } from '@/services/api';

// Station locations based on API names
const getLocationFromName = (name: string): string => {
  const parts = name.split(', ');
  return parts.length > 1 ? parts[1] : 'Unknown location';
};

// Convert cm to meters and round to 3 decimals
function cmToMeters(cm: number): number {
  return Number((cm / 100).toFixed(3));
}

// Determine status based on current level within the min-max range
function determineStatus(current: number, min: number, max: number): 'normal' | 'warning' | 'danger' {
  const range = max - min;
  const position = current - min;
  const percentage = (position / range) * 100;
  
  if (percentage >= 85) return 'danger';   // Near 5-year maximum
  if (percentage >= 65) return 'warning';  // Upper portion of range
  return 'normal';                         // Lower portion of range
}

// Generate 7-day predictions from summary data
function generatePredictionsFromSummary(station: ApiSummaryStation): DailyPrediction[] {
  const predictions: DailyPrediction[] = [];
  const { min_prediction_cm, max_prediction_cm, avg_prediction_cm } = station.prediction_summary;
  
  // Generate 7 days of predictions with some variation
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i + 1); // Start from tomorrow
    
    // Create realistic variation between min and max
    const variation = (i / 6) * (max_prediction_cm - min_prediction_cm); // Linear progression
    const predicted_cm = min_prediction_cm + variation;
    const predicted_m = Number((predicted_cm / 100).toFixed(3));
    
    predictions.push({
      date,
      predictedLevel: predicted_m
    });
  }
  
  return predictions;
}

// Determine trend based on prediction summary vs current level
function determineTrendFromSummary(station: ApiSummaryStation): 'rising' | 'falling' | 'stable' {
  const current_m = station.current_water_level_m;
  const avg_prediction_m = station.prediction_summary.avg_prediction_cm / 100; // Convert to meters
  const change_m = avg_prediction_m - current_m;
  
  // Use smaller thresholds for more sensitive trend detection
  if (change_m > 0.1) return 'rising';     // Rising if avg prediction is 10cm+ higher
  if (change_m < -0.1) return 'falling';   // Falling if avg prediction is 10cm+ lower
  return 'stable';                         // Stable if change is within ±10cm
}

export function transformApiDataToStreams(
  summaryStations: ApiSummaryStation[]
): Stream[] {
  return summaryStations.map(station => {
    // Generate predictions from summary data
    const transformedPredictions = generatePredictionsFromSummary(station);

    // Get current level, min level, and danger level (already in meters from summary)
    const currentLevel = Number(station.current_water_level_m.toFixed(3));
    const minLevel = Number(station.min_level_m.toFixed(3));
    const maxLevel = Number(station.danger_level_m.toFixed(3));

    return {
      id: station.station_id,
      name: station.name,
      location: {
        lat: station.latitude,
        lng: station.longitude,
        address: getLocationFromName(station.name)
      },
      currentLevel,
      minLevel,
      maxLevel,
      status: determineStatus(currentLevel, minLevel, maxLevel),
      lastUpdated: new Date(station.current_measurement_date),
      trend: determineTrendFromSummary(station),
      predictions: transformedPredictions
    };
  });
}