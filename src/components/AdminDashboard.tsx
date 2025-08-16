import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStationManager } from '@/hooks/useStationManager';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, LogOut, MapPin, Timer, CheckCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminDashboard: React.FC = () => {
  const [newStationId, setNewStationId] = useState('');
  const [isAddingStation, setIsAddingStation] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const {
    stations,
    trainingSessions,
    addStation,
    removeStation,
    getActiveStations,
    getTrainingStations
  } = useStationManager();

  const handleAddStation = async () => {
    if (!newStationId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a station ID",
        variant: "destructive"
      });
      return;
    }

    // Check if station already exists
    if (stations.find(s => s.id === newStationId.trim())) {
      toast({
        title: "Error", 
        description: "Station with this ID already exists",
        variant: "destructive"
      });
      return;
    }

    setIsAddingStation(true);
    try {
      const station = addStation(newStationId.trim());
      setNewStationId('');
      toast({
        title: "Station Added",
        description: `Station ${station.id} has started training`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add station",
        variant: "destructive"
      });
    } finally {
      setIsAddingStation(false);
    }
  };

  const handleRemoveStation = (stationId: string) => {
    removeStation(stationId);
    toast({
      title: "Station Removed",
      description: `Station ${stationId} has been removed`,
    });
  };

  const formatTimeRemaining = (startTime: Date) => {
    const now = new Date();
    const elapsed = now.getTime() - startTime.getTime();
    const totalDuration = 5 * 60 * 1000; // 5 minutes
    const remaining = Math.max(0, totalDuration - elapsed);
    
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeStations = getActiveStations();
  const trainingStations = getTrainingStations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage water level monitoring stations
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Add Station */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Station
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter station ID (e.g., ST001)"
                value={newStationId}
                onChange={(e) => setNewStationId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStation()}
                className="flex-1"
              />
              <Button 
                onClick={handleAddStation}
                disabled={isAddingStation}
                className="gap-2"
              >
                {isAddingStation ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Station
              </Button>
            </div>
            <Alert className="mt-4">
              <AlertDescription>
                New stations will start training immediately and become active after 5 minutes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Training Stations */}
        {trainingStations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                Training Stations ({trainingStations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainingStations.map((station) => {
                const session = trainingSessions.find(s => s.stationId === station.id);
                return (
                  <div key={station.id} className="p-4 border rounded-lg bg-muted/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{station.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {station.location.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Training</Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveStation(station.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training Progress</span>
                        <span>
                          {station.trainingStarted && 
                            formatTimeRemaining(station.trainingStarted)} remaining
                        </span>
                      </div>
                      <Progress value={station.trainingProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {station.trainingProgress}% complete
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Active Stations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Active Stations ({activeStations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeStations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No active stations yet. Add a new station to get started.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeStations.map((station) => (
                  <div key={station.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{station.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {station.location.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            station.waterLevelStatus === 'danger' ? 'destructive' :
                            station.waterLevelStatus === 'warning' ? 'secondary' : 
                            'default'
                          }
                        >
                          {station.waterLevelStatus}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveStation(station.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Current Level:</span>
                        <span className="font-medium">{station.currentLevel}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Level:</span>
                        <span className="font-medium">{station.maxLevel}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <span className="font-medium capitalize">{station.trend}</span>
                      </div>
                      {station.lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated: {station.lastUpdated.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};