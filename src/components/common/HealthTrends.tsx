import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface HealthTrend {
  metric: string;
  current: number;
  previous: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface HealthTrendsProps {
  currentData: {
    heartRate: number;
    steps: number;
    caloriesBurned: number;
    bloodOxygen: number;
    stressLevel: number;
  };
}

const HealthTrends: React.FC<HealthTrendsProps> = ({ currentData }) => {
  const [previousData, setPreviousData] = useState(currentData);
  const [showTrends, setShowTrends] = useState(false);

  useEffect(() => {
    // Update previous data every 10 seconds for trend calculation
    const interval = setInterval(() => {
      setPreviousData(currentData);
      setShowTrends(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentData]);

  const getTrendIcon = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) return { icon: <Minus size={16} />, color: 'text-slate-400', text: 'Stable' };
    if (current > previous) return { icon: <TrendingUp size={16} />, color: 'text-green-600', text: 'Up' };
    return { icon: <TrendingDown size={16} />, color: 'text-red-600', text: 'Down' };
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.abs(((current - previous) / previous) * 100).toFixed(1);
  };

  const trends: HealthTrend[] = [
    {
      metric: 'Heart Rate',
      current: currentData.heartRate,
      previous: previousData.heartRate,
      unit: 'BPM',
      icon: '❤️',
      color: 'text-red-600',
    },
    {
      metric: 'Steps',
      current: currentData.steps,
      previous: previousData.steps,
      unit: 'steps',
      icon: '👣',
      color: 'text-green-600',
    },
    {
      metric: 'Calories',
      current: currentData.caloriesBurned,
      previous: previousData.caloriesBurned,
      unit: 'kcal',
      icon: '🔥',
      color: 'text-orange-600',
    },
    {
      metric: 'SpO2',
      current: currentData.bloodOxygen,
      previous: previousData.bloodOxygen,
      unit: '%',
      icon: '🫁',
      color: 'text-blue-600',
    },
    {
      metric: 'Stress',
      current: currentData.stressLevel,
      previous: previousData.stressLevel,
      unit: '%',
      icon: '🧠',
      color: 'text-purple-600',
    },
  ];

  if (!showTrends) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Activity className="animate-pulse" size={20} />
          <p className="text-sm">Collecting trend data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Trends</h3>
      
      <div className="space-y-3">
        {trends.map((trend) => {
          const trendInfo = getTrendIcon(trend.current, trend.previous);
          const changePercent = getChangePercentage(trend.current, trend.previous);
          
          return (
            <div key={trend.metric} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{trend.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{trend.metric}</p>
                  <p className={`text-lg font-bold ${trend.color}`}>
                    {trend.current.toLocaleString()} {trend.unit}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 ${trendInfo.color}`}>
                {trendInfo.icon}
                <span className="text-sm font-medium">
                  {changePercent !== '0.0' ? `${changePercent}%` : trendInfo.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Trends calculated from last 10 seconds of data
        </p>
      </div>
    </div>
  );
};

export default HealthTrends;
