
import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Calendar, Settings, Trash2, Bell, BellOff, ChevronDown, Building2 } from 'lucide-react';
import { Stream } from '@/types/stream';
import { WaterLevelIndicator } from './WaterLevelIndicator';
import { Slider } from '@/components/ui/slider';
import { DialogFooter } from '@/components/ui/dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateStationMinMax, fetchStationMinMax, deleteStation, subscribeToStation, unsubscribeFromStation, fetchUserSubscriptions } from '@/services/api';

interface StreamCardProps {
  stream: Stream;
  onDataUpdate?: () => void;
  isAdminView?: boolean;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream, onDataUpdate, isAdminView = false }) => {
  const [isEditingMinMax, setIsEditingMinMax] = useState(false);
  const [minLevel, setMinLevel] = useState(stream.minLevel * 100); // Convert to cm
  const [maxLevel, setMaxLevel] = useState(stream.maxLevel * 100); // Convert to cm
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [aboveSubscription, setAboveSubscription] = useState<{ threshold: number } | null>(null);
  const [belowSubscription, setBelowSubscription] = useState<{ threshold: number } | null>(null);
  const [thresholdPercentage, setThresholdPercentage] = useState(0.9);
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [stationMinMax, setStationMinMax] = useState<{last_updated?: string; updated_by?: string | null} | null>(null);
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin, getToken, userMunicipalityId } = useAuth();
  
  // Check if the current user can edit this station
  const canEditStation = () => {
    if (isSuperAdmin) return true;
    if (!isAdmin) return false;
    return stream.municipalityId === userMunicipalityId;
  };
  
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

  // Load subscription status on mount and when stream changes
  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      checkSubscriptionStatus();
    }
  }, [stream.id, isAdmin, isSuperAdmin]);

  // Update suggested threshold when alert type changes
  useEffect(() => {
    // Auto-adjust threshold based on alert type
    if (alertType === 'above' && !aboveSubscription) {
      setThresholdPercentage(0.9);
    } else if (alertType === 'below' && !belowSubscription) {
      setThresholdPercentage(0.2);
    }
  }, [alertType, aboveSubscription, belowSubscription]);
  
  const nextPrediction = stream.predictions?.[0];
  const maxPrediction = stream.predictions?.length > 0 
    ? stream.predictions.reduce((max, pred) => 
        pred.predictedLevel > max.predictedLevel ? pred : max
      )
    : null;

  // Check data availability for predictions
  const totalDaysNeeded = 41; // Today + 40 days in past
  const minDaysForPrediction = 38;
  const availableDays = stream.last30DaysHistorical?.length || 0;
  
  // Missing days = how many more days needed to reach 41
  const missingDays = Math.max(0, totalDaysNeeded - availableDays);
  
  // Debug logging for Hove and Nybolle stations
  if (stream.name.includes('Hove') || stream.name.includes('Nybolle')) {
    console.log(`${stream.name} Data Check:`, {
      availableDays,
      missingDays,
      hasHistorical: !!stream.last30DaysHistorical,
      hasRange: !!stream.last30DaysRange,
      rangeMinM: stream.last30DaysRange?.min_m,
      rangeMaxM: stream.last30DaysRange?.max_m,
      historicalDates: stream.last30DaysHistorical?.slice(0, 3).map(h => h.date)
    });
  }
  
  const hasInsufficientData = !stream.last30DaysHistorical || 
    availableDays < minDaysForPrediction || 
    !stream.last30DaysRange ||
    stream.last30DaysRange.min_m === 0 && stream.last30DaysRange.max_m === 0;
  
  const hasPartialData = availableDays >= minDaysForPrediction && availableDays < totalDaysNeeded;

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
    if (!canEditStation()) {
      toast({
        title: "Permission Denied",
        description: "You can only edit stations in your municipality.",
        variant: "destructive",
      });
      return;
    }

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
      const subscriptions = response.subscriptions.filter(sub => sub.station_id === stream.id);
      
      const above = subscriptions.find(sub => sub.alert_type === 'above');
      const below = subscriptions.find(sub => sub.alert_type === 'below');
      
      setAboveSubscription(above ? { threshold: above.threshold_percentage } : null);
      setBelowSubscription(below ? { threshold: below.threshold_percentage } : null);
      
      // Set default values for the dialog based on existing subscriptions or defaults
      if (above) {
        setThresholdPercentage(above.threshold_percentage);
        setAlertType('above');
      } else if (below) {
        setThresholdPercentage(below.threshold_percentage);
        setAlertType('below');
      } else {
        setThresholdPercentage(0.9);
        setAlertType('above');
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

      await subscribeToStation(stream.id, thresholdPercentage, token, alertType);
      
      // Update the appropriate subscription state
      if (alertType === 'above') {
        setAboveSubscription({ threshold: thresholdPercentage });
      } else {
        setBelowSubscription({ threshold: thresholdPercentage });
      }
      
      const alertDescription = alertType === 'above' 
        ? `when water level exceeds ${(thresholdPercentage * 100).toFixed(0)}% of max level (flooding risk)`
        : `when water level falls below ${(thresholdPercentage * 100).toFixed(0)}% of max level (drying out)`;
      
      toast({
        title: "Subscribed successfully",
        description: `You will receive alerts for station "${stream.name}" ${alertDescription}.`,
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
      setAboveSubscription(null);
      setBelowSubscription(null);
      
      toast({
        title: "Unsubscribed successfully",
        description: `You will no longer receive any alerts for station "${stream.name}".`,
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
    if (!canEditStation()) {
      toast({
        title: "Permission Denied",
        description: "You can only delete stations in your municipality.",
        variant: "destructive",
      });
      return;
    }

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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-display font-bold text-foreground tracking-tight">{stream.name}</h3>
            {stream.municipalityName && (
              <Badge 
                variant="secondary"
                className="flex items-center gap-1"
              >
                <Building2 className="h-3 w-3" />
                {stream.municipalityName}
              </Badge>
            )}
          </div>
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
                  ? `Insufficient Data (${availableDays}/41 days)` 
                  : hasPartialData
                  ? `Partial Data (${availableDays}/41 days)`
                  : `${stream.last30DaysRange.min_m.toFixed(3)}m - ${stream.last30DaysRange.max_m.toFixed(3)}m`
                }
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{stream.name} - 41 Day Historical Data</DialogTitle>
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

      {stream.pastPredictions && stream.pastPredictions.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="mt-3 p-3 rounded-lg border cursor-pointer transition-colors bg-indigo-100/50 dark:bg-indigo-900/30 border-indigo-200/50 dark:border-indigo-700/50 hover:bg-indigo-200/50 dark:hover:bg-indigo-800/30">
              <div className="text-center">
                <div className="text-xs font-semibold font-display mb-1 flex items-center justify-center gap-1 text-indigo-700 dark:text-indigo-300">
                  <Calendar className="h-3 w-3" />
                  Past Predictions
                </div>
                <div className="text-sm font-bold text-foreground font-display">
                  {(() => {
                    const dates = stream.pastPredictions.map(p => new Date(p.forecast_created_at));
                    const firstDate = new Date(Math.min(...dates.map(d => d.getTime())));
                    const lastDate = new Date(Math.max(...dates.map(d => d.getTime())));
                    return `${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`;
                  })()}
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{stream.name} - Past Predictions</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {(() => {
                // First group by date
                const byDate = stream.pastPredictions.reduce((groups, prediction) => {
                  const date = new Date(prediction.forecast_created_at).toLocaleDateString();
                  if (!groups[date]) {
                    groups[date] = [];
                  }
                  groups[date].push(prediction);
                  return groups;
                }, {} as Record<string, typeof stream.pastPredictions>);

                return Object.entries(byDate).map(([date, datePredictions]) => {
                  // Then group by timestamp within each date
                  const byTimestamp = datePredictions.reduce((groups, prediction) => {
                    const timestamp = prediction.forecast_created_at;
                    if (!groups[timestamp]) {
                      groups[timestamp] = [];
                    }
                    groups[timestamp].push(prediction);
                    return groups;
                  }, {} as Record<string, typeof stream.pastPredictions>);

                  const timestamps = Object.keys(byTimestamp);
                  const totalForecasts = timestamps.length;

                  return (
                    <Collapsible key={date} className="border rounded-lg">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg">
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold">Forecast created: {date}</span>
                          <span className="text-xs text-muted-foreground">{totalForecasts} forecast{totalForecasts > 1 ? 's' : ''}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 pt-2 space-y-3">
                        {Object.entries(byTimestamp).map(([timestamp, predictions]) => {
                          const time = new Date(timestamp).toLocaleTimeString();
                          return (
                            <Collapsible key={timestamp} className="border-l-2 border-indigo-300 dark:border-indigo-700 pl-3">
                              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/30 transition-colors rounded-lg">
                                <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                  Created at {time} ({predictions.length} predictions)
                                </div>
                                <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-2 space-y-2">
                                {predictions.map((prediction, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">For: {prediction.prediction_date}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-mono font-bold">{prediction.predicted_water_level_m.toFixed(3)}m</div>
                                      <div className="text-xs text-muted-foreground">{prediction.predicted_water_level_cm.toFixed(1)}cm</div>
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                });
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {isAdminView && (isAdmin || isSuperAdmin) && (
          <div className="flex gap-2 flex-wrap">
            {canEditStation() && (
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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isAdmin && !isSuperAdmin}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  {(aboveSubscription || belowSubscription) ? 'Subscribed' : 'Subscribe to Alerts'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Manage Alerts - {stream.name}</DialogTitle>
                  <DialogDescription>
                    You can subscribe to both flood alerts (water too high) and drain alerts (water too low).
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Current Subscriptions Status */}
                  {(aboveSubscription || belowSubscription) && (
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                      <p className="text-sm font-medium">Current Subscriptions:</p>
                      {aboveSubscription && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                          <span>Flood alert at {(aboveSubscription.threshold * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {belowSubscription && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                          <span>Drain alert at {(belowSubscription.threshold * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Alert Type</Label>
                    <Select value={alertType} onValueChange={(value: 'above' | 'below') => {
                      setAlertType(value);
                      // Auto-adjust threshold based on alert type and existing subscriptions
                      if (value === 'above') {
                        setThresholdPercentage(aboveSubscription?.threshold ?? 0.9);
                      } else {
                        setThresholdPercentage(belowSubscription?.threshold ?? 0.1);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            <span>Flood Alert (Above Threshold)</span>
                            {aboveSubscription && <span className="text-xs text-muted-foreground ml-2">✓ Active</span>}
                          </div>
                        </SelectItem>
                        <SelectItem value="below">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-blue-500" />
                            <span>Drain Alert (Below Threshold)</span>
                            {belowSubscription && <span className="text-xs text-muted-foreground ml-2">✓ Active</span>}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {alertType === 'above' 
                        ? '🌊 Get alerted when water level is too HIGH (flooding risk)'
                        : '💧 Get alerted when water level is too LOW (drying out)'
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Threshold: {(thresholdPercentage * 100).toFixed(0)}% of max level
                    </Label>
                    <Slider
                      value={[thresholdPercentage]}
                      onValueChange={(values) => setThresholdPercentage(values[0])}
                      min={0.05}
                      max={0.95}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5%</span>
                      <span>95%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alertType === 'above' 
                        ? `Alert when water exceeds ${(thresholdPercentage * 100).toFixed(0)}% of max level`
                        : `Alert when water falls below ${(thresholdPercentage * 100).toFixed(0)}% of max level`
                      }
                    </p>
                  </div>

                  {((alertType === 'above' && aboveSubscription) || (alertType === 'below' && belowSubscription)) && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-sm">
                      <p className="text-amber-900 dark:text-amber-100">
                        You already have a {alertType === 'above' ? 'flood' : 'drain'} alert. Subscribing again will update the threshold.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 flex-col sm:flex-row">
                  {(aboveSubscription || belowSubscription) && (
                    <Button
                      variant="destructive"
                      onClick={handleUnsubscribe}
                      disabled={isSubscribing}
                      className="w-full sm:w-auto"
                    >
                      {isSubscribing ? 'Processing...' : 'Unsubscribe from All'}
                    </Button>
                  )}
                  <Button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="w-full sm:w-auto"
                  >
                    {isSubscribing ? 'Subscribing...' : (
                      (alertType === 'above' && aboveSubscription) || (alertType === 'below' && belowSubscription)
                        ? 'Update Alert'
                        : 'Subscribe'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {canEditStation() && (
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
            )}
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
