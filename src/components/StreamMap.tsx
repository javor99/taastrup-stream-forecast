
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Stream } from '@/types/stream';
import { ApiSummaryStation, MunicipalityStation } from '@/services/api';
import { Fullscreen, X, Cloud } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface WeatherStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  data_source: string;
  model: string;
  coverage: string;
  update_frequency: string;
  forecast_length: string;
  timezone: string;
  timezone_abbreviation: string;
  api_url: string;
}

interface StreamMapProps {
  streams: Stream[];
  apiData?: ApiSummaryStation[];
  municipalityData?: MunicipalityStation[];
  onVisibleStreamsChange?: (streams: Stream[]) => void;
}

export const StreamMap: React.FC<StreamMapProps> = ({ streams, apiData, municipalityData, onVisibleStreamsChange }) => {
  const { theme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const fullscreenMapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const fullscreenMap = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken] = useState('pk.eyJ1IjoiamF2b3I5OSIsImEiOiJjbWNwNG1nOHowMnNjMmpzM3RjbXY5aTcwIn0.dRpur8lSFnUtR9JHaJ-N2Q');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getWeekdayName = (dayOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset + 1);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const createMap = (container: HTMLDivElement) => {
    mapboxgl.accessToken = mapboxToken;
    
    const mapStyle = 'mapbox://styles/javor99/cmdzty06m00vk01qs18v31qz0';
    
    const newMap = new mapboxgl.Map({
      container: container,
      style: mapStyle,
      center: [12.247292, 55.678177], // Average of all stream locations
      zoom: 12,
    });

    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Function to check which streams are visible in current viewport
    const updateVisibleStreams = () => {
      if (!onVisibleStreamsChange) return;
      
      const bounds = newMap.getBounds();
      const visibleStreams = streams.filter(stream => {
        return bounds.contains([stream.location.lng, stream.location.lat]);
      });
      onVisibleStreamsChange(visibleStreams);
    };

    // Update visible streams on map events
    newMap.on('moveend', updateVisibleStreams);
    newMap.on('zoomend', updateVisibleStreams);
    newMap.on('sourcedata', updateVisibleStreams);
    newMap.on('idle', updateVisibleStreams);

    // Extract unique weather stations from API data
    const weatherStations: WeatherStation[] = [];
    const dataSource = municipalityData || apiData;
    if (dataSource) {
      const seenCoordinates = new Set<string>();
      
      dataSource.forEach(station => {
        if (station.weather_station_info) {
          const coordKey = `${station.weather_station_info.weather_station_latitude},${station.weather_station_info.weather_station_longitude}`;
          
          if (!seenCoordinates.has(coordKey)) {
            seenCoordinates.add(coordKey);
            weatherStations.push({
              id: station.weather_station_info.weather_station_id,
              name: station.weather_station_info.weather_station_name,
              latitude: station.weather_station_info.weather_station_latitude,
              longitude: station.weather_station_info.weather_station_longitude,
              elevation: station.weather_station_info.weather_station_elevation,
              data_source: station.weather_station_info.weather_data_source,
              model: station.weather_station_info.weather_model,
              coverage: station.weather_station_info.weather_coverage,
              update_frequency: station.weather_station_info.weather_update_frequency,
              forecast_length: station.weather_station_info.weather_forecast_length,
              timezone: station.weather_station_info.weather_timezone,
              timezone_abbreviation: station.weather_station_info.weather_timezone_abbreviation,
              api_url: station.weather_station_info.weather_api_url
            });
          }
        }
      });
    }

    // Add markers for each stream
    console.log('StreamMap: Creating markers for', streams.length, 'streams');
    console.log('Stream IDs in map:', streams.map(s => s.id));
    streams.forEach((stream) => {
      const getMarkerColor = (status: string) => {
        switch (status) {
          case 'normal': return '#22c55e';
          case 'warning': return '#f59e0b';
          case 'danger': return '#ef4444';
          default: return '#6b7280';
        }
      };

      const markerElement = document.createElement('div');
      const borderColor = theme === 'dark' ? '#374151' : 'white';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${getMarkerColor(stream.status)};
        border: 3px solid ${borderColor};
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const nextPrediction = stream.predictions[0];
      const maxPrediction = stream.predictions.reduce((max, pred) => 
        pred.predictedLevel > max.predictedLevel ? pred : max
      );
      
      const predictionsHtml = stream.predictions.slice(0, 3).map((pred, index) => {
        const dayName = getWeekdayName(index);
        return `
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
            <span>${dayName}:</span>
            <span>${pred.predictedLevel}m</span>
          </div>
        `;
      }).join('');

      const popupBg = theme === 'dark' ? '#1f2937' : '#ffffff';
      const popupTextColor = theme === 'dark' ? '#f9fafb' : '#000000';
      const popupTextSecondary = theme === 'dark' ? '#9ca3af' : '#666666';
      const popupBorder = theme === 'dark' ? '#374151' : '#e5e7eb';

      const popupContent = `
        <div style="padding: 12px; min-width: 200px; max-width: 220px; position: relative; background-color: ${popupBg}; color: ${popupTextColor}; border-radius: 8px;">
          <button style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer; color: ${popupTextSecondary}; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="this.closest('.mapboxgl-popup').remove()">×</button>
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; margin-top: 0; padding-right: 30px; color: ${popupTextColor};">${stream.name}</h3>
          <p style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 12px; margin-top: 0;">${stream.location.address}</p>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 500; color: ${popupTextColor};">Current:</span>
              <span style="font-weight: 600; color: ${popupTextColor};">${stream.currentLevel}m</span>
            </div>
          </div>
          <div style="border-top: 1px solid ${popupBorder}; padding-top: 8px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px; color: ${popupTextColor};">Next 3 Days:</div>
            ${predictionsHtml.replace(/color: #666/g, `color: ${popupTextSecondary}`)}
            <div style="font-size: 11px; color: ${popupTextSecondary}; margin-top: 4px;">7-day max: ${maxPrediction.predictedLevel}m</div>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid ${popupBorder}; padding-top: 8px;">
            <span style="font-size: 12px; color: ${popupTextColor};">Status:</span>
            <span style="padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500; ${
              stream.status === 'normal' ? 'background-color: #dcfce7; color: #166534;' :
              stream.status === 'warning' ? 'background-color: #fef3c7; color: #92400e;' :
              'background-color: #fecaca; color: #991b1b;'
            }">${stream.status.toUpperCase()}</span>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        maxWidth: '220px',
        closeButton: false,
        closeOnClick: false,
        className: 'custom-popup'
      }).setHTML(popupContent);

      // Check for duplicate coordinates and add slight offset
      const existingMarkers = streams.slice(0, streams.indexOf(stream));
      let adjustedLng = stream.location.lng;
      let adjustedLat = stream.location.lat;
      
      existingMarkers.forEach(existingStream => {
        if (Math.abs(existingStream.location.lng - stream.location.lng) < 0.0001 && 
            Math.abs(existingStream.location.lat - stream.location.lat) < 0.0001) {
          // Add small random offset to prevent overlapping markers
          adjustedLng += (Math.random() - 0.5) * 0.001;
          adjustedLat += (Math.random() - 0.5) * 0.001;
        }
      });

      new mapboxgl.Marker(markerElement)
        .setLngLat([adjustedLng, adjustedLat])
        .setPopup(popup)
        .addTo(newMap);
    });

    // Add weather station markers
    weatherStations.forEach((weatherStation) => {
      const weatherMarkerElement = document.createElement('div');
      weatherMarkerElement.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        </svg>
      `;
      weatherMarkerElement.style.cssText = `
        width: 24px;
        height: 24px;
        cursor: pointer;
        background: white;
        border-radius: 50%;
        padding: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const popupBg = theme === 'dark' ? '#1f2937' : '#ffffff';
      const popupTextColor = theme === 'dark' ? '#f9fafb' : '#000000';
      const popupTextSecondary = theme === 'dark' ? '#9ca3af' : '#666666';
      const popupBorder = theme === 'dark' ? '#374151' : '#e5e7eb';

      const weatherPopupContent = `
        <div style="padding: 12px; min-width: 250px; max-width: 280px; position: relative; background-color: ${popupBg}; color: ${popupTextColor}; border-radius: 8px;">
          <button style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer; color: ${popupTextSecondary}; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="this.closest('.mapboxgl-popup').remove()">×</button>
          <div style="display: flex; align-items: center; margin-bottom: 8px; padding-right: 30px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
            <h3 style="font-weight: bold; font-size: 16px; margin: 0; color: ${popupTextColor};">Weather Station</h3>
          </div>
          <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 8px; margin-top: 0; color: ${popupTextColor};">${weatherStation.name}</h4>
          <div style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 12px;">
            ID: ${weatherStation.id}<br>
            Coordinates: ${weatherStation.latitude.toFixed(3)}, ${weatherStation.longitude.toFixed(3)}<br>
            Elevation: ${weatherStation.elevation}m
          </div>
          <div style="border-top: 1px solid ${popupBorder}; padding-top: 8px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${popupTextColor};">Data Source:</div>
            <div style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 4px;">Source: ${weatherStation.data_source}</div>
            <div style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 4px;">Model: ${weatherStation.model}</div>
            <div style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 4px;">Timezone: ${weatherStation.timezone} (${weatherStation.timezone_abbreviation})</div>
          </div>
          <div style="border-top: 1px solid ${popupBorder}; padding-top: 8px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 6px; color: ${popupTextColor};">Coverage & Updates:</div>
            <div style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 4px;">Coverage: ${weatherStation.coverage}</div>
            <div style="font-size: 12px; color: ${popupTextSecondary}; margin-bottom: 4px;">Update Frequency: ${weatherStation.update_frequency}</div>
            <div style="font-size: 12px; color: ${popupTextSecondary};">Forecast Length: ${weatherStation.forecast_length}</div>
          </div>
        </div>
      `;

      const weatherPopup = new mapboxgl.Popup({ 
        offset: 25,
        maxWidth: '280px',
        closeButton: false,
        closeOnClick: false,
        className: 'custom-popup weather-popup'
      }).setHTML(weatherPopupContent);

      new mapboxgl.Marker(weatherMarkerElement)
        .setLngLat([weatherStation.longitude, weatherStation.latitude])
        .setPopup(weatherPopup)
        .addTo(newMap);
    });

    return newMap;
  };

  // Main map effect
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    map.current = createMap(mapContainer.current);

    return () => {
      map.current?.remove();
    };
  }, [streams, apiData, municipalityData, mapboxToken, theme, onVisibleStreamsChange]);

  // Fullscreen map effect
  useEffect(() => {
    if (isFullscreen && fullscreenMapContainer.current && mapboxToken) {
      fullscreenMap.current = createMap(fullscreenMapContainer.current);
    }

    return () => {
      if (fullscreenMap.current) {
        fullscreenMap.current.remove();
        fullscreenMap.current = null;
      }
    };
  }, [isFullscreen, streams, apiData, municipalityData, mapboxToken, theme, onVisibleStreamsChange]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  return (
    <>
      <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-border/50">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Stream Locations</h3>
            <p className="text-sm text-muted-foreground">Click markers for predictions</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Fullscreen className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div ref={mapContainer} className="w-full h-96" />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-full overflow-hidden border border-border/50">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Stream Locations - Fullscreen</h3>
                <p className="text-sm text-muted-foreground">Click markers for detailed predictions</p>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                title="Exit Fullscreen"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div 
              ref={fullscreenMapContainer}
              className="w-full h-full"
              style={{ height: 'calc(100% - 80px)' }}
            />
          </div>
        </div>
      )}
    </>
  );
};
