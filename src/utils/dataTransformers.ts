import { Stream, DailyPrediction } from '@/types/stream';
import { ApiStation, ApiPrediction, ApiWaterLevel } from '@/services/api';

// Station locations based on API names
const getLocationFromName = (name: string): string => {
  const parts = name.split(', ');
  return parts.length > 1 ? parts[1] : 'Unknown location';
};

// Convert cm to meters and round to 3 decimals
function cmToMeters(cm: number): number {
  return Number((cm / 100).toFixed(3));
}

// Determine status based on current level vs max level
function determineStatus(current: number, max: number): 'normal' | 'warning' | 'danger' {
  const percentage = (current / max) * 100;
  if (percentage >= 80) return 'danger';
  if (percentage >= 60) return 'warning';
  return 'normal';
}

// Determine trend based on predictions
function determineTrend(predictions: ApiPrediction[]): 'rising' | 'falling' | 'stable' {
  if (!predictions.length) return 'stable';
  
  const totalChange = predictions.reduce((sum, pred) => sum + pred.change_from_last_cm, 0);
  if (totalChange > 5) return 'rising';
  if (totalChange < -5) return 'falling';
  return 'stable';
}

export function transformApiDataToStreams(
  stations: ApiStation[], 
  waterLevels: ApiWaterLevel[],
  predictions: ApiPrediction[]
): Stream[] {
  return stations.map(station => {
    // Find current water level for this station
    const currentWaterLevel = waterLevels.find(wl => wl.station_id === station.station_id);
    
    // Find predictions for this station
    const stationPredictions = predictions.filter(pred => pred.station_id === station.station_id);
    
    // Convert predictions to our format
    const transformedPredictions: DailyPrediction[] = stationPredictions.map(pred => ({
      date: new Date(pred.prediction_date),
      predictedLevel: Number(pred.predicted_water_level_m.toFixed(3))
    }));

    // Get current level (converted to meters and rounded)
    const currentLevel = currentWaterLevel ? Number(currentWaterLevel.water_level_m.toFixed(3)) : 0;
    const maxLevel = Number((currentLevel + 1).toFixed(3)); // Max threshold is 1m above current

    return {
      id: station.station_id,
      name: station.name,
      location: {
        lat: station.latitude,
        lng: station.longitude,
        address: getLocationFromName(station.name)
      },
      currentLevel,
      maxLevel,
      status: determineStatus(currentLevel, maxLevel),
      lastUpdated: currentWaterLevel ? new Date(currentWaterLevel.measurement_date) : new Date(),
      trend: determineTrend(stationPredictions),
      predictions: transformedPredictions
    };
  });
}