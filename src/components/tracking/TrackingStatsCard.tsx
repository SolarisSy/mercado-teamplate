import React from 'react';

interface TrackingStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

const TrackingStatsCard: React.FC<TrackingStatsCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {trend && (
              <span 
                className={`ml-2 text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-gray-600 text-xs mt-1">{description}</p>
          )}
        </div>
        <div className="text-2xl text-gray-400">{icon}</div>
      </div>
    </div>
  );
};

export default TrackingStatsCard; 