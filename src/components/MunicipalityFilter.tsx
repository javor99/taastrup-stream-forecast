import React, { useState, useEffect } from 'react';
import { Municipality, fetchMunicipalities } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Users, Square, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const selectedMunicipalityNames = municipalities
    .filter(m => selectedMunicipalities.includes(m.id))
    .map(m => m.name);

  const loadMunicipalities = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
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
  }, []);

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


  return (
    <div className="space-y-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Municipality Filter
            {selectedMunicipalities.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedMunicipalities.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Municipality Filter
          </DialogTitle>
          <DialogDescription>
            Select municipalities to filter stations on the map
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Loading municipalities...</div>
        ) : municipalities.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No municipalities available</div>
        ) : (
          <div className="space-y-4">
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
            
            <ScrollArea className="h-[400px] pr-4">
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
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
    
    {selectedMunicipalityNames.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {selectedMunicipalityNames.map((name, index) => (
          <Badge key={index} variant="secondary" className="px-3 py-1">
            {name}
          </Badge>
        ))}
      </div>
    )}
  </div>
  );
};