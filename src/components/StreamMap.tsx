
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Stream } from '@/types/stream';
import { Fullscreen, X } from 'lucide-react';

interface StreamMapProps {
  streams: Stream[];
}

export const StreamMap: React.FC<StreamMapProps> = ({ streams }) => {
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
    
    const newMap = new mapboxgl.Map({
      container: container,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [12.2725, 55.6493],
      zoom: 12,
    });

    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${getMarkerColor(stream.status)};
        border: 3px solid white;
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

      const popupContent = `
        <div style="padding: 12px; min-width: 200px; max-width: 220px; position: relative;">
          <button style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer; color: #666; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onclick="this.closest('.mapboxgl-popup').remove()">×</button>
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; margin-top: 0; padding-right: 30px;">${stream.name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 12px; margin-top: 0;">${stream.location.address}</p>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 500;">Current:</span>
              <span style="font-weight: 600;">${stream.currentLevel}m</span>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">Next 3 Days:</div>
            ${predictionsHtml}
            <div style="font-size: 11px; color: #666; margin-top: 4px;">7-day max: ${maxPrediction.predictedLevel}m</div>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <span style="font-size: 12px;">Status:</span>
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
        closeOnClick: false
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
  }, [streams, mapboxToken]);

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
  }, [isFullscreen, streams, mapboxToken]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };


  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Stream Locations</h3>
            <p className="text-sm text-gray-600">Click markers for predictions</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Fullscreen className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div ref={mapContainer} className="w-full h-96" />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Stream Locations - Fullscreen</h3>
                <p className="text-sm text-gray-600">Click markers for detailed predictions</p>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exit Fullscreen"
              >
                <X className="h-5 w-5 text-gray-600" />
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
