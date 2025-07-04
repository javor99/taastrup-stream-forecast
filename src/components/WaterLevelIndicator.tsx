
import React from 'react';
import { Stream } from '@/types/stream';

interface WaterLevelIndicatorProps {
  stream: Stream;
}

export const WaterLevelIndicator: React.FC<WaterLevelIndicatorProps> = ({ stream }) => {
  const currentPercentage = (stream.currentLevel / stream.maxLevel) * 100;

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Water Level (meters)</span>
        <span className="text-sm text-gray-500">Max: {stream.maxLevel}m</span>
      </div>
      
      {/* Current Level Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-blue-600 font-medium">Current</span>
          <span className="text-xs text-gray-500">{stream.currentLevel}m ({currentPercentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getBarColor(currentPercentage)}`}
            style={{ width: `${Math.min(currentPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* 7-Day Predictions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">7-Day Forecast</h4>
        <div className="space-y-2">
          {stream.predictions.map((prediction, index) => {
            const predictedPercentage = (prediction.predictedLevel / stream.maxLevel) * 100;
            const dayName = index === 0 ? 'Tomorrow' : 
                          index === 1 ? 'Day +2' : 
                          `Day +${index + 1}`;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-600 font-medium">{dayName}</span>
                  <span className="text-xs text-gray-500">
                    {prediction.predictedLevel}m ({predictedPercentage.toFixed(1)}%) - {prediction.confidence}% confidence
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 opacity-70 ${getBarColor(predictedPercentage)}`}
                    style={{ width: `${Math.min(predictedPercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
