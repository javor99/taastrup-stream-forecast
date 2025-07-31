
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Stream } from '@/types/stream';
import { Fullscreen, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface StreamMapProps {
  streams: Stream[];
  onVisibleStreamsChange?: (streams: Stream[]) => void;
}

export const StreamMap: React.FC<StreamMapProps> = ({ streams, onVisibleStreamsChange }) => {
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
    
    const mapStyle = theme === 'dark' 
      ? 'mapbox://styles/mapbox/outdoors-v12' 
      : 'mapbox://styles/mapbox/outdoors-v12';
    
    const newMap = new mapboxgl.Map({
      container: container,
      style: mapStyle,
      center: [12.247292, 55.678177], // Average of all stream locations
      zoom: 12,
    });

    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Function to check which streams are visible in current viewport
    const updateVisibleStreams = () => {
      console.log('updateVisibleStreams called');
      if (!onVisibleStreamsChange) {
        console.log('No onVisibleStreamsChange callback provided');
        return;
      }
      
      const bounds = newMap.getBounds();
      console.log('Map bounds:', bounds.toString());
      const visibleStreams = streams.filter(stream => {
        const isVisible = bounds.contains([stream.location.lng, stream.location.lat]);
        console.log(`Stream ${stream.name} at [${stream.location.lng}, ${stream.location.lat}] is visible:`, isVisible);
        return isVisible;
      });
      console.log('Calling onVisibleStreamsChange with', visibleStreams.length, 'streams');
      onVisibleStreamsChange(visibleStreams);
    };

    // Update visible streams on map events
    newMap.on('moveend', () => {
      console.log('Map moveend event fired');
      updateVisibleStreams();
    });
    newMap.on('zoomend', () => {
      console.log('Map zoomend event fired');
      updateVisibleStreams();
    });
    newMap.on('sourcedata', () => {
      console.log('Map sourcedata event fired');
      updateVisibleStreams();
    });
    
    // Initial check for visible streams when map is ready
    newMap.on('idle', () => {
      console.log('Map idle event fired');
      updateVisibleStreams();
    });

    // Add markers for each stream
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

      new mapboxgl.Marker(markerElement)
        .setLngLat([stream.location.lng, stream.location.lat])
        .setPopup(popup)
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
  }, [streams, mapboxToken, theme, onVisibleStreamsChange]);

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
  }, [isFullscreen, streams, mapboxToken, theme, onVisibleStreamsChange]);

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
