import { supabase } from '@/integrations/supabase/client';
const API_BASE_URL = 'https://8abd0c42d63c.ngrok-free.app';

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

export interface ApiSummaryStation {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  current_water_level_cm: number;
  current_water_level_m: number;
  danger_level_cm: number;
  danger_level_m: number;
  min_level_cm: number;
  min_level_m: number;
  current_measurement_date: string;
  last_30_days_range: {
    min_cm: number;
    max_cm: number;
    min_m: number;
    max_m: number;
  };
  last_30_days_historical?: {
    date: string;
    water_level_cm: number;
    water_level_m: number;
  }[];
  prediction_summary: {
    min_prediction_cm: number;
    max_prediction_cm: number;
    avg_prediction_cm: number;
    max_change_cm: number;
    forecast_date: string;
  };
}

export interface ApiSummaryResponse {
  success: boolean;
  forecast_date: string;
  last_updated: string;
  count: number;
  summary: ApiSummaryStation[];
}

export interface ApiPredictionsResponse {
  success: boolean;
  forecast_date: string;
  count: number;
  predictions: ApiPrediction[];
}

// Proxy helper via Supabase Edge Function
async function proxyGet<T>(path: 'stations' | 'water-levels' | 'predictions' | 'summary'): Promise<T> {
  const { data, error } = await supabase.functions.invoke('stream-proxy', {
    body: { path }
  });
  if (error) {
    console.error('Edge function error:', error);
    throw error;
  }
  return data as T;
}

// Fetch summary data (preferred method - includes stations + current levels)
export async function fetchSummary(): Promise<{ summary: ApiSummaryStation[], lastUpdated: string }> {
  try {
    const data = await proxyGet<ApiSummaryResponse>('summary');
    if (data.success) {
      return { 
        summary: data.summary, 
        lastUpdated: data.last_updated 
      };
    } else {
      throw new Error('Failed to fetch summary');
    }
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}

// Fetch all stations
export async function fetchStations(): Promise<ApiStation[]> {
  try {
    const data = await proxyGet<ApiStationsResponse>('stations');
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
    const data = await proxyGet<ApiWaterLevelsResponse>('water-levels');
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
    const data = await proxyGet<ApiPredictionsResponse>('predictions');
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