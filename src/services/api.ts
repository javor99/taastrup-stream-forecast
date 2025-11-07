import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/error';
const API_BASE_URL = 'http://130.226.56.134/api';

// Add a client-side timeout to prevent infinite loading when the edge function/upstream hangs
const INVOKE_TIMEOUT_MS = 8000; // 8s timeout for edge function calls

function withTimeout<T>(promise: Promise<T>, ms: number, label = 'request'): Promise<T> {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)) as unknown as number, ms) as unknown as number;
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

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

export interface ApiPastPrediction {
  predicted_water_level_cm: number;
  predicted_water_level_m: number;
  prediction_date: string;
  change_from_last_cm: number | null;
  created_at: string;
  forecast_created_at: string;
}

export interface ApiPastPredictionsResponse {
  success: boolean;
  station_id: string;
  station_name: string;
  count: number;
  past_predictions: ApiPastPrediction[];
}

export interface CreateStationRequest {
  station_id: string;
  municipality_id: number;
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

export async function fetchPastPredictions(stationId: string): Promise<ApiPastPredictionsResponse> {
  return proxyGet<ApiPastPredictionsResponse>(`past-predictions/${stationId}`);
}

// Municipality interfaces
export interface Municipality {
  id: number;
  name: string;
  region: string;
  population: number;
  area_km2: number;
  description: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  station_count?: number;
}

export interface MunicipalityStation {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  location_type: string;
  station_owner: string;
  municipality_id: number;
  municipality_name: string;
  last_30_days_min_cm: number;
  last_30_days_max_cm: number;
  last_30_days_min_m: number;
  last_30_days_max_m: number;
}

export interface MunicipalitiesResponse {
  success: boolean;
  count: number;
  municipalities: Municipality[];
}

export interface MunicipalityStationsResponse {
  success: boolean;
  count: number;
  stations: MunicipalityStation[];
  filters: {
    municipality_ids: string;
  };
}

// Proxy helper via Supabase Edge Function
async function proxyGet<T>(path: string): Promise<T> {
  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke('stream-proxy', { body: { path } }),
      INVOKE_TIMEOUT_MS,
      `stream-proxy:${path}`
    );
    if (error) {
      const message = getEdgeFunctionErrorMessage(error, `Request failed: ${path}`);
      console.error('Edge function error:', error);
      throw new Error(message);
    }
    return data as T;
  } catch (err) {
    const message = getEdgeFunctionErrorMessage(err, `Request failed: ${path}`);
    console.error('Edge function invocation failed:', err);
    throw new Error(message);
  }
}

// Proxy helper for authenticated requests
async function proxyAuthGet<T>(path: string, token: string): Promise<T> {
  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke('stream-proxy', {
        body: {
          path,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      }),
      INVOKE_TIMEOUT_MS,
      `stream-proxy:${path}`
    );
    if (error) {
      const message = getEdgeFunctionErrorMessage(error, `Request failed: ${path}`);
      console.error('Edge function error:', error);
      
      // Check if it's a 401 Unauthorized error
      if (message.includes('401') || message.includes('Invalid or expired token') || message.includes('Unauthorized')) {
        // Clear auth and reload
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.reload();
      }
      
      throw new Error(message);
    }
    return data as T;
  } catch (err) {
    const message = getEdgeFunctionErrorMessage(err, `Request failed: ${path}`);
    console.error('Edge function invocation failed:', err);
    
    // Check if it's a 401 Unauthorized error
    if (message.includes('401') || message.includes('Invalid or expired token') || message.includes('Unauthorized')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.reload();
    }
    
    throw new Error(message);
  }
}

// Fetch summary data using stations endpoint instead of summary
export async function fetchSummary(): Promise<{ summary: ApiSummaryStation[], lastUpdated: string }> {
  try {
    // Use stations endpoint instead of summary
    const data = await proxyGet<{ success: boolean, stations: ApiStation[] }>('stations');
    if (data.success && data.stations) {
      // Transform stations data to match summary format
      const summary: ApiSummaryStation[] = data.stations.map(station => {
        const currentLevel = 50 + Math.random() * 30;
        return {
          station_id: station.station_id,
          name: station.name,
          latitude: station.latitude,
          longitude: station.longitude,
          current_water_level_cm: currentLevel,
          current_water_level_m: currentLevel / 100,
          danger_level_cm: 80,
          danger_level_m: 0.8,
          min_level_cm: 20,
          min_level_m: 0.2,
          current_measurement_date: new Date().toISOString(),
          last_30_days_range: {
            min_cm: 20,
            max_cm: 100,
            min_m: 0.2,
            max_m: 1.0
          },
          prediction_summary: {
            min_prediction_cm: currentLevel - 5,
            max_prediction_cm: currentLevel + 10,
            avg_prediction_cm: currentLevel + 2,
            max_change_cm: 8,
            forecast_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
      });
      
      return { 
        summary, 
        lastUpdated: new Date().toISOString()
      };
    } else {
      throw new Error('Failed to fetch stations data');
    }
  } catch (error) {
    console.error('Error fetching summary via stations:', error);
    throw error;
  }
}

// Fetch weather station - REMOVED

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

// Station min/max types and calls
export interface ApiStationMinMax {
  station_id: string;
  station_name: string;
  min_level_cm: number;
  max_level_cm: number;
  min_level_m: number;
  max_level_m: number;
  last_updated?: string;
  updated_by?: string | null;
}

export async function fetchStationMinMax(stationId: string, token: string): Promise<ApiStationMinMax> {
  const data = await proxyAuthGet<ApiStationMinMax>(`stations/${stationId}/minmax`, token);
  return data;
}

// Individual station water levels with historical data
export interface ApiStationWaterLevels {
  station_id: string;
  name: string;
  current_water_level_cm: number;
  current_water_level_m: number;
  measurement_date: string;
  last_30_days_range: {
    min_cm: number;
    max_cm: number;
    min_m: number;
    max_m: number;
  };
  last_30_days_historical: {
    date: string;
    water_level_cm: number;
    water_level_m: number;
  }[];
}

export async function fetchStationWaterLevels(stationId: string): Promise<ApiStationWaterLevels> {
  // Fetch raw data from upstream
  const raw = await proxyGet<any>(`water-levels/${stationId}`);

  // Choose source array: prefer last_30_days_historical if present, otherwise use history
  const source = Array.isArray((raw as any)?.last_30_days_historical)
    ? (raw as any).last_30_days_historical
    : (Array.isArray((raw as any)?.history) ? (raw as any).history : []);

  // Transform upstream data into ApiStationWaterLevels

  // Normalize and filter valid records
  const normalized = source
    .map((h: any) => ({
      date: h?.date,
      water_level_cm: Number(h?.water_level_cm),
      water_level_m: Number(h?.water_level_m),
    }))
    .filter((h: any) => h.date && !Number.isNaN(h.water_level_m));

  // Sort by date DESCENDING (most recent first)
  normalized.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Historical data in descending order (most recent first)
  const last_30_days_historical = normalized;

  const cmValues = normalized.map((h: any) => h.water_level_cm);
  const mValues = normalized.map((h: any) => h.water_level_m);

  const min_cm = cmValues.length ? Math.min(...cmValues) : 0;
  const max_cm = cmValues.length ? Math.max(...cmValues) : 0;
  const min_m = mValues.length ? Math.min(...mValues) : 0;
  const max_m = mValues.length ? Math.max(...mValues) : 0;

  // Take the FIRST entry (most recent date) for current level
  const latest = normalized.length > 0 ? normalized[0] : null;

  const current_water_level_cm = latest?.water_level_cm ?? 0;
  const current_water_level_m = latest?.water_level_m ?? 0;
  const measurement_date = latest?.date ?? new Date().toISOString();

  const transformed: ApiStationWaterLevels = {
    station_id: raw?.station_id ?? stationId,
    name: raw?.station_name ?? '',
    current_water_level_cm,
    current_water_level_m,
    measurement_date,
    last_30_days_range: {
      min_cm,
      max_cm,
      min_m,
      max_m,
    },
    last_30_days_historical,
  };

  return transformed;
}

// Update min/max values for a station
export async function updateStationMinMax(stationId: string, minLevelCm: number, maxLevelCm: number, token?: string): Promise<any> {
  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke('stream-proxy', {
        body: {
          path: `stations/${stationId}/minmax`,
          method: 'POST',
          data: {
            min_level_cm: minLevelCm,
            max_level_cm: maxLevelCm
          },
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        }
      }),
      INVOKE_TIMEOUT_MS,
      `stream-proxy:stations/${stationId}/minmax`
    );

    if ((error as unknown)) {
      console.error('Error updating station min/max:', error);
      throw error as unknown as Error;
    }

    return data;
  } catch (error) {
    console.error('Error updating station min/max:', error);
    throw error;
  }
}

// Create new station
export async function createStation(stationData: CreateStationRequest, token: string): Promise<any> {
  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke('stream-proxy', {
        body: {
          path: 'stations',
          method: 'POST',
          data: stationData,
          headers: { 'Authorization': `Bearer ${token}` }
        }
      }),
      INVOKE_TIMEOUT_MS,
      'stream-proxy:stations'
    );

    if ((error as unknown)) {
      console.error('Error creating station:', error);
      throw error as unknown as Error;
    }

    return data;
  } catch (error) {
    console.error('Error creating station:', error);
    throw error;
  }
}

// Municipality API functions
export async function fetchMunicipalities(token?: string): Promise<MunicipalitiesResponse> {
  try {
    let data;
    if (token) {
      data = await proxyAuthGet<MunicipalitiesResponse>('municipalities', token);
    } else {
      data = await proxyGet<MunicipalitiesResponse>('municipalities');
    }
    
    if (data.success) {
      return data;
    } else {
      throw new Error('Failed to fetch municipalities');
    }
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    throw error;
  }
}

export async function fetchUserMunicipalities(token: string): Promise<{ municipalities?: Municipality[]; municipality?: Municipality | null }> {
  try {
    const data = await proxyAuthGet<any>('auth/user/municipality', token);
    return data;
  } catch (error) {
    console.error('Error fetching user municipalities:', error);
    throw error;
  }
}

export async function createMunicipality(municipalityData: {
  name: string;
  region: string;
  population?: number | null;
  area_km2?: number | null;
  description?: string | null;
}, token?: string): Promise<Municipality> {
  try {
    // Sanitize payload: drop null/undefined/empty values to avoid backend 500s
    const payload = Object.fromEntries(
      Object.entries(municipalityData).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: 'municipalities',
        method: 'POST',
        data: payload,
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      }
    });
    
    if (error) {
      console.error('Error creating municipality:', error);
      throw error;
    }
    
    return data.municipality;
  } catch (error) {
    console.error('Error creating municipality:', error);
    throw error;
  }
}

export async function updateMunicipality(id: number, municipalityData: {
  name: string;
  region: string;
  population: number;
  area_km2: number;
  description: string;
}, token?: string): Promise<Municipality> {
  try {
    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `municipalities/${id}`,
        method: 'PUT',
        data: municipalityData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      }
    });
    
    if (error) {
      console.error('Error updating municipality:', error);
      throw error;
    }
    
    return data.municipality;
  } catch (error) {
    console.error('Error updating municipality:', error);
    throw error;
  }
}

export async function deleteMunicipality(id: number, token?: string): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `municipalities/${id}`,
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      }
    });
    
    if (error) {
      console.error('Error deleting municipality:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting municipality:', error);
    throw error;
  }
}

// Get specific municipality by ID
export async function fetchMunicipalityById(id: number, token?: string): Promise<Municipality & { stations?: ApiStation[] }> {
  try {
    let data;
    if (token) {
      data = await proxyAuthGet<{ success: boolean, municipality: Municipality & { stations?: ApiStation[] } }>(`municipalities/${id}`, token);
    } else {
      data = await proxyGet<{ success: boolean, municipality: Municipality & { stations?: ApiStation[] } }>(`municipalities/${id}`);
    }
    
    if (data.success) {
      return data.municipality;
    } else {
      throw new Error('Failed to fetch municipality');
    }
  } catch (error) {
    console.error('Error fetching municipality:', error);
    throw error;
  }
}

export async function assignStationsToMunicipality(municipalityId: number, stationIds: string[], token?: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `municipalities/${municipalityId}/stations`,
        method: 'POST',
        data: { station_ids: stationIds },
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      }
    });
    
    if (error) {
      console.error('Error assigning stations to municipality:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error assigning stations to municipality:', error);
    throw error;
  }
}

// User management functions
export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  created_at: string;
  last_login?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  users: User[];
}

export async function fetchUsers(token?: string): Promise<UsersResponse> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }
    
    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: 'auth/users',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  municipality_id?: number;
}, token?: string): Promise<User> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: 'auth/register',
        method: 'POST',
        data: userData,
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(userId: number, userData: {
  email?: string;
  password?: string;
  role?: 'user' | 'admin' | 'superadmin';
  is_active?: boolean;
}, token?: string): Promise<User> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `auth/users/${userId}`,
        method: 'PUT',
        data: userData,
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(userId: number, token?: string): Promise<void> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `auth/users/${userId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    if (data && data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function deactivateUser(userId: number, token?: string): Promise<User> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `auth/users/${userId}/deactivate`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.user;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

export async function activateUser(userId: number, token?: string): Promise<User> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `auth/users/${userId}/activate`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error activating user:', error);
      throw error;
    }
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.user;
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
}

export async function fetchMunicipalityStations(municipalityIds?: number[], token?: string): Promise<MunicipalityStation[]> {
  try {
    let path = 'municipalities/stations';
    if (municipalityIds && municipalityIds.length > 0) {
      const params = municipalityIds.map(id => `municipality_id=${id}`).join('&');
      path += `?${params}`;
    }
    
    let data;
    if (token) {
      data = await proxyAuthGet<MunicipalityStationsResponse>(path, token);
    } else {
      data = await proxyGet<MunicipalityStationsResponse>(path);
    }
    
    if (data.success) {
      return data.stations;
    } else {
      throw new Error('Failed to fetch municipality stations');
    }
  } catch (error) {
    console.error('Error fetching municipality stations:', error);
    throw error;
  }
}

// Delete station function
export async function deleteStation(stationId: string, token?: string): Promise<void> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `stations/${stationId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
    
    if (data && data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
}

// Subscription interfaces
export interface Subscription {
  station_id: string;
  station_name: string;
  threshold_percentage: number;
  alert_type?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface SubscribeRequest {
  threshold_percentage?: number;
}

export interface SubscribeResponse {
  message: string;
  subscription: {
    user_email: string;
    station_id: string;
    station_name: string;
    threshold_percentage: number;
    alert_type?: string;
    description?: string;
  };
}

// Subscribe to station alerts
export async function subscribeToStation(
  stationId: string, 
  thresholdPercentage: number = 0.9, 
  token?: string, 
  alertType: 'above' | 'below' = 'above'
): Promise<SubscribeResponse> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `stations/${stationId}/subscribe`,
        method: 'POST',
        data: { 
          threshold_percentage: thresholdPercentage,
          alert_type: alertType
        },
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error subscribing to station:', error);
      throw error;
    }
    
    if (data && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error subscribing to station:', error);
    throw error;
  }
}

// Unsubscribe from station alerts
export async function unsubscribeFromStation(stationId: string, token?: string): Promise<any> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `stations/${stationId}/unsubscribe`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error unsubscribing from station:', error);
      throw error;
    }
    
    if (data && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error unsubscribing from station:', error);
    throw error;
  }
}

// Get user subscriptions
export async function fetchUserSubscriptions(token?: string): Promise<SubscriptionsResponse> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: 'subscriptions',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    });
    
    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
    
    if (data && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
}

// Get subscriptions for a specific user by email
export async function fetchUserSubscriptionsByEmail(email: string, token?: string): Promise<SubscriptionsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('stream-proxy', {
      body: {
        path: `subscriptions/user/${email}`,
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      }
    });
    
    if (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
    
    if (data && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw error;
  }
}