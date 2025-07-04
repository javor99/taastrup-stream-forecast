
import React from 'react';
import { MapPin, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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

  const getStatusIcon = () => {
    switch (stream.status) {
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'danger':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTrendIcon = () => {
    switch (stream.trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (stream.status) {
      case 'normal':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${getStatusColor()} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{stream.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{stream.location.address}</span>
          </div>
          <div className="text-xs text-gray-500">
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
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xs font-medium text-blue-700">Current</div>
          <div className="text-lg font-bold text-blue-900">{stream.currentLevel}m</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-xs font-medium text-purple-700">Tomorrow</div>
          <div className="text-lg font-bold text-purple-900">{nextPrediction.predictedLevel}m</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-xs font-medium text-orange-700">7-Day Max</div>
          <div className="text-lg font-bold text-orange-900">{maxPrediction.predictedLevel}m</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          Updated {stream.lastUpdated.toLocaleTimeString('da-DK', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          stream.status === 'normal' ? 'bg-green-100 text-green-800' :
          stream.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {stream.status.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
