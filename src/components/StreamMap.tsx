
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

    // Add Danish stream data as WMS layer
    newMap.on('load', () => {
      // Add WMS source for Danish streams with correct layer name
      newMap.addSource('danish-streams', {
        type: 'raster',
        tiles: [
          'https://services.datafordeler.dk/GeoDanmarkVektor/GeoDanmark_60_NOHIST/1.0.0/WMS?service=WMS&version=1.3.0&request=GetMap&layers=VANDLOEBSMIDTE&bbox={bbox-epsg-3857}&width=256&height=256&crs=EPSG:3857&format=image/png&transparent=true&styles=&username=UFZLDDPIJS&password=DAIdatafordel123'
        ],
        tileSize: 256
      });

      // Add the layer with blue styling
      newMap.addLayer({
        id: 'danish-streams-layer',
        type: 'raster',
        source: 'danish-streams',
        paint: {
          'raster-opacity': 1.0
        }
      });
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
            <h3 className="text-lg font-semibold text-foreground">Danish Waterways</h3>
            <p className="text-sm text-muted-foreground">GIS data from Environmental Portal</p>
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
