import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Stream } from '@/types/stream';
import { LogOut, Trash2, MapPin, Waves, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchSummary } from '@/services/api';
import { transformApiDataToStreams } from '@/utils/dataTransformers';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [newStationId, setNewStationId] = useState('');

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { summary, lastUpdated } = await fetchSummary();
      const transformedStreams = transformApiDataToStreams(summary);
      
      setStreams(transformedStreams);
      setLastUpdated(lastUpdated);
    } catch (err) {
      console.error('Failed to load stream data:', err);
      setError('Failed to load stream data');
      toast({
        title: "Error",
        description: "Failed to load station data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleRemoveStation = (streamId: string, streamName: string) => {
    toast({
      title: "Not Available",
      description: "Station removal is not available in the current API.",
      variant: "destructive",
    });
  };

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Not Available",
      description: "Adding new stations is not available in the current API.",
      variant: "destructive",
    });
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
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <Header onShowAdminDashboard={onClose} isInDashboard={true} />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all active monitoring stations</p>
        </div>

        {/* Add New Station Form */}
        <Card className="mb-8 opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Monitoring Station
            </CardTitle>
            <CardDescription>
              This feature is not available with the current API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStation} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="stationId" className="sr-only">Station ID</Label>
                <Input
                  id="stationId"
                  placeholder="Feature not available"
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  disabled
                />
              </div>
              <Button type="submit" className="gap-2" disabled>
                <Plus className="h-4 w-4" />
                Add Station
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading station data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading station data</p>
              <Button onClick={loadStreams} variant="outline">
                Try again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {streams.map((stream) => {
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
                      <div className="text-muted-foreground">Min Level</div>
                      <div className="font-semibold">{stream.minLevel}m</div>
                    </div>
                  </div>
                  
                   <div className="pt-2 border-t">
                     <Button 
                       onClick={() => handleRemoveStation(stream.id, stream.name)}
                       className="w-full gap-2"
                       variant="destructive"
                       disabled
                     >
                       <Trash2 className="h-4 w-4" />
                       Remove Station (Not Available)
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             );
           })}
           </div>
        )}

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