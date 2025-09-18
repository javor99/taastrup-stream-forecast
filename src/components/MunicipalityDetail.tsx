import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchMunicipalityById, fetchStations, assignStationsToMunicipality, type Municipality, type ApiStation } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Users, Calendar, SquareKanban, Plus } from 'lucide-react';

interface MunicipalityDetailProps {
  municipalityId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MunicipalityDetail: React.FC<MunicipalityDetailProps> = ({
  municipalityId,
  isOpen,
  onClose,
}) => {
  const [municipality, setMunicipality] = useState<Municipality & { stations?: ApiStation[] } | null>(null);
  const [allStations, setAllStations] = useState<ApiStation[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showStationAssignment, setShowStationAssignment] = useState(false);

  const { isSuperAdmin, getToken } = useAuth();
  const { toast } = useToast();

  const loadMunicipalityDetails = async () => {
    if (!municipalityId) return;
    
    try {
      setIsLoading(true);
      const token = getToken();
      const data = await fetchMunicipalityById(municipalityId, token || undefined);
      setMunicipality(data);
    } catch (error) {
      console.error('Failed to load municipality details:', error);
      toast({
        title: "Error",
        description: "Failed to load municipality details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllStations = async () => {
    try {
      const stations = await fetchStations();
      setAllStations(stations);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  useEffect(() => {
    if (isOpen && municipalityId) {
      loadMunicipalityDetails();
      loadAllStations();
    }
  }, [isOpen, municipalityId]);

  const handleAssignStations = async () => {
    if (!municipality || selectedStations.length === 0) return;

    try {
      setIsAssigning(true);
      const token = getToken();
      await assignStationsToMunicipality(municipality.id, selectedStations, token || undefined);
      
      toast({
        title: "Success",
        description: `Assigned ${selectedStations.length} stations to ${municipality.name}`,
      });

      setShowStationAssignment(false);
      setSelectedStations([]);
      loadMunicipalityDetails();
    } catch (error) {
      console.error('Failed to assign stations:', error);
      toast({
        title: "Error",
        description: "Failed to assign stations to municipality",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const assignedStationIds = municipality?.stations?.map(s => s.station_id) || [];
  const unassignedStations = allStations.filter(station => 
    !assignedStationIds.includes(station.station_id)
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Municipality Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of municipality information and stations
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-48 bg-muted rounded animate-pulse" />
          </div>
        ) : municipality ? (
          <div className="space-y-6">
            {/* Municipality Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{municipality.name}</CardTitle>
                <CardDescription>{municipality.region}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{municipality.population.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Population</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SquareKanban className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{municipality.area_km2} km²</div>
                      <div className="text-xs text-muted-foreground">Area</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{municipality.stations?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Stations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{new Date(municipality.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">Created</div>
                    </div>
                  </div>
                </div>
                {municipality.description && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{municipality.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigned Stations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Assigned Stations ({municipality.stations?.length || 0})</CardTitle>
                  <CardDescription>Water level monitoring stations in this municipality</CardDescription>
                </div>
                {isSuperAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowStationAssignment(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Stations
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {municipality.stations && municipality.stations.length > 0 ? (
                  <div className="grid gap-3">
                    {municipality.stations.map((station) => (
                      <div key={station.station_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{station.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {station.station_id} • {station.location_type} • {station.station_owner}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                          </div>
                        </div>
                        <Badge variant="secondary">{station.location_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No stations assigned to this municipality</p>
                    {isSuperAdmin && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowStationAssignment(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign First Station
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Station Assignment Dialog */}
            {showStationAssignment && (
              <Dialog open={showStationAssignment} onOpenChange={setShowStationAssignment}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Assign Stations to {municipality.name}</DialogTitle>
                    <DialogDescription>
                      Select stations to assign to this municipality
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {unassignedStations.length} unassigned stations available
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {unassignedStations.map((station) => (
                        <div key={station.station_id} className="flex items-center space-x-2 p-2 border rounded">
                          <Checkbox
                            id={station.station_id}
                            checked={selectedStations.includes(station.station_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStations([...selectedStations, station.station_id]);
                              } else {
                                setSelectedStations(selectedStations.filter(id => id !== station.station_id));
                              }
                            }}
                          />
                          <label htmlFor={station.station_id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{station.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {station.station_id} • {station.location_type} • {station.station_owner}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowStationAssignment(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAssignStations}
                        disabled={selectedStations.length === 0 || isAssigning}
                      >
                        {isAssigning ? 'Assigning...' : `Assign ${selectedStations.length} Stations`}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Municipality not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};