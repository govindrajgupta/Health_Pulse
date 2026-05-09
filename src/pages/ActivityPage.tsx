import React, { useState, useEffect } from 'react';
import { Activity, Flame, MapPin, Clock, TrendingUp, ArrowLeft, Loader, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchActivityRecords } from '../lib/supabaseDataService';
import Chart from '../components/common/Chart';
import ProgressCircle from '../components/common/ProgressCircle';
import { format, subDays } from 'date-fns';

const ActivityPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '180d'>('30d');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchActivityRecords(user.id, 180).then(({ data }) => {
      setRecords(data);
      setLoading(false);
    });
  }, [user?.id]);

  const rangeMap = { '7d': 7, '30d': 30, '90d': 90, '180d': 180 };
  const filteredRecords = records.slice(-rangeMap[timeRange]);

  // Compute stats
  const totalSteps = filteredRecords.reduce((s, r) => s + (r.steps || 0), 0);
  const totalCals = filteredRecords.reduce((s, r) => s + (r.calories_burned || 0), 0);
  const totalDist = filteredRecords.reduce((s, r) => s + (r.distance || 0), 0);
  const totalActive = filteredRecords.reduce((s, r) => s + (r.active_minutes || 0), 0);
  const avgSteps = filteredRecords.length > 0 ? Math.round(totalSteps / filteredRecords.length) : 0;
  const avgCals = filteredRecords.length > 0 ? Math.round(totalCals / filteredRecords.length) : 0;

  const today = filteredRecords.length > 0 ? filteredRecords[filteredRecords.length - 1] : null;
  const stepGoal = 10000;
  const stepPct = today ? Math.min(Math.round((today.steps / stepGoal) * 100), 100) : 0;

  // Chart data
  const chartLabels = filteredRecords.map(r => format(new Date(r.recorded_at), timeRange === '7d' ? 'EEE' : 'MMM d'));
  const stepsChart = {
    labels: chartLabels,
    datasets: [{
      label: 'Steps',
      data: filteredRecords.map(r => r.steps),
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f620',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }],
  };
  const caloriesChart = {
    labels: chartLabels,
    datasets: [{
      label: 'Calories Burned',
      data: filteredRecords.map(r => r.calories_burned),
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b20',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-2 text-sm">
            <ArrowLeft size={16} className="mr-1" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Activity Tracker</h1>
          <p className="text-slate-500">6 months of activity data • {records.length} records</p>
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          {(['7d', '30d', '90d', '180d'] as const).map(t => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium ${timeRange === t ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? '3 Months' : '6 Months'}
            </button>
          ))}
        </div>
      </header>

      {/* Today's summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 lg:col-span-1">
          <ProgressCircle percentage={stepPct} size={80} progressColor="#3b82f6">
            <div className="text-center">
              <div className="text-lg font-bold">{stepPct}%</div>
            </div>
          </ProgressCircle>
          <div>
            <p className="text-sm text-slate-500">Today</p>
            <p className="text-2xl font-bold text-slate-800">{(today?.steps || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500">/ {stepGoal.toLocaleString()} steps</p>
          </div>
        </div>
        {[
          { label: 'Avg Steps', value: avgSteps.toLocaleString(), icon: Activity, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Distance', value: `${totalDist.toFixed(1)} km`, icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Active Minutes', value: `${totalActive}`, icon: Clock, color: 'text-purple-600 bg-purple-50' },
          { label: 'Avg Calories', value: `${avgCals.toLocaleString()} kcal`, icon: Flame, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${s.color}`}><s.icon size={20} /></div>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Steps Trend</h3>
          <Chart data={stepsChart} height={280} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Calories Burned</h3>
          <Chart data={caloriesChart} height={280} />
        </div>
      </div>

      {/* Recent activity log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-lg text-slate-800">Activity Log</h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {[...filteredRecords].reverse().slice(0, 30).map((r, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">{format(new Date(r.recorded_at), 'MMM d, yyyy')}</p>
                <p className="text-sm text-slate-500">{r.active_minutes} active min • {r.distance?.toFixed(1)} km</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{r.steps?.toLocaleString()} steps</p>
                <p className="text-sm text-slate-500">{r.calories_burned?.toLocaleString()} kcal</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;