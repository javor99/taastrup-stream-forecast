import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Stream } from '@/types/stream';
import { LogOut, RefreshCw, MapPin, Waves, Clock, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  streams: Stream[];
  onAddStation: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ streams, onAddStation }) => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [retrainingStations, setRetrainingStations] = useState<Set<string>>(new Set());
  const [newStationId, setNewStationId] = useState('');

  const handleRetrain = (streamId: string, streamName: string) => {
    setRetrainingStations(prev => new Set([...prev, streamId]));
    
    toast({
      title: "Retraining Scheduled",
      description: `New model for ${streamName} will be public in 5 hours!`,
      duration: 5000,
    });

    // Remove from retraining set after 3 seconds to simulate processing
    setTimeout(() => {
      setRetrainingStations(prev => {
        const newSet = new Set(prev);
        newSet.delete(streamId);
        return newSet;
      });
    }, 3000);
  };

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStationId.trim()) {
      // Check if station already exists
      if (streams.some(stream => stream.id === newStationId.trim())) {
        toast({
          title: "Station Already Exists",
          description: `Station ID ${newStationId.trim()} is already in the system.`,
          variant: "destructive",
        });
        return;
      }
      
      onAddStation(newStationId.trim());
      setNewStationId('');
      toast({
        title: "Station Added",
        description: `New monitoring station ${newStationId.trim()} has been added with dummy data.`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all active monitoring stations</p>
          </div>
          <Button onClick={logout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Add New Station Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Monitoring Station
            </CardTitle>
            <CardDescription>
              Enter a station ID to create a new monitoring station with dummy GPS and water level data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStation} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="stationId" className="sr-only">Station ID</Label>
                <Input
                  id="stationId"
                  placeholder="Enter station ID (e.g., 70000999)"
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                />
              </div>
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Station
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => {
            const isRetraining = retrainingStations.has(stream.id);
            return (
              <Card key={stream.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Waves className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{stream.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(stream.status)}>
                      {stream.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {stream.location.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current Level</div>
                      <div className="font-semibold">{stream.currentLevel}m</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max Level</div>
                      <div className="font-semibold">{stream.maxLevel}m</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Trend</div>
                      <div className="font-semibold capitalize">{stream.trend}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Update</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stream.lastUpdated.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button 
                      onClick={() => handleRetrain(stream.id, stream.name)}
                      disabled={isRetraining}
                      className="w-full gap-2"
                      variant={isRetraining ? "secondary" : "default"}
                    >
                      <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
                      {isRetraining ? 'Scheduling...' : 'Schedule Retraining'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Station Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Stations</div>
              <div className="text-2xl font-bold text-primary">{streams.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Normal Status</div>
              <div className="text-2xl font-bold text-green-600">
                {streams.filter(s => s.status === 'normal').length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Warning Status</div>
              <div className="text-2xl font-bold text-yellow-600">
                {streams.filter(s => s.status === 'warning').length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Danger Status</div>
              <div className="text-2xl font-bold text-red-600">
                {streams.filter(s => s.status === 'danger').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};