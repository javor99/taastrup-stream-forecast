import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { createStation, fetchMunicipalities, type CreateStationRequest, type Municipality } from '@/services/api';

export const StationManager: React.FC = () => {
  const { getToken, isAdmin, isSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [stationData, setStationData] = useState<CreateStationRequest>({
    station_id: '',
    municipality_id: 0
  });

  const canCreateStation = isAdmin || isSuperAdmin;

  useEffect(() => {
    const loadMunicipalities = async () => {
      if (!canCreateStation) return;
      
      setLoadingMunicipalities(true);
      try {
        const token = getToken();
        const response = await fetchMunicipalities(token || undefined);
        setMunicipalities(response.municipalities);
      } catch (error) {
        console.error('Failed to load municipalities:', error);
        setMessage({ type: 'error', text: 'Failed to load municipalities' });
      } finally {
        setLoadingMunicipalities(false);
      }
    };

    loadMunicipalities();
  }, [canCreateStation, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateStation) {
      setMessage({ type: 'error', text: 'You do not have permission to create stations' });
      return;
    }

    const token = getToken();
    if (!token) {
      setMessage({ type: 'error', text: 'Please login to create stations' });
      return;
    }

    if (!stationData.station_id.trim()) {
      setMessage({ type: 'error', text: 'Station ID is required' });
      return;
    }

    if (!stationData.municipality_id || stationData.municipality_id <= 0) {
      setMessage({ type: 'error', text: 'Please select a municipality' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await createStation(stationData, token);
      const stationName = response?.station?.name || stationData.station_id;
      setMessage({ type: 'success', text: `Success ${stationName} successfully added` });
      
      // Reset form
      setStationData({
        station_id: '',
        municipality_id: 0
      });
    } catch (error: any) {
      console.error('Failed to create station:', error);
      setMessage({ 
        type: 'error', 
        text: error?.message || 'Failed to create station. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateStationRequest, value: string | number) => {
    setStationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!canCreateStation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Water Station
          </CardTitle>
          <CardDescription>Create new water monitoring stations</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only admin and superadmin users can create new stations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Water Station
        </CardTitle>
        <CardDescription>
          Create new water monitoring stations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="station_id">Station ID</Label>
              <Input
                id="station_id"
                type="text"
                placeholder="e.g., 70001007"
                value={stationData.station_id}
                onChange={(e) => handleInputChange('station_id', e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="municipality_id">Municipality</Label>
              <Select
                value={stationData.municipality_id > 0 ? stationData.municipality_id.toString() : ""}
                onValueChange={(value) => handleInputChange('municipality_id', parseInt(value))}
                disabled={isLoading || loadingMunicipalities}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingMunicipalities ? "Loading municipalities..." : "Select a municipality"} />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={municipality.id.toString()}>
                      {municipality.name} ({municipality.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creating Station...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Station
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};