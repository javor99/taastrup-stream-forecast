const API_BASE_URL = 'https://1420df023212.ngrok-free.app';

export interface ApiStation {
  station_id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  water_level_stats: {
    average: number;
    max: number;
    min: number;
  };
  data_counts: {
    prediction_records: number;
    water_level_records: number;
  };
  updated_at: string;
}

export interface ApiPrediction {
  date: string;
  predicted_level: number;
  predicted_change: number;
  created_at: string;
}

export interface ApiStationsResponse {
  success: boolean;
  count: number;
  stations: ApiStation[];
}

export interface ApiPredictionsResponse {
  success: boolean;
  station_count: number;
  predictions: Record<string, ApiPrediction[]>;
}

// Fetch all stations
export async function fetchStations(): Promise<ApiStation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stations`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const data: ApiStationsResponse = await response.json();
    
    if (data.success) {
      return data.stations;
    } else {
      throw new Error('Failed to fetch stations');
    }
  } catch (error) {
    console.error('Error fetching stations:', error);
    throw error;
  }
}

// Fetch all predictions
export async function fetchAllPredictions(): Promise<Record<string, ApiPrediction[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/predictions`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const data: ApiPredictionsResponse = await response.json();
    
    if (data.success) {
      return data.predictions;
    } else {
      throw new Error('Failed to fetch predictions');
    }
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
}