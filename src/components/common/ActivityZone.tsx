import React from 'react';
import { Activity } from 'lucide-react';

interface ActivityZoneProps {
  heartRate: number;
  steps: number;
  stressLevel: number;
}

const ActivityZone: React.FC<ActivityZoneProps> = ({ heartRate, steps, stressLevel }) => {
  // Determine activity zone based on heart rate
  const getZone = () => {
    if (heartRate < 60) return { name: 'Resting', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (heartRate < 90) return { name: 'Light Activity', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (heartRate < 120) return { name: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (heartRate < 150) return { name: 'Vigorous', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { name: 'Peak', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const zone = getZone();

  // Calculate intensity percentage
  const maxHeartRate = 220 - 25; // Assuming age 25, adjust as needed
  const intensity = Math.round((heartRate / maxHeartRate) * 100);

  return (
    <div className={`${zone.bg} ${zone.border} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={zone.color} size={20} />
          <h3 className="font-semibold text-slate-800">Activity Zone</h3>
        </div>
        <span className={`${zone.color} font-bold text-lg`}>{zone.name}</span>
      </div>

      {/* Intensity Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Intensity</span>
          <span>{intensity}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              intensity < 40 ? 'bg-blue-500' :
              intensity < 60 ? 'bg-green-500' :
              intensity < 75 ? 'bg-yellow-500' :
              intensity < 90 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(intensity, 100)}%` }}
          />
        </div>
      </div>

      {/* Zone Details */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded p-2">
          <p className="text-xs text-slate-500">Heart Rate</p>
          <p className={`font-bold ${zone.color}`}>{heartRate}</p>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-xs text-slate-500">Steps/min</p>
          <p className="font-bold text-slate-700">{Math.round(steps / 60)}</p>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-xs text-slate-500">Stress</p>
          <p className="font-bold text-slate-700">{stressLevel}%</p>
        </div>
      </div>

      {/* Zone Guidance */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          {intensity < 40 && '💙 Perfect for recovery and daily activities'}
          {intensity >= 40 && intensity < 60 && '💚 Great for fat burning and endurance'}
          {intensity >= 60 && intensity < 75 && '💛 Cardio zone - improving fitness'}
          {intensity >= 75 && intensity < 90 && '🧡 High intensity - building strength'}
          {intensity >= 90 && '❤️ Maximum effort - use caution'}
        </p>
      </div>
    </div>
  );
};

export default ActivityZone;
