import React, { useState, useEffect } from 'react';
import { Municipality, fetchMunicipalities } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MunicipalityFilterProps {
  selectedMunicipalities: number[];
  onMunicipalityChange: (municipalityIds: number[]) => void;
}

export const MunicipalityFilter: React.FC<MunicipalityFilterProps> = ({
  selectedMunicipalities,
  onMunicipalityChange,
}) => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, getToken } = useAuth();
  const { toast } = useToast();

  const loadMunicipalities = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const data = await fetchMunicipalities(token);
      setMunicipalities(data.municipalities.map(m => ({ ...m, station_count: m.station_count || 0 })));
    } catch (error) {
      console.error('Error loading municipalities:', error);
      toast({
        title: "Error Loading Municipalities",
        description: "Failed to load municipality data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMunicipalities();
  }, [isAuthenticated]);

  const handleMunicipalityToggle = (municipalityId: number, checked: boolean) => {
    if (checked) {
      onMunicipalityChange([...selectedMunicipalities, municipalityId]);
    } else {
      onMunicipalityChange(selectedMunicipalities.filter(id => id !== municipalityId));
    }
  };

  const handleSelectAll = () => {
    onMunicipalityChange(municipalities.map(m => m.id));
  };

  const handleClearAll = () => {
    onMunicipalityChange([]);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Municipality Filter</CardTitle>
          <CardDescription>Please login to view and filter by municipalities</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Municipality Filter
        </CardTitle>
        <CardDescription>
          Select municipalities to filter stations on the map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading municipalities...</div>
        ) : municipalities.length === 0 ? (
          <div className="text-sm text-muted-foreground">No municipalities available</div>
        ) : (
          <>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                disabled={selectedMunicipalities.length === municipalities.length}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll}
                disabled={selectedMunicipalities.length === 0}
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-3">
              {municipalities.map((municipality) => (
                <div key={municipality.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id={`municipality-${municipality.id}`}
                    checked={selectedMunicipalities.includes(municipality.id)}
                    onCheckedChange={(checked) => 
                      handleMunicipalityToggle(municipality.id, checked as boolean)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <label 
                      htmlFor={`municipality-${municipality.id}`}
                      className="block text-sm font-medium cursor-pointer"
                    >
                      {municipality.name}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {municipality.region}
                    </p>
                    {municipality.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {municipality.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {municipality.population?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Square className="h-3 w-3" />
                        {municipality.area_km2} km²
                      </div>
                      {municipality.station_count !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {municipality.station_count} stations
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};