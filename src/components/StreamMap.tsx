
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Stream } from '@/types/stream';

interface StreamMapProps {
  streams: Stream[];
}

export const StreamMap: React.FC<StreamMapProps> = ({ streams }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [12.2725, 55.6493], // Centered on Høje-Taastrup
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'stream-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${getMarkerColor(stream.status)};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Create popup content with 7-day predictions
      const nextPrediction = stream.predictions[0];
      const maxPrediction = stream.predictions.reduce((max, pred) => 
        pred.predictedLevel > max.predictedLevel ? pred : max
      );
      
      const predictionsHtml = stream.predictions.slice(0, 3).map((pred, index) => {
        const dayName = index === 0 ? 'Tomorrow' : index === 1 ? 'Day +2' : 'Day +3';
        return `
          <div class="flex justify-between text-xs">
            <span>${dayName}:</span>
            <span>${pred.predictedLevel}m (${pred.confidence}%)</span>
          </div>
        `;
      }).join('');

      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <h3 class="font-bold text-lg mb-2">${stream.name}</h3>
          <p class="text-sm text-gray-600 mb-3">${stream.location.address}</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm font-medium">Current Level:</span>
              <span class="font-semibold">${stream.currentLevel}m</span>
            </div>
            <div class="border-t pt-2">
              <div class="text-sm font-medium mb-1">Predictions:</div>
              ${predictionsHtml}
              <div class="text-xs text-gray-500 mt-1">7-day max: ${maxPrediction.predictedLevel}m</div>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-sm">Status:</span>
              <span class="px-2 py-1 rounded text-xs ${
                stream.status === 'normal' ? 'bg-green-100 text-green-800' :
                stream.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }">${stream.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      new mapboxgl.Marker(markerElement)
        .setLngLat([stream.location.lng, stream.location.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [streams, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Stream Locations Map</h3>
        <div className="space-y-4">
          <p className="text-gray-600">To display the map, please enter your Mapbox public token:</p>
          <input
            type="text"
            placeholder="Enter your Mapbox public token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Get your token at{' '}
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Stream Locations</h3>
        <p className="text-sm text-gray-600">Click markers for 7-day predictions</p>
      </div>
      <div ref={mapContainer} className="w-full h-96" />
    </div>
  );
};
