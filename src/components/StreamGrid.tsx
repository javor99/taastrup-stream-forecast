
import React, { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import { StreamMap } from './StreamMap';
import { StreamGridSkeleton } from './StreamGridSkeleton';
import { MunicipalityFilter } from './MunicipalityFilter';
import { Stream } from '@/types/stream';
import { fetchStations, fetchWaterLevels, fetchAllPredictions, fetchMunicipalityStations, fetchStationMinMax, ApiSummaryStation, MunicipalityStation } from '@/services/api';
import { transformMunicipalityStationsToStreams } from '@/utils/dataTransformers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { mockStreams, mockApiData } from '@/data/mockStreams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const StreamGrid = () => {
  const [allStreams, setAllStreams] = useState<Stream[]>([]);
  const [visibleStreams, setVisibleStreams] = useState<Stream[]>([]);
  const [apiData, setApiData] = useState<ApiSummaryStation[]>([]);
  const [municipalityData, setMunicipalityData] = useState<MunicipalityStation[]>([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'municipalities'>('all');
  const { toast } = useToast();
  const { isAuthenticated, getToken, isAdmin, isSuperAdmin } = useAuth();

  const loadStreams = async () => {
    try {
      setIsLoading(true);
      setUsingDummyData(false);
      
      if (viewMode === 'municipalities' && selectedMunicipalities.length > 0) {
        // Load municipality-specific stations
        const token = getToken();
        const stations = await fetchMunicipalityStations(selectedMunicipalities, token || undefined);
        const transformedStreams = transformMunicipalityStationsToStreams(stations);
        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
        setMunicipalityData(stations);
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

        // Optionally fetch admin-configured min/max thresholds
        const minmaxMap = new Map<string, { min_m: number; max_m: number }>();
        if ((isAdmin || isSuperAdmin) && token) {
          const minmaxResults = await Promise.all(
            stations.map(s => fetchStationMinMax(s.station_id, token!).catch(() => null))
          );
          minmaxResults.forEach(res => {
            if (res) {
              minmaxMap.set(res.station_id, { min_m: res.min_value_m, max_m: res.max_value_m });
            }
          });
        }

        const transformedStreams: Stream[] = stations.map((station) => {
          const wl = wlMap.get(station.station_id);
          const muni = muniMap.get(station.station_id);
          const currentLevel = Number(((wl?.water_level_m ?? 0)).toFixed(3));

          const minMax = minmaxMap.get(station.station_id);
          const minLevel = Number((minMax?.min_m ?? muni?.last_30_days_min_m ?? Math.max(0, (wl?.water_level_m ?? 0) - 0.2)).toFixed(3));
          const maxLevel = Number((minMax?.max_m ?? muni?.last_30_days_max_m ?? ((wl?.water_level_m ?? 0) + 0.5)).toFixed(3));

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
              predictedLevel: Number(p.predicted_water_level_m.toFixed(3)),
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
            lastUpdated: wl ? new Date(wl.measurement_date) : new Date(),
            trend,
            predictions: preds,
            last30DaysRange: {
              min_cm: muni?.last_30_days_min_cm ?? 0,
              max_cm: muni?.last_30_days_max_cm ?? 0,
              min_m: muni?.last_30_days_min_m ?? 0,
              max_m: muni?.last_30_days_max_m ?? 0,
            },
            last30DaysHistorical: [],
          };
        });

        setAllStreams(transformedStreams);
        setVisibleStreams(transformedStreams);
        setMunicipalityData(muniStations);
        setApiData([] as unknown as ApiSummaryStation[]);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load stream data:', err);
      
      // Use dummy data as fallback
      setAllStreams(mockStreams);
      setVisibleStreams(mockStreams);
      setApiData(mockApiData);
      setUsingDummyData(true);
      setLastUpdated(null);
      
      // Show toast notification
      toast({
        title: "Using Demo Data",
        description: "Unable to connect to live data. Displaying demo stream monitoring data for demonstration purposes.",
        variant: "default",
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
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-amber-800">
                Demo Mode Active
              </h3>
              <p className="text-amber-700 mt-1">
                Currently displaying demonstration data with simulated water levels and weather stations. 
                Live data from monitoring stations is temporarily unavailable.
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
