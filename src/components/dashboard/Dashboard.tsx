import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Heart, 
  Moon,
  BrainCircuit, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Droplets,
  Thermometer,
  Battery,
  Bluetooth,
  BluetoothOff,
  Play,
  Pause
} from 'lucide-react';
import { useSmartBand } from '../../hooks/useSmartBand';
import MetricCard from '../common/MetricCard';
import Chart from '../common/Chart';
import BluetoothConnect from '../common/BluetoothConnect';
import ActivityZone from '../common/ActivityZone';
import AchievementTracker from '../common/AchievementTracker';
import HealthTrends from '../common/HealthTrends';
import DataExport from '../common/DataExport';
import ConnectionQuality from '../common/ConnectionQuality';

const Dashboard: React.FC = () => {
  const { 
    data: smartBandData, 
    isSimulating, 
    dataSource,
    startSimulation, 
    stopSimulation,
    toggleConnection,
    getHistoricalData,
    getProgress
  } = useSmartBand();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [historicalData, setHistoricalData] = useState(getHistoricalData(7));
  
  // Don't auto-start - wait for device connection

  // Update historical data when timeframe changes
  useEffect(() => {
    const days = selectedTimeframe === 'day' ? 1 : selectedTimeframe === 'week' ? 7 : 30;
    setHistoricalData(getHistoricalData(days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeframe]);

  // Prepare chart data from historical data
  const prepareChartData = (field: 'heartRate' | 'steps' | 'calories' | 'sleep') => {
    return {
      labels: historicalData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: field.charAt(0).toUpperCase() + field.slice(1),
        data: historicalData.map(d => d[field]),
        borderColor: field === 'heartRate' ? 'rgb(239, 68, 68)' : 
                     field === 'steps' ? 'rgb(34, 197, 94)' :
                     field === 'calories' ? 'rgb(249, 115, 22)' :
                     'rgb(59, 130, 246)',
        backgroundColor: field === 'heartRate' ? 'rgba(239, 68, 68, 0.1)' : 
                        field === 'steps' ? 'rgba(34, 197, 94, 0.1)' :
                        field === 'calories' ? 'rgba(249, 115, 22, 0.1)' :
                        'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    };
  };

  const progress = getProgress();

  // Generate AI insights based on smart band data
  const generateInsights = () => {
    const insights = [];
    
    if (smartBandData.steps >= 10000) {
      insights.push("🎯 Great job! You've reached your daily step goal!");
    } else {
      const remaining = 10000 - smartBandData.steps;
      insights.push(`🚶 ${remaining.toLocaleString()} more steps to reach your daily goal!`);
    }
    
    if (smartBandData.heartRate > 100) {
      insights.push("💓 Your heart rate is elevated. Consider taking a break.");
    } else if (smartBandData.heartRate < 70) {
      insights.push("💚 Excellent resting heart rate! Your fitness level is great.");
    }
    
    if (smartBandData.bloodOxygen < 95) {
      insights.push("⚠️ Blood oxygen is low. Ensure you're breathing well.");
    } else {
      insights.push("✨ Blood oxygen levels are optimal!");
    }
    
    if (smartBandData.stressLevel > 70) {
      insights.push("😰 High stress detected. Try some breathing exercises.");
    } else if (smartBandData.stressLevel < 30) {
      insights.push("😌 Your stress levels are well managed today!");
    }
    
    if (smartBandData.batteryLevel < 20) {
      insights.push("🔋 Smart band battery is low. Remember to charge it!");
    }
    
    return insights;
  };

  const insights = generateInsights();
  
  // Show setup screen if no device connected
  const showSetupScreen = !smartBandData.isConnected && dataSource !== 'bluetooth';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Setup Screen - Show when no device connected */}
      {showSetupScreen ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <Bluetooth className="text-blue-600" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Connect Your Smart Watch
              </h1>
              <p className="text-slate-600 text-lg">
                Pair your device to start monitoring your health data in real-time
              </p>
            </div>
            
            <BluetoothConnect />
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Heart className="text-red-500 mx-auto mb-2" size={32} />
                <p className="text-sm font-medium text-slate-700">Heart Rate</p>
                <p className="text-xs text-slate-500">Real-time monitoring</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Activity className="text-green-500 mx-auto mb-2" size={32} />
                <p className="text-sm font-medium text-slate-700">Activity</p>
                <p className="text-xs text-slate-500">Steps & calories</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Moon className="text-blue-500 mx-auto mb-2" size={32} />
                <p className="text-sm font-medium text-slate-700">Sleep</p>
                <p className="text-xs text-slate-500">Quality tracking</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Welcome header with device status */}
          <header className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  Smart Band Monitor
                </h1>
                <p className="text-slate-600">
                  Real-time data from your wearable device
            </p>
          </div>
          
          {/* Device Status */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              dataSource === 'bluetooth' ? 'bg-blue-50' : 
              smartBandData.isConnected ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              {dataSource === 'bluetooth' ? (
                <>
                  <Bluetooth className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-blue-700">Real Device</span>
                </>
              ) : smartBandData.isConnected ? (
                <>
                  <Bluetooth className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-green-700">Simulated</span>
                </>
              ) : (
                <>
                  <BluetoothOff className="text-yellow-600" size={20} />
                  <span className="text-sm font-medium text-yellow-700">Paused</span>
                </>
              )}
            </div>
            
            <button
              onClick={() => isSimulating ? stopSimulation() : startSimulation()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isSimulating ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
              }`}
            >
              {isSimulating ? <Pause size={20} /> : <Play size={20} />}
              <span className="text-sm font-medium">
                {isSimulating ? 'Pause' : 'Start'} Sync
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Time range selector */}
      <div className="mb-6 flex items-center justify-between">
        <div className="inline-flex items-center bg-slate-100 rounded-lg p-1" role="group">
          {['day', 'week', 'month'].map((timeframe) => (
            <button
              key={timeframe}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                selectedTimeframe === timeframe
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-700'
              }`}
              onClick={() => setSelectedTimeframe(timeframe as 'day' | 'week' | 'month')}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Real-time Vital Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Heart Rate"
          value={`${smartBandData.heartRate}`}
          description="BPM - Live"
          icon={<Heart size={24} />}
          color="red"
          link="/heart"
        />
        
        <MetricCard
          title="Blood Oxygen"
          value={`${smartBandData.bloodOxygen}%`}
          description="SpO2 Level"
          icon={<Droplets size={24} />}
          color="blue"
          link="/heart"
        />
        
        <MetricCard
          title="Body Temp"
          value={`${smartBandData.temperature}°C`}
          description="Current temperature"
          icon={<Thermometer size={24} />}
          color="orange"
        />
        
        <MetricCard
          title="Battery"
          value={`${smartBandData.batteryLevel}%`}
          description="Device battery"
          icon={<Battery size={24} />}
          color="green"
        />
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Daily Steps"
          value={smartBandData.steps.toLocaleString()}
          description={`${smartBandData.distance} km • Goal: 10,000`}
          icon={<Activity size={24} />}
          trend={{ value: progress.steps, isPositive: true }}
          color="green"
          link="/activity"
        />
        
        <MetricCard
          title="Calories Burned"
          value={smartBandData.caloriesBurned}
          description={`Active: ${smartBandData.activeMinutes} min`}
          icon={<TrendingUp size={24} />}
          trend={{ value: progress.calories, isPositive: true }}
          color="orange"
          link="/activity"
        />
        
        <MetricCard
          title="Stress Level"
          value={`${smartBandData.stressLevel}%`}
          description={smartBandData.stressLevel < 30 ? 'Low stress' : smartBandData.stressLevel < 70 ? 'Moderate' : 'High stress'}
          icon={<BrainCircuit size={24} />}
          color="purple"
          link="/stress"
        />
      </div>

      {/* Enhanced Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ActivityZone 
          heartRate={smartBandData.heartRate}
          steps={smartBandData.steps}
          stressLevel={smartBandData.stressLevel}
        />
        <AchievementTracker
          steps={smartBandData.steps}
          heartRate={smartBandData.heartRate}
          caloriesBurned={smartBandData.caloriesBurned}
          activeMinutes={smartBandData.activeMinutes}
        />
      </div>

      {/* Health Trends */}
      <div className="mb-6">
        <HealthTrends currentData={{
          heartRate: smartBandData.heartRate,
          steps: smartBandData.steps,
          caloriesBurned: smartBandData.caloriesBurned,
          bloodOxygen: smartBandData.bloodOxygen,
          stressLevel: smartBandData.stressLevel,
        }} />
      </div>

      {/* Sleep Analysis Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Last Night's Sleep Analysis</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <Moon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-1">Deep Sleep</p>
            <p className="text-lg font-bold text-slate-800">{smartBandData.sleepData.deepSleep}m</p>
          </div>
          
          <div className="text-center">
            <Moon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-1">Light Sleep</p>
            <p className="text-lg font-bold text-slate-800">{smartBandData.sleepData.lightSleep}m</p>
          </div>
          
          <div className="text-center">
            <Moon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-1">REM Sleep</p>
            <p className="text-lg font-bold text-slate-800">{smartBandData.sleepData.remSleep}m</p>
          </div>
          
          <div className="text-center">
            <Moon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-1">Awake</p>
            <p className="text-lg font-bold text-slate-800">{smartBandData.sleepData.awake}m</p>
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
              smartBandData.sleepData.sleepQuality === 'Excellent' ? 'bg-green-100' :
              smartBandData.sleepData.sleepQuality === 'Good' ? 'bg-blue-100' :
              smartBandData.sleepData.sleepQuality === 'Fair' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                smartBandData.sleepData.sleepQuality === 'Excellent' ? 'text-green-600' :
                smartBandData.sleepData.sleepQuality === 'Good' ? 'text-blue-600' :
                smartBandData.sleepData.sleepQuality === 'Fair' ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <p className="text-sm text-slate-500 mb-1">Quality</p>
            <p className="text-lg font-bold text-slate-800">{smartBandData.sleepData.sleepQuality}</p>
          </div>
        </div>
      </div>

      {/* Charts section - Historical Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Heart Rate Trends</h2>
            <a href="/heart" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              Details <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          <Chart data={prepareChartData('heartRate')} height={220} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Daily Steps</h2>
            <a href="/activity" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              Details <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          <Chart data={prepareChartData('steps')} type="bar" height={220} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Calories Burned</h2>
            <a href="/activity" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              Details <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          <Chart data={prepareChartData('calories')} height={220} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Sleep Duration</h2>
            <a href="/sleep" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              Details <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          <Chart data={prepareChartData('sleep')} height={220} />
        </div>
      </div>

      {/* Additional Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ConnectionQuality 
          isConnected={smartBandData.isConnected}
          dataSource={dataSource}
          lastUpdate={smartBandData.timestamp}
        />
        <DataExport 
          currentData={smartBandData}
          historicalData={historicalData}
        />
      </div>

      {/* AI Health Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Smart Band Insights</h2>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Real-time Analysis
          </span>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <span className="text-xl flex-shrink-0">{insight.split(' ')[0]}</span>
              <p className="text-slate-700">{insight.substring(insight.indexOf(' ') + 1)}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button 
            onClick={toggleConnection}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            {smartBandData.isConnected ? 'Disconnect' : 'Connect'} Device
          </button>
          <button 
            onClick={() => window.location.href = '/analytics'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>
      
      {/* Bluetooth Connection Section */}
      <div className="mb-6">
        <BluetoothConnect />
      </div>

      {/* Live Data Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Live Monitoring Active</p>
              <p className="text-xs text-slate-600">
                Last updated: {smartBandData.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {dataSource === 'bluetooth' ? '🔵 Real Device Data' : '🟡 Simulated Data'}
            </p>
            <p className="text-xs text-slate-500">Device ID: SB-{smartBandData.batteryLevel}{smartBandData.heartRate}</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;