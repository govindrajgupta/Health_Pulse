import React, { useState, useEffect } from 'react';
import { Signal, WifiOff, Wifi } from 'lucide-react';

interface ConnectionQualityProps {
  isConnected: boolean;
  dataSource: 'simulation' | 'bluetooth';
  lastUpdate: Date;
}

const ConnectionQuality: React.FC<ConnectionQualityProps> = ({
  isConnected,
  dataSource,
  lastUpdate,
}) => {
  const [signalStrength, setSignalStrength] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const secondsSinceUpdate = (Date.now() - lastUpdate.getTime()) / 1000;
      setTimeSinceUpdate(Math.floor(secondsSinceUpdate));

      // Determine signal strength based on update frequency
      if (secondsSinceUpdate < 5) {
        setSignalStrength('excellent');
      } else if (secondsSinceUpdate < 10) {
        setSignalStrength('good');
      } else if (secondsSinceUpdate < 20) {
        setSignalStrength('fair');
      } else {
        setSignalStrength('poor');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const getSignalColor = () => {
    switch (signalStrength) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
    }
  };

  const getSignalBars = () => {
    switch (signalStrength) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'fair': return 2;
      case 'poor': return 1;
    }
  };

  const getBgColor = () => {
    switch (signalStrength) {
      case 'excellent': return 'bg-green-50 border-green-200';
      case 'good': return 'bg-blue-50 border-blue-200';
      case 'fair': return 'bg-yellow-50 border-yellow-200';
      case 'poor': return 'bg-red-50 border-red-200';
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
        <WifiOff className="text-slate-400" size={20} />
        <div>
          <p className="text-sm font-medium text-slate-600">Not Connected</p>
          <p className="text-xs text-slate-500">Connect a device to start monitoring</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {dataSource === 'bluetooth' ? (
            <Signal className={getSignalColor()} size={20} />
          ) : (
            <Wifi className="text-green-600" size={20} />
          )}
          <div>
            <p className={`text-sm font-medium ${getSignalColor()}`}>
              {dataSource === 'bluetooth' ? 'Bluetooth Connection' : 'Simulation Active'}
            </p>
            <p className="text-xs text-slate-600">
              {dataSource === 'bluetooth' 
                ? `Signal: ${signalStrength.charAt(0).toUpperCase() + signalStrength.slice(1)}`
                : 'Real-time simulation running'}
            </p>
          </div>
        </div>

        {dataSource === 'bluetooth' && (
          <div className="flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-t transition-all ${
                  bar <= getSignalBars() ? getSignalColor().replace('text', 'bg') : 'bg-slate-300'
                }`}
                style={{ height: `${bar * 25}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          Last update: {timeSinceUpdate === 0 ? 'just now' : `${timeSinceUpdate}s ago`}
        </p>
      </div>
    </div>
  );
};

export default ConnectionQuality;
