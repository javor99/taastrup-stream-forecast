const API_BASE_URL = 'https://e1fc0f1f3c1c.ngrok-free.app';

export interface ApiStation {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  location_type: string;
  station_owner: string;
}

export interface ApiWaterLevel {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  measurement_date: string;
  water_level_cm: number;
  water_level_m: number;
}

export interface ApiPrediction {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  prediction_date: string;
  predicted_water_level_cm: number;
  predicted_water_level_m: number;
  change_from_last_cm: number;
  forecast_date: string;
}

export interface ApiStationsResponse {
  success: boolean;
  count: number;
  stations: ApiStation[];
}

export interface ApiWaterLevelsResponse {
  success: boolean;
  count: number;
  water_levels: ApiWaterLevel[];
}

export interface ApiPredictionsResponse {
  success: boolean;
  forecast_date: string;
  count: number;
  predictions: ApiPrediction[];
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

// Fetch water levels
export async function fetchWaterLevels(): Promise<ApiWaterLevel[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/water-levels`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const data: ApiWaterLevelsResponse = await response.json();
    
    if (data.success) {
      return data.water_levels;
    } else {
      throw new Error('Failed to fetch water levels');
    }
  } catch (error) {
    console.error('Error fetching water levels:', error);
    throw error;
  }
}

// Fetch all predictions
export async function fetchAllPredictions(): Promise<ApiPrediction[]> {
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