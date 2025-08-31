
import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Stream } from '@/types/stream';
import { WaterLevelIndicator } from './WaterLevelIndicator';

interface StreamCardProps {
  stream: Stream;
}

export const StreamCard: React.FC<StreamCardProps> = ({ stream }) => {
  const nextPrediction = stream.predictions[0];
  const maxPrediction = stream.predictions.reduce((max, pred) => 
    pred.predictedLevel > max.predictedLevel ? pred : max
  );

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

  return (
    <div className={`bg-card/90 backdrop-blur-sm rounded-xl shadow-lg border-2 ${getStatusColor()} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-card/95 hover:scale-105 animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground mb-1 tracking-tight">{stream.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2 font-medium">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{stream.location.address}</span>
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

      <div className="grid grid-cols-4 gap-3 mt-4">
        <div className="text-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
          <div className="text-xs font-semibold text-primary dark:text-blue-300 font-display">Current</div>
          <div className="text-lg font-bold text-foreground font-display">{stream.currentLevel}m</div>
        </div>
        <div className="text-center p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 font-display">{getTomorrowName()}</div>
          <div className="text-lg font-bold text-foreground font-display">{nextPrediction.predictedLevel}m</div>
        </div>
        <div className="text-center p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
          <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 font-display">7-Day Max</div>
          <div className="text-lg font-bold text-foreground font-display">{maxPrediction.predictedLevel}m</div>
        </div>
        <div className="text-center p-3 bg-cyan-100/50 dark:bg-cyan-900/30 rounded-lg border border-cyan-200/50 dark:border-cyan-700/50">
          <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 font-display">30-Day Range</div>
          <div className="text-sm font-bold text-foreground font-display">{stream.last30DaysRange.min_m}m - {stream.last30DaysRange.max_m}m</div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 pt-4 border-t border-border">
        <div className={`px-3 py-1 rounded-full text-xs font-bold font-display tracking-wide ${
          stream.status === 'normal' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' :
          stream.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200' :
          'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
        }`}>
          {stream.status.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
