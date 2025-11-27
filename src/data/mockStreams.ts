// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2025 Your Name
// Part of AquaMonitor/InnoTech-TaskForce. See LICENSE for license terms.

import { Stream } from '@/types/stream';

// Generate 7-day predictions for a stream
const generatePredictions = (baseLevel: number, trend: 'rising' | 'falling' | 'stable') => {
  const predictions = [];
  let currentLevel = baseLevel;
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Apply trend with some randomness
    if (trend === 'rising') {
      currentLevel += Math.random() * 0.3 + 0.1;
    } else if (trend === 'falling') {
      currentLevel -= Math.random() * 0.2 + 0.05;
    } else {
      currentLevel += (Math.random() - 0.5) * 0.1;
    }
    
    // Ensure level doesn't go below 0
    currentLevel = Math.max(0, currentLevel);
    
    predictions.push({
      date,
      predictedLevel: Math.round(currentLevel * 10) / 10,
      confidence: Math.floor(Math.random() * 20) + 75 // 75-95% confidence
    });
  }
  
  return predictions;
};

// Generate 30 days of historical data
const generate30DaysHistorical = (baseLevel: number) => {
  const historical = [];
  let currentLevel = baseLevel;
  
  for (let i = 30; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variation to the level
    currentLevel += (Math.random() - 0.5) * 0.2;
    currentLevel = Math.max(0, currentLevel);
    
    const levelCm = Math.round(currentLevel * 100 * 10) / 10;
    const levelM = Math.round(currentLevel * 100) / 100;
    
    historical.push({
      date: date.toISOString().split('T')[0],
      water_level_cm: levelCm,
      water_level_m: levelM
    });
  }
  
  return historical;
};

// Calculate range from historical data
const calculateRange = (historical: any[]) => {
  const levels = historical.map(h => h.water_level_cm);
  return {
    min_cm: Math.min(...levels),
    max_cm: Math.max(...levels),
    min_m: Math.min(...levels) / 100,
    max_m: Math.max(...levels) / 100
  };
};

// Dummy weather station data
const dummyWeatherStation = {
  weather_station_id: "copenhagen_meteorological",
  weather_station_name: "Copenhagen Meteorological Station",
  weather_station_latitude: 55.681,
  weather_station_longitude: 12.285095,
  weather_station_elevation: 19,
  weather_data_source: "Open-Meteo API",
  weather_model: "DMI HARMONIE AROME",
  weather_coverage: "All water level stations use weather data from this single Copenhagen location",
  weather_update_frequency: "Every 3 hours",
  weather_forecast_length: "Up to 10 days",
  weather_timezone: "Europe/Copenhagen",
  weather_timezone_abbreviation: "GMT+2",
  weather_api_url: "https://api.open-meteo.com/v1/forecast"
};

// Generate mock streams with proper historical data
const generateMockStream = (id: string, name: string, lat: number, lng: number, address: string, currentLevel: number, minLevel: number, maxLevel: number, status: 'normal' | 'warning' | 'danger', trend: 'rising' | 'falling' | 'stable') => {
  const historical = generate30DaysHistorical(currentLevel);
  const range = calculateRange(historical);
  
  return {
    id,
    name,
    location: { lat, lng, address },
    currentLevel,
    minLevel,
    maxLevel,
    status,
    lastUpdated: new Date('2025-01-04T10:30:00'),
    trend,
    predictions: generatePredictions(currentLevel, trend),
    last30DaysRange: range,
    last30DaysHistorical: historical,
  };
};

// Mock streams for fallback when API fails
export const mockStreams: Stream[] = [
  generateMockStream('70000864', 'Hove å, Tostholm bro', 55.680989, 12.219433, 'Tostholm bro', 1.2, 0.5, 3.0, 'normal', 'rising'),
  generateMockStream('70000927', 'Hakkemosegrøften, Ole Rømers Vej', 55.681673, 12.281167, 'Ole Rømers Vej', 0.8, 0.3, 2.5, 'normal', 'stable'),
  generateMockStream('70000865', 'Sengeløse å, Sengeløse mose', 55.689824, 12.267812, 'Sengeløse mose', 2.1, 1.0, 3.2, 'warning', 'rising'),
  generateMockStream('70000926', 'Nybølle Å, Ledøje Plantage', 55.693957, 12.309862, 'Ledøje Plantage', 0.6, 0.2, 2.8, 'normal', 'rising'),
  generateMockStream('70000925', 'Spangå, Ågesholmvej', 55.676561, 12.239100, 'Ågesholmvej', 2.8, 1.5, 3.5, 'danger', 'rising'),
  generateMockStream('70000923', 'Enghave Å, Rolandsvej 3', 55.687870, 12.201108, 'Rolandsvej 3', 1.5, 0.8, 3.0, 'normal', 'falling'),
  generateMockStream('70000924', 'Ll. Vejleå, Lille Solhøjvej 42', 55.636369, 12.212559, 'Lille Solhøjvej 42', 1.1, 0.4, 2.7, 'normal', 'stable'),
];

// Mock API data with weather station info
export const mockApiData = mockStreams.map(stream => ({
  station_id: stream.id,
  name: stream.name,
  latitude: stream.location.lat,
  longitude: stream.location.lng,
  current_water_level_cm: stream.currentLevel * 100,
  current_water_level_m: stream.currentLevel,
  current_measurement_date: "2025-09-12",
  danger_level_cm: stream.maxLevel * 100,
  danger_level_m: stream.maxLevel,
  min_level_cm: stream.minLevel * 100,
  min_level_m: stream.minLevel,
  last_30_days_range: stream.last30DaysRange,
  last_30_days_historical: stream.last30DaysHistorical,
  prediction_summary: {
    min_prediction_cm: stream.currentLevel * 100 - 5,
    max_prediction_cm: stream.currentLevel * 100 + 5,
    avg_prediction_cm: stream.currentLevel * 100,
    max_change_cm: 10,
    forecast_date: "2025-09-14 17:59:56"
  },
  weather_station_info: dummyWeatherStation
}));