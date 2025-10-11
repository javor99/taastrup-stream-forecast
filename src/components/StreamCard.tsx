
import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Calendar, Settings, Trash2, Bell, BellOff } from 'lucide-react';
import { Stream } from '@/types/stream';
import { WaterLevelIndicator } from './WaterLevelIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateStationMinMax, fetchStationMinMax, deleteStation, subscribeToStation, unsubscribeFromStation, fetchUserSubscriptions } from '@/services/api';

interface StreamCardProps {
  stream: Stream;
  onDataUpdate?: () => void;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream, onDataUpdate }) => {
  const [isEditingMinMax, setIsEditingMinMax] = useState(false);
  const [minLevel, setMinLevel] = useState(stream.minLevel * 100); // Convert to cm
  const [maxLevel, setMaxLevel] = useState(stream.maxLevel * 100); // Convert to cm
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [thresholdPercentage, setThresholdPercentage] = useState(0.9);
  const [stationMinMax, setStationMinMax] = useState<{last_updated?: string; updated_by?: string | null} | null>(null);
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin, getToken } = useAuth();
  
  // Load station min/max info to show who last updated it
  useEffect(() => {
    const loadStationMinMax = async () => {
      if (isAdmin || isSuperAdmin) {
        try {
          const token = getToken();
          if (token) {
            const data = await fetchStationMinMax(stream.id, token);
            setStationMinMax({
              last_updated: data.last_updated,
              updated_by: data.updated_by
            });
          }
        } catch (error) {
          // Silently fail - this is just for additional info
          console.log('Could not fetch station min/max info:', error);
        }
      }
    };
    
    loadStationMinMax();
  }, [stream.id, isAdmin, isSuperAdmin, getToken]);
  
  const nextPrediction = stream.predictions?.[0];
  const maxPrediction = stream.predictions?.length > 0 
    ? stream.predictions.reduce((max, pred) => 
        pred.predictedLevel > max.predictedLevel ? pred : max
      )
    : null;

  // Check data availability for predictions
  const totalDaysNeeded = 40;
  const minDaysForPrediction = 37;
  const availableDays = stream.last30DaysHistorical?.length || 0;
  
  // Calculate actual missing days by checking date gaps
  const calculateMissingDays = () => {
    if (!stream.last30DaysHistorical || stream.last30DaysHistorical.length === 0) {
      return totalDaysNeeded;
    }
    
    // Get the date range span
    const dates = stream.last30DaysHistorical.map(d => new Date(d.date).getTime()).sort((a, b) => b - a);
    const mostRecent = dates[0];
    const oldest = dates[dates.length - 1];
    const daySpan = Math.floor((mostRecent - oldest) / (1000 * 60 * 60 * 24)) + 1;
    
    // Missing days = total days in span - actual data points
    return daySpan - availableDays;
  };
  
  const missingDays = calculateMissingDays();
  
  const hasInsufficientData = !stream.last30DaysHistorical || 
    availableDays < minDaysForPrediction || 
    !stream.last30DaysRange ||
    stream.last30DaysRange.min_m === 0 && stream.last30DaysRange.max_m === 0;
  
  const hasPartialData = availableDays >= minDaysForPrediction && missingDays > 0;

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

  const checkSubscriptionStatus = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetchUserSubscriptions(token);
      const subscription = response.subscriptions.find(sub => sub.station_id === stream.id);
      setIsSubscribed(!!subscription);
      if (subscription) {
        setThresholdPercentage(subscription.threshold_percentage);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      await subscribeToStation(stream.id, thresholdPercentage, token);
      setIsSubscribed(true);
      
      toast({
        title: "Subscribed successfully",
        description: `You will receive alerts for station "${stream.name}" when predictions exceed ${(thresholdPercentage * 100).toFixed(0)}% of max level.`,
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Failed to subscribe to alerts",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsSubscribing(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      await unsubscribeFromStation(stream.id, token);
      setIsSubscribed(false);
      
      toast({
        title: "Unsubscribed successfully",
        description: `You will no longer receive alerts for station "${stream.name}".`,
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast({
        title: "Unsubscribe failed",
        description: error instanceof Error ? error.message : "Failed to unsubscribe from alerts",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDeleteStation = async () => {
    if (!confirm(`Are you sure you want to delete station "${stream.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      await deleteStation(stream.id, token);
      
      toast({
        title: "Station deleted",
        description: `Station "${stream.name}" has been successfully deleted.`,
      });
      
      // Call the onDataUpdate callback to refresh the data
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Failed to delete station:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete station",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border-2 ${getStatusColor()} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-card/95 hover:scale-105 animate-fade-in`}>
      {hasInsufficientData && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Predictions Unavailable</span>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
            Predictions unavailable because of lack of data - {missingDays} missing days
          </p>
        </div>
      )}
      {!hasInsufficientData && hasPartialData && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Predictions Worse</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Not full data - {missingDays} missing days. Predictions may be less accurate.
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
              ? 'bg-rose-100/50 dark:bg-rose-900/30 border-rose-200/50 dark:border-rose-700/50 hover:bg-rose-200/50 dark:hover:bg-rose-800/30'
              : hasPartialData
              ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-700/50 hover:bg-amber-200/50 dark:hover:bg-amber-800/30'
              : 'bg-cyan-100/50 dark:bg-cyan-900/30 border-cyan-200/50 dark:border-cyan-700/50 hover:bg-cyan-200/50 dark:hover:bg-cyan-800/30'
          }`}>
            <div className="text-center">
              <div className={`text-xs font-semibold font-display mb-1 flex items-center justify-center gap-1 ${
                hasInsufficientData 
                  ? 'text-rose-700 dark:text-rose-300'
                  : hasPartialData
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-cyan-700 dark:text-cyan-300'
              }`}>
                <Calendar className="h-3 w-3" />
                Previous 40 Day Range
                {(hasInsufficientData || hasPartialData) && <AlertTriangle className="h-3 w-3" />}
              </div>
              <div className="text-sm font-bold text-foreground font-display">
                {hasInsufficientData 
                  ? `Insufficient Data (${availableDays}/40 days)` 
                  : hasPartialData
                  ? `Partial Data (${availableDays}/40 days)`
                  : `${stream.last30DaysRange.min_m.toFixed(3)}m - ${stream.last30DaysRange.max_m.toFixed(3)}m`
                }
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{stream.name} - 40 Day Historical Data</DialogTitle>
          </DialogHeader>
          {availableDays === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Historical Data</h3>
              <p className="text-muted-foreground">
                This monitoring station does not have any historical data available. 
                This may be due to recent installation, maintenance periods, or data collection issues.
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
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingMinMax(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Min/Max
            </Button>
            
            {isSubscribed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnsubscribe}
                disabled={isSubscribing}
                className="flex items-center gap-2"
              >
                <BellOff className="h-4 w-4" />
                {isSubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Subscribe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subscribe to Water Level Alerts</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Get email alerts when water level predictions for "{stream.name}" exceed your threshold.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Alert Threshold (%)</Label>
                      <Input
                        id="threshold"
                        type="number"
                        min="50"
                        max="100"
                        step="5"
                        value={thresholdPercentage * 100}
                        onChange={(e) => setThresholdPercentage(Number(e.target.value) / 100)}
                        placeholder="90"
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Alert when predictions reach {(thresholdPercentage * 100).toFixed(0)}% of the maximum historical level</p>
                        <p className="font-medium">
                          Threshold water level: {(thresholdPercentage * stream.maxLevel).toFixed(2)}m 
                          <span className="text-muted-foreground"> (Max: {stream.maxLevel.toFixed(2)}m)</span>
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                      className="w-full"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Subscribe to Alerts'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteStation}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
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
            {stationMinMax && (stationMinMax.last_updated || stationMinMax.updated_by) && (
              <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                {stationMinMax.last_updated && (
                  <div>Last updated: {new Date(stationMinMax.last_updated).toLocaleDateString()}</div>
                )}
                {stationMinMax.updated_by && (
                  <div>Updated by: {stationMinMax.updated_by}</div>
                )}
              </div>
            )}
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
