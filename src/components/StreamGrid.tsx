
import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { MunicipalityFilter } from './MunicipalityFilter';
import { Stream } from '@/types/stream';
import { fetchStations, fetchWaterLevels, fetchAllPredictions, fetchMunicipalityStations, fetchStationMinMax, fetchStationWaterLevels, fetchPastPredictions, ApiSummaryStation, MunicipalityStation } from '@/services/api';
// Removed unused import - now using same processing logic for both all stations and municipalities
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { mockStreams, mockApiData } from '@/data/mockStreams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEdgeFunctionErrorMessage } from '@/utils/error';

interface StreamGridProps {
  userMunicipalityId?: number | null;
}

export const StreamGrid: React.FC<StreamGridProps> = ({ userMunicipalityId }) => {
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);
  const [apiData, setApiData] = useState<ApiSummaryStation[]>([]);
  const [municipalityData, setMunicipalityData] = useState<MunicipalityStation[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'municipalities'>('all');
  const { toast } = useToast();
  const { isAuthenticated, getToken, isAdmin, isSuperAdmin } = useAuth();

  // Initialize view mode and selected municipalities when userMunicipalityId is provided
  // Only for regular admins, not superadmins
  useEffect(() => {
    if (userMunicipalityId && !isSuperAdmin) {
      setViewMode('municipalities');
      if (selectedMunicipalities.length === 0) {
        setSelectedMunicipalities([userMunicipalityId]);
      }
    }
  }, [userMunicipalityId, isSuperAdmin]);

  // Reset to 'all' view when superadmin logs in
  useEffect(() => {
    if (isSuperAdmin) {
      setViewMode('all');
      setSelectedMunicipalities([]);
    }
  }, [isSuperAdmin]);

  const loadStreams = async () => {
    try {
      setIsLoading(true);
      setUsingDummyData(false);
      setApiError(null);
      // Clear any existing data to prevent mock data interference
      setAllStreams([]);
      setVisibleStreams([]);
      setApiData([]);
      
      if (viewMode === 'municipalities' && selectedMunicipalities.length > 0) {
        // Load municipality-specific stations using SAME logic as all stations
        const token = getToken();
        const municipalityStations = await fetchMunicipalityStations(selectedMunicipalities, token || undefined);
        
        // Extract station data from municipality response
        const stations = municipalityStations.map(ms => ({
          station_id: ms.station_id,
          name: ms.name,
          latitude: ms.latitude,
          longitude: ms.longitude,
          location_type: ms.location_type,
          station_owner: ms.station_owner
        }));
        
        // Use EXACT same processing as all stations path
        const [waterLevels, predictions] = await Promise.all([
          fetchWaterLevels(),
          fetchAllPredictions(),
        ]);

        // Build lookup maps
        const wlMap = new Map(waterLevels.map(wl => [wl.station_id, wl]));
        const muniMap = new Map(municipalityStations.map(ms => [ms.station_id, ms]));

        // Fetch detailed historical data and past predictions for each station
        const stationHistoricalData = new Map();
        const stationPastPredictions = new Map();
        const historicalPromises = stations.map(s => 
          fetchStationWaterLevels(s.station_id).catch(() => null)
        );
        const pastPredictionPromises = stations.map(s =>
          fetchPastPredictions(s.station_id).catch(() => null)
        );
        const [historicalResults, pastPredictionResults] = await Promise.all([
          Promise.all(historicalPromises),
          Promise.all(pastPredictionPromises)
        ]);
        historicalResults.forEach((data, index) => {
          if (data) {
            stationHistoricalData.set(stations[index].station_id, data);
          }
        });
        pastPredictionResults.forEach((data, index) => {
          if (data?.success && data.past_predictions) {
            stationPastPredictions.set(stations[index].station_id, data.past_predictions);
          }
        });

        // Fetch admin-configured min/max thresholds (same as all stations)
        const minmaxMap = new Map<string, { min_m: number; max_m: number }>();
        const minmaxResults = await Promise.all(
          stations.map(s => fetchStationMinMax(s.station_id, token || '').catch(() => null))
        );
        minmaxResults.forEach(res => {
          if (res) {
            minmaxMap.set(res.station_id, { min_m: res.min_level_m, max_m: res.max_level_m });
          }
        });

        // IDENTICAL processing logic as all stations
        const transformedStreams: Stream[] = stations.map((station) => {
          const wl = wlMap.get(station.station_id);
          const muni = muniMap.get(station.station_id);
          const historical = stationHistoricalData.get(station.station_id);
          const pastPreds = stationPastPredictions.get(station.station_id);
          
          // Use historical data if available, otherwise fallback to current water level
          const currentLevel = Number((historical?.current_water_level_m ?? wl?.water_level_m ?? 0).toFixed(3));

          const minMax = minmaxMap.get(station.station_id);
          const minLevel = Number((minMax?.min_m ?? historical?.last_30_days_range?.min_m ?? muni?.last_30_days_min_m ?? Math.max(0, currentLevel - 0.2)).toFixed(3));
          const maxLevel = Number((minMax?.max_m ?? historical?.last_30_days_range?.max_m ?? muni?.last_30_days_max_m ?? (currentLevel + 0.5)).toFixed(3));

          // Determine status - SAME logic as all stations
          const range = Math.max(0.0001, maxLevel - minLevel);
          const pct = ((currentLevel - minLevel) / range) * 100;
          const status: 'normal' | 'warning' | 'danger' = pct >= 85 ? 'danger' : pct >= 65 ? 'warning' : 'normal';

          // Predictions for this station - SAME logic as all stations
          const preds = predictions
            .filter(p => p.station_id === station.station_id)
            .slice(0, 7)
            .map(p => ({
              date: new Date(p.prediction_date),
              predictedLevel: Number((p.predicted_water_level_m || p.predicted_water_level_cm / 100 || 0).toFixed(3)),
            }));

          // Trend determination - SAME logic as all stations
          const avgPred = preds.length ? preds.reduce((sum, p) => sum + p.predictedLevel, 0) / preds.length : currentLevel;
          const change = avgPred - currentLevel;
          const threshold = Math.max(0.01, (maxLevel - minLevel) * 0.01);
          const trend: 'rising' | 'falling' | 'stable' = Math.abs(change) < threshold ? 'stable' : (change > 0 ? 'rising' : 'falling');

          return {
            id: station.station_id,
            name: station.name.split(',')[0].trim(),
            location: {
              lat: station.latitude,
              lng: station.longitude,
              address: station.name.includes(',') ? station.name.split(', ')[1] : station.name,
            },
            currentLevel,
            minLevel,
            maxLevel,
            status,
            lastUpdated: historical ? new Date(historical.measurement_date) : (wl ? new Date(wl.measurement_date) : new Date()),
            trend,
            predictions: preds,
            last30DaysRange: {
              min_cm: historical?.last_30_days_range?.min_cm ?? muni?.last_30_days_min_cm ?? 0,
              max_cm: historical?.last_30_days_range?.max_cm ?? muni?.last_30_days_max_cm ?? 0,
              min_m: historical?.last_30_days_range?.min_m ?? muni?.last_30_days_min_m ?? 0,
              max_m: historical?.last_30_days_range?.max_m ?? muni?.last_30_days_max_m ?? 0,
            },
            last30DaysHistorical: historical?.last_30_days_historical ?? [],
            pastPredictions: pastPreds,
          };
        });

        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
        setMunicipalityData(municipalityStations);
        setLastUpdated(new Date().toISOString());
      } else {
        // Load all streams using live endpoints (stations, water levels, predictions, and municipality ranges)
        const token = getToken();
        const [stations, waterLevels, predictions, muniStations] = await Promise.all([
          fetchStations(),
          fetchWaterLevels(),
          fetchAllPredictions(),
          fetchMunicipalityStations(undefined, token || undefined).catch(() => [] as MunicipalityStation[]),
        ]);

        // Build lookup maps
        const wlMap = new Map(waterLevels.map(wl => [wl.station_id, wl]));
        const muniMap = new Map(muniStations.map(ms => [ms.station_id, ms]));

        // Fetch detailed historical data and past predictions for each station
        const stationHistoricalData = new Map();
        const stationPastPredictions = new Map();
        const historicalPromises = stations.map(s => 
          fetchStationWaterLevels(s.station_id).catch(() => null)
        );
        const pastPredictionPromises = stations.map(s =>
          fetchPastPredictions(s.station_id).catch(() => null)
        );
        const [historicalResults, pastPredictionResults] = await Promise.all([
          Promise.all(historicalPromises),
          Promise.all(pastPredictionPromises)
        ]);
        historicalResults.forEach((data, index) => {
          if (data) {
            stationHistoricalData.set(stations[index].station_id, data);
          }
        });
        pastPredictionResults.forEach((data, index) => {
          if (data?.success && data.past_predictions) {
            stationPastPredictions.set(stations[index].station_id, data.past_predictions);
          }
        });

        // Fetch admin-configured min/max thresholds (no auth required)
        const minmaxMap = new Map<string, { min_m: number; max_m: number }>();
        const minmaxResults = await Promise.all(
          stations.map(s => fetchStationMinMax(s.station_id, token || '').catch(() => null))
        );
        minmaxResults.forEach(res => {
          if (res) {
            minmaxMap.set(res.station_id, { min_m: res.min_level_m, max_m: res.max_level_m });
          }
        });

        const transformedStreams: Stream[] = stations.map((station) => {
          const wl = wlMap.get(station.station_id);
          const muni = muniMap.get(station.station_id);
          const historical = stationHistoricalData.get(station.station_id);
          const pastPreds = stationPastPredictions.get(station.station_id);
          
          // Use historical data if available, otherwise fallback to current water level
          const currentLevel = Number((historical?.current_water_level_m ?? wl?.water_level_m ?? 0).toFixed(3));

          const minMax = minmaxMap.get(station.station_id);
          const minLevel = Number((minMax?.min_m ?? historical?.last_30_days_range?.min_m ?? muni?.last_30_days_min_m ?? Math.max(0, currentLevel - 0.2)).toFixed(3));
          const maxLevel = Number((minMax?.max_m ?? historical?.last_30_days_range?.max_m ?? muni?.last_30_days_max_m ?? (currentLevel + 0.5)).toFixed(3));

          // Determine status
          const range = Math.max(0.0001, maxLevel - minLevel);
          const pct = ((currentLevel - minLevel) / range) * 100;
          const status: 'normal' | 'warning' | 'danger' = pct >= 85 ? 'danger' : pct >= 65 ? 'warning' : 'normal';

          // Predictions for this station
          const preds = predictions
            .filter(p => p.station_id === station.station_id)
            .slice(0, 7)
            .map(p => ({
              date: new Date(p.prediction_date),
              predictedLevel: Number((p.predicted_water_level_m || p.predicted_water_level_cm / 100 || 0).toFixed(3)),
            }));

          // Trend determination
          const avgPred = preds.length ? preds.reduce((sum, p) => sum + p.predictedLevel, 0) / preds.length : currentLevel;
          const change = avgPred - currentLevel;
          const threshold = Math.max(0.01, (maxLevel - minLevel) * 0.01);
          const trend: 'rising' | 'falling' | 'stable' = Math.abs(change) < threshold ? 'stable' : (change > 0 ? 'rising' : 'falling');

          return {
            id: station.station_id,
            name: station.name.split(',')[0].trim(),
            location: {
              lat: station.latitude,
              lng: station.longitude,
              address: station.name.includes(',') ? station.name.split(', ')[1] : station.name,
            },
            currentLevel,
            minLevel,
            maxLevel,
            status,
            lastUpdated: historical ? new Date(historical.measurement_date) : (wl ? new Date(wl.measurement_date) : new Date()),
            trend,
            predictions: preds,
            last30DaysRange: {
              min_cm: historical?.last_30_days_range?.min_cm ?? muni?.last_30_days_min_cm ?? 0,
              max_cm: historical?.last_30_days_range?.max_cm ?? muni?.last_30_days_max_cm ?? 0,
              min_m: historical?.last_30_days_range?.min_m ?? muni?.last_30_days_min_m ?? 0,
              max_m: historical?.last_30_days_range?.max_m ?? muni?.last_30_days_max_m ?? 0,
            },
            last30DaysHistorical: historical?.last_30_days_historical ?? [],
            pastPredictions: pastPreds,
          };
        });

        console.log('Stream processing complete:', transformedStreams.length, 'stations processed');
        console.log('Station IDs:', transformedStreams.map(s => s.id));

        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
        setMunicipalityData(muniStations);
        setApiData([] as unknown as ApiSummaryStation[]);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load stream data:', err);
      
      // Extract specific error message using utility
      const errorMessage = getEdgeFunctionErrorMessage(err, 'Unknown error occurred');
      
      console.error('Error details:', {
        message: errorMessage,
        original: err,
        viewMode,
        selectedMunicipalities
      });
      
      // Set specific error message
      setApiError(errorMessage);
      
      // Use dummy data as fallback
      setAllStreams(mockStreams);
      setVisibleStreams(mockStreams);
      setApiData(mockApiData);
      setUsingDummyData(true);
      setLastUpdated(null);
      
      // Show toast notification with specific error
      toast({
        title: "API Error",
        description: `${errorMessage}. Displaying demo data as fallback.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, [viewMode, selectedMunicipalities, toast]);

  const handleMunicipalityChange = (municipalityIds: number[]) => {
    setSelectedMunicipalities(municipalityIds);
  };

  const handleVisibleStreamsChange = React.useCallback((streams: Stream[]) => {
    setVisibleStreams(streams);
  }, []);

  if (isLoading) {
    return <StreamGridSkeleton />;
  }

  return (
    <div className="space-y-8">
      {usingDummyData && (
        <div className="bg-destructive/5 border-l-4 border-destructive p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.1"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-destructive">
                API Connection Error
              </h3>
              <p className="text-destructive/80 mt-1">
                {apiError ? `Error: ${apiError}` : 'Unable to connect to live data.'}
                {' '}Currently displaying demonstration data as fallback.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'all' | 'municipalities')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Stations</TabsTrigger>
          <TabsTrigger value="municipalities">
            By Municipality
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-8">
          <div className="mb-8">
            <StreamMap streams={allStreams} apiData={apiData} municipalityData={municipalityData} onVisibleStreamsChange={handleVisibleStreamsChange} />
          </div>
        </TabsContent>
        
        <TabsContent value="municipalities" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <MunicipalityFilter
                selectedMunicipalities={selectedMunicipalities}
                onMunicipalityChange={handleMunicipalityChange}
              />
            </div>
            <div className="lg:col-span-3">
              {selectedMunicipalities.length > 0 ? (
                <StreamMap 
                  streams={allStreams} 
                  apiData={apiData}
                  municipalityData={municipalityData}
                  onVisibleStreamsChange={handleVisibleStreamsChange}
                  selectedMunicipalities={selectedMunicipalities}
                />
              ) : (
                <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <div className="text-muted-foreground">
                    <h3 className="text-lg font-semibold mb-2">Select Municipalities</h3>
                    <p>Choose one or more municipalities from the filter to view their monitoring stations on the map.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {viewMode === 'municipalities' && selectedMunicipalities.length > 0 
                ? "Municipality Stations" 
                : "Stream Monitoring Stations"}
            </h2>
            {viewMode === 'municipalities' && selectedMunicipalities.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing stations from selected municipalities
              </p>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Showing {visibleStreams.length} of {allStreams.length} stations</div>
            {lastUpdated && !usingDummyData && (
              <div>Last updated: {new Date(lastUpdated).toLocaleString('en-DK', { 
                timeZone: 'Europe/Copenhagen',
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            )}
            {usingDummyData && (
              <div className="text-amber-600 font-medium">Demo data for testing purposes</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleStreams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} onDataUpdate={loadStreams} />
          ))}
        </div>
      </div>
    </div>
  );
};
