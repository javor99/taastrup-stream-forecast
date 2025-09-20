
import React, { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Calendar, Settings } from 'lucide-react';
import { Stream } from '@/types/stream';
import { WaterLevelIndicator } from './WaterLevelIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateStationMinMax } from '@/services/api';

interface StreamCardProps {
  stream: Stream;
  onDataUpdate?: () => void;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream, onDataUpdate }) => {
  const [isEditingMinMax, setIsEditingMinMax] = useState(false);
  const [minLevel, setMinLevel] = useState(stream.minLevel * 100); // Convert to cm
  const [maxLevel, setMaxLevel] = useState(stream.maxLevel * 100); // Convert to cm
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin, getToken } = useAuth();
  
  const nextPrediction = stream.predictions?.[0];
  const maxPrediction = stream.predictions?.length > 0 
    ? stream.predictions.reduce((max, pred) => 
        pred.predictedLevel > max.predictedLevel ? pred : max
      )
    : null;

  // Check if station has insufficient 30-day historical data
  const hasInsufficientData = !stream.last30DaysHistorical || 
    stream.last30DaysHistorical.length < 25 || // Less than 25 days of data
    !stream.last30DaysRange ||
    stream.last30DaysRange.min_m === 0 && stream.last30DaysRange.max_m === 0;

  const getTomorrowName = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getStatusIcon = () => {
    switch (stream.status) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'danger':
        return <XCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendIcon = () => {
    switch (stream.trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (stream.status) {
      case 'normal':
        return 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30';
      case 'danger':
        return 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30';
      default:
        return 'border-border bg-muted/20';
    }
  };

  const handleUpdateMinMax = async () => {
    if (minLevel >= maxLevel) {
      toast({
        title: "Invalid Values",
        description: "Minimum level must be less than maximum level.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateStationMinMax(stream.id, minLevel, maxLevel, getToken() || undefined);
      toast({
        title: "Success",
        description: "Min/Max levels updated successfully.",
      });
      setIsEditingMinMax(false);
      onDataUpdate?.();
    } catch (error) {
      console.error('Error updating min/max:', error);
      toast({
        title: "Error",
        description: "Failed to update min/max levels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border-2 ${getStatusColor()} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-card/95 hover:scale-105 animate-fade-in`}>
      {hasInsufficientData && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Limited Historical Data</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            This station has insufficient 30-day historical data. Predictions may be less accurate.
          </p>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground mb-1 tracking-tight">{stream.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2 font-medium">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{stream.location.address}</span>
          </div>
          <div className="text-xs text-muted-foreground/70 font-mono mb-1">
            Vandah Station ID: {stream.id}
          </div>
          <div className="text-xs text-muted-foreground/70 font-mono">
            GPS: {stream.location.lat.toFixed(4)}, {stream.location.lng.toFixed(4)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {getTrendIcon()}
        </div>
      </div>

      <WaterLevelIndicator stream={stream} />

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
          <div className="text-xs font-semibold text-primary dark:text-blue-300 font-display">Current</div>
          <div className="text-lg font-bold text-foreground font-display">{stream.currentLevel}m</div>
        </div>
        <div className="text-center p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 font-display">{getTomorrowName()}</div>
          <div className="text-lg font-bold text-foreground font-display">{nextPrediction?.predictedLevel || 'N/A'}m</div>
        </div>
        <div className="text-center p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
          <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 font-display">7-Day Max</div>
          <div className="text-lg font-bold text-foreground font-display">{maxPrediction?.predictedLevel || 'N/A'}m</div>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <div className={`mt-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            hasInsufficientData 
              ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-700/50 hover:bg-amber-200/50 dark:hover:bg-amber-800/30'
              : 'bg-cyan-100/50 dark:bg-cyan-900/30 border-cyan-200/50 dark:border-cyan-700/50 hover:bg-cyan-200/50 dark:hover:bg-cyan-800/30'
          }`}>
            <div className="text-center">
              <div className={`text-xs font-semibold font-display mb-1 flex items-center justify-center gap-1 ${
                hasInsufficientData 
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-cyan-700 dark:text-cyan-300'
              }`}>
                <Calendar className="h-3 w-3" />
                Previous 30 Day Range
                {hasInsufficientData && <AlertTriangle className="h-3 w-3" />}
              </div>
              <div className="text-sm font-bold text-foreground font-display">
                {hasInsufficientData 
                  ? 'Insufficient Data' 
                  : `${stream.last30DaysRange.min_m.toFixed(3)}m - ${stream.last30DaysRange.max_m.toFixed(3)}m`
                }
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{stream.name} - 30 Day Historical Data</DialogTitle>
          </DialogHeader>
          {hasInsufficientData ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Insufficient Historical Data</h3>
              <p className="text-muted-foreground">
                This monitoring station does not have enough historical data for the previous 30 days. 
                This may be due to recent installation, maintenance periods, or data collection issues.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Available data points: {stream.last30DaysHistorical?.length || 0} out of 30 days
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {stream.last30DaysHistorical.map((day, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</span>
                  <span className="text-sm font-mono">{day.water_level_m.toFixed(3)}m</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>


      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {(isAdmin || isSuperAdmin) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingMinMax(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Edit Min/Max
          </Button>
        )}
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold font-display tracking-wide ${
          stream.status === 'normal' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' :
          stream.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200' :
          'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
        } ${!(isAdmin || isSuperAdmin) ? 'ml-auto' : ''}`}>
          {stream.status.toUpperCase()}
        </div>
      </div>

      <Dialog open={isEditingMinMax} onOpenChange={setIsEditingMinMax}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Min/Max Levels - {stream.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Current Range: {stream.minLevel.toFixed(2)}m - {stream.maxLevel.toFixed(2)}m
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minLevel">Minimum Level (cm)</Label>
                <Input
                  id="minLevel"
                  type="number"
                  value={minLevel}
                  onChange={(e) => setMinLevel(Number(e.target.value))}
                  placeholder="Min level in cm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLevel">Maximum Level (cm)</Label>
                <Input
                  id="maxLevel"
                  type="number"
                  value={maxLevel}
                  onChange={(e) => setMaxLevel(Number(e.target.value))}
                  placeholder="Max level in cm"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Preview: {(minLevel/100).toFixed(2)}m - {(maxLevel/100).toFixed(2)}m
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditingMinMax(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMinMax} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
