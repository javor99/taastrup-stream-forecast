import { Stream, DailyPrediction } from '@/types/stream';
import { ApiStation, ApiPrediction } from '@/services/api';

// Mock station names based on coordinates (you can expand this mapping)
const stationNames: Record<string, string> = {
  '70000864': 'Hove å, Tostholm bro',
  '70000927': 'Hakkemosegrøften, Ole Rømers Vej',
  '70000865': 'Sengeløse å, Sengeløse mose',
  '70000926': 'Nybølle Å, Ledøje Plantage',
  '70000925': 'Spangå, Ågesholmvej',
  '70000923': 'Enghave Å, Rolandsvej 3',
  '70000924': 'Ll. Vejleå, Lille Solhøjvej 42'
};

// Convert mm to meters
function mmToMeters(mm: number): number {
  return mm / 1000;
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
  
  const totalChange = predictions.reduce((sum, pred) => sum + pred.predicted_change, 0);
  if (totalChange > 50) return 'rising';
  if (totalChange < -50) return 'falling';
  return 'stable';
}

export function transformApiDataToStreams(
  stations: ApiStation[], 
  predictions: Record<string, ApiPrediction[]>
): Stream[] {
  return stations.map(station => {
    const stationPredictions = predictions[station.station_id] || [];
    
    // Convert predictions to our format
    const transformedPredictions: DailyPrediction[] = stationPredictions.map(pred => ({
      date: new Date(pred.date),
      predictedLevel: mmToMeters(pred.predicted_level)
    }));

    // Get current level (using average from stats, converted to meters)
    const currentLevel = mmToMeters(station.water_level_stats.average);
    const maxLevel = mmToMeters(station.water_level_stats.max * 2.5); // Estimate max capacity

    return {
      id: station.station_id,
      name: stationNames[station.station_id] || `Station ${station.station_id}`,
      location: {
        lat: station.coordinates.latitude,
        lng: station.coordinates.longitude,
        address: stationNames[station.station_id]?.split(', ')[1] || 'Unknown location'
      },
      currentLevel,
      maxLevel,
      status: determineStatus(currentLevel, maxLevel),
      lastUpdated: new Date(station.updated_at),
      trend: determineTrend(stationPredictions),
      predictions: transformedPredictions
    };
  });
}