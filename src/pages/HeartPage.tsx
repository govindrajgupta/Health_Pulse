import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Minus
} from 'lucide-react';
import { useSmartBand } from '../hooks/useSmartBand';
import Chart from '../components/common/Chart';

interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

const HeartPage: React.FC = () => {
  const { data: smartBandData, getHistoricalData } = useSmartBand();
  const [historicalData, setHistoricalData] = useState(getHistoricalData(7));
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState(0);

  // Heart rate zones (based on max HR formula: 220 - age, assuming age 25)
  const maxHeartRate = 195; // 220 - 25
  const zones: HeartRateZone[] = [
    { name: 'Resting', min: 40, max: 70, color: '#3b82f6', description: 'Normal resting heart rate' },
    { name: 'Light', min: 70, max: 117, color: '#10b981', description: 'Fat burning zone' },
    { name: 'Moderate', min: 117, max: 137, color: '#fbbf24', description: 'Cardio zone' },
    { name: 'Hard', min: 137, max: 156, color: '#f97316', description: 'Anaerobic zone' },
    { name: 'Maximum', min: 156, max: 195, color: '#ef4444', description: 'Maximum effort' },
  ];

  // Get current heart rate zone
  const getCurrentZone = () => {
    return zones.find(zone => 
      smartBandData.heartRate >= zone.min && smartBandData.heartRate <= zone.max
    ) || zones[0];
  };

  // Calculate cardiovascular risk score
  const calculateRiskScore = () => {
    let score = 0;
    
    // Resting heart rate risk
    if (smartBandData.heartRate > 80) score += 20;
    else if (smartBandData.heartRate < 60) score -= 10;
    
    // Blood oxygen risk
    if (smartBandData.bloodOxygen < 95) score += 30;
    
    // Stress level impact
    score += smartBandData.stressLevel * 0.3;
    
    // Activity level (inverse - more activity is better)
    if (smartBandData.activeMinutes < 30) score += 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Get risk assessment
  const getRiskAssessment = (score: number) => {
    if (score < 20) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={24} /> };
    if (score < 40) return { level: 'Low-Moderate', color: 'text-blue-600', bg: 'bg-blue-50', icon: <CheckCircle size={24} /> };
    if (score < 60) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <AlertTriangle size={24} /> };
    if (score < 80) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50', icon: <AlertCircle size={24} /> };
    return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={24} /> };
  };

  // Track heart rate history for real-time chart
  useEffect(() => {
    const newRate = smartBandData.heartRate;
    const newTime = new Date().toLocaleTimeString();

    setHeartRateHistory(prev => {
      const updated = [...prev, newRate];
      return updated.length > 20 ? updated.slice(-20) : updated; // Keep last 20 readings
    });

    setTimeLabels(prev => {
      const updated = [...prev, newTime];
      return updated.length > 20 ? updated.slice(-20) : updated;
    });

    setRiskScore(calculateRiskScore());
  }, [smartBandData.heartRate, smartBandData.bloodOxygen, smartBandData.stressLevel, smartBandData.activeMinutes]);

  // Prepare real-time chart data
  const realtimeChartData = {
    labels: timeLabels,
    datasets: [{
      label: 'Heart Rate (BPM)',
      data: heartRateHistory,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  // Prepare historical chart data
  const historicalChartData = {
    labels: historicalData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Average Heart Rate',
      data: historicalData.map(d => d.heartRate),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const currentZone = getCurrentZone();
  const riskAssessment = getRiskAssessment(riskScore);

  // Get heart rate variability indicator
  const getHRVStatus = () => {
    const variation = heartRateHistory.length > 5 
      ? Math.max(...heartRateHistory.slice(-5)) - Math.min(...heartRateHistory.slice(-5))
      : 0;
    
    if (variation < 5) return { status: 'Low', color: 'text-yellow-600', icon: <Minus size={16} /> };
    if (variation < 15) return { status: 'Normal', color: 'text-green-600', icon: <CheckCircle size={16} /> };
    return { status: 'High', color: 'text-red-600', icon: <TrendingUp size={16} /> };
  };

  const hrvStatus = getHRVStatus();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Heart Health Assessment
        </h1>
        <p className="text-slate-600">
          Monitor your cardiovascular health and risk factors in real-time
        </p>
      </header>

      {/* Real-time Heart Rate Monitor */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-sm border border-red-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className="text-red-600 animate-pulse" size={32} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Live Heart Rate</h2>
              <p className="text-sm text-slate-600">Real-time monitoring</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-red-600">{smartBandData.heartRate}</div>
            <div className="text-sm text-slate-600">BPM</div>
          </div>
        </div>

        {/* Current Zone Indicator */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border" style={{ borderColor: currentZone.color }}>
          <Zap className="flex-shrink-0" style={{ color: currentZone.color }} size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-800">Current Zone: {currentZone.name}</p>
            <p className="text-xs text-slate-600">{currentZone.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{currentZone.min}-{currentZone.max} BPM</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Resting HR */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="text-blue-600" size={20} />
            <h3 className="font-semibold text-slate-700 text-sm">Resting HR</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{smartBandData.heartRate}</p>
          <p className="text-xs text-slate-500">Current reading</p>
        </div>

        {/* Max HR */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-red-600" size={20} />
            <h3 className="font-semibold text-slate-700 text-sm">Max HR</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{maxHeartRate}</p>
          <p className="text-xs text-slate-500">Estimated maximum</p>
        </div>

        {/* SpO2 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-green-600" size={20} />
            <h3 className="font-semibold text-slate-700 text-sm">Blood Oxygen</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{smartBandData.bloodOxygen}%</p>
          <p className="text-xs text-slate-500">Current SpO2</p>
        </div>

        {/* HRV */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className={hrvStatus.color} size={20} />
            <h3 className="font-semibold text-slate-700 text-sm">Variability</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${hrvStatus.color}`}>{hrvStatus.status}</p>
            {hrvStatus.icon}
          </div>
          <p className="text-xs text-slate-500">Heart rate variation</p>
        </div>
      </div>

      {/* Risk Assessment Card */}
      <div className={`${riskAssessment.bg} border-2 rounded-xl p-6 mb-6`} style={{ borderColor: riskAssessment.color.replace('text-', '#') }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={riskAssessment.color}>
              {riskAssessment.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Cardiovascular Risk: {riskAssessment.level}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                Based on your current heart rate, activity level, and vital signs
              </p>
              
              {/* Risk Score Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Risk Score</span>
                  <span>{riskScore}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${riskScore}%`,
                      backgroundColor: riskScore < 40 ? '#10b981' : riskScore < 60 ? '#fbbf24' : '#ef4444'
                    }}
                  />
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                {smartBandData.heartRate > 100 && (
                  <p className="text-sm text-slate-700">⚠️ Elevated heart rate detected. Consider rest or relaxation exercises.</p>
                )}
                {smartBandData.bloodOxygen < 95 && (
                  <p className="text-sm text-slate-700">⚠️ Blood oxygen is low. Ensure proper breathing and ventilation.</p>
                )}
                {smartBandData.activeMinutes < 30 && (
                  <p className="text-sm text-slate-700">💡 Low activity today. Aim for at least 30 minutes of moderate exercise.</p>
                )}
                {smartBandData.stressLevel > 70 && (
                  <p className="text-sm text-slate-700">😰 High stress levels may affect heart health. Practice stress management.</p>
                )}
                {riskScore < 30 && (
                  <p className="text-sm text-slate-700">✅ Your cardiovascular metrics look healthy! Keep up the good work.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heart Rate Zones Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Heart Rate Zones</h3>
        <div className="space-y-3 mb-6">
          {zones.map((zone) => {
            const isCurrentZone = currentZone.name === zone.name;
            return (
              <div key={zone.name} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-slate-700">{zone.name}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="h-full flex items-center px-3 text-white text-sm font-medium transition-all"
                    style={{ 
                      width: `${((zone.max - zone.min) / maxHeartRate) * 100}%`,
                      backgroundColor: zone.color,
                      opacity: isCurrentZone ? 1 : 0.6
                    }}
                  >
                    {zone.min}-{zone.max} BPM
                  </div>
                  {isCurrentZone && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="w-32 text-xs text-slate-600">{zone.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Real-time Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Real-Time Monitor</h3>
          <Chart data={realtimeChartData} height={250} />
          <p className="text-xs text-slate-500 mt-2 text-center">Last 20 readings</p>
        </div>

        {/* Historical Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">7-Day Average</h3>
          <Chart data={historicalChartData} height={250} />
          <p className="text-xs text-slate-500 mt-2 text-center">Daily average heart rate</p>
        </div>
      </div>

      {/* Health Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">💡 Heart Health Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-slate-800 mb-2">🏃 Stay Active</h4>
            <p className="text-sm text-slate-600">
              Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-slate-800 mb-2">🥗 Eat Healthy</h4>
            <p className="text-sm text-slate-600">
              Focus on fruits, vegetables, whole grains, and lean proteins. Limit saturated fats and sodium.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-slate-800 mb-2">😴 Sleep Well</h4>
            <p className="text-sm text-slate-600">
              Get 7-9 hours of quality sleep each night. Good sleep helps regulate heart health and stress.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-slate-800 mb-2">🧘 Manage Stress</h4>
            <p className="text-sm text-slate-600">
              Practice relaxation techniques like meditation, yoga, or deep breathing to reduce stress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartPage;