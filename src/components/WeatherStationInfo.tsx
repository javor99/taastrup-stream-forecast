import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Cloud, Clock, Thermometer, Gauge, Calendar } from 'lucide-react';
import { fetchWeatherStation, WeatherStationInfo as WeatherStationData } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const WeatherStationInfo: React.FC = () => {
  const [weatherInfo, setWeatherInfo] = useState<WeatherStationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherInfo = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherStation();
        setWeatherInfo(data);
      } catch (error) {
        console.error('Error fetching weather info:', error);
        setError('Failed to load weather station information');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherInfo();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Cloud className="mx-auto h-8 w-8 mb-2" />
            <p>{error || 'Weather station information unavailable'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather Station Information
        </CardTitle>
        <CardDescription>
          Meteorological data source for all water level monitoring stations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Station Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Station Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{weatherInfo.weather_station_name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>ID: {weatherInfo.weather_station_id}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span>{weatherInfo.weather_station_latitude}°N, {weatherInfo.weather_station_longitude}°E</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span>Elevation: {weatherInfo.weather_station_elevation}m</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Data Source
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{weatherInfo.weather_data_source}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Model: {weatherInfo.weather_model}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{weatherInfo.weather_update_frequency}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{weatherInfo.weather_forecast_length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Coverage
          </h4>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">{weatherInfo.weather_coverage}</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Features
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              High Precision Model
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              3-Hour Updates
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              10-Day Forecasts
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {weatherInfo.weather_timezone_abbreviation}
            </Badge>
          </div>
        </div>

        {/* API Information */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            API Details
          </h4>
          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <div>Source: <code className="bg-muted px-1 rounded">{weatherInfo.weather_api_url}</code></div>
            <div>Timezone: {weatherInfo.weather_timezone} ({weatherInfo.weather_timezone_abbreviation})</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherStationInfo;