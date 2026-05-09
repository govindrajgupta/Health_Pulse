import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, TrendingUp, ArrowLeft, Loader, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchSleepRecords } from '../lib/supabaseDataService';
import { generateSleepAnalysis, HealthContext } from '../lib/aiService';
import Chart from '../components/common/Chart';
import ProgressCircle from '../components/common/ProgressCircle';
import { format } from 'date-fns';

const SleepPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '180d'>('30d');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchSleepRecords(user.id, 180).then(({ data }) => {
      setRecords(data);
      setLoading(false);
    });
  }, [user?.id]);

  const rangeMap = { '7d': 7, '30d': 30, '90d': 90, '180d': 180 };
  const filtered = records.slice(-rangeMap[timeRange]);

  const avgDuration = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + r.duration, 0) / filtered.length) : 0;
  const avgQuality = filtered.length > 0 ? +(filtered.reduce((s, r) => s + r.quality, 0) / filtered.length).toFixed(1) : 0;
  const avgDeep = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + r.deep_sleep_minutes, 0) / filtered.length) : 0;
  const avgRem = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + r.rem_sleep_minutes, 0) / filtered.length) : 0;
  const avgLight = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + r.light_sleep_minutes, 0) / filtered.length) : 0;
  const avgAwake = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + r.awake_minutes, 0) / filtered.length) : 0;
  const last = filtered.length > 0 ? filtered[filtered.length - 1] : null;

  const durationChart = {
    labels: filtered.map(r => format(new Date(r.recorded_at), timeRange === '7d' ? 'EEE' : 'MMM d')),
    datasets: [{
      label: 'Sleep (hours)',
      data: filtered.map(r => +(r.duration / 60).toFixed(1)),
      borderColor: '#8b5cf6',
      backgroundColor: '#8b5cf620',
      fill: true, tension: 0.4, borderWidth: 2,
    }],
  };

  const qualityChart = {
    labels: filtered.map(r => format(new Date(r.recorded_at), timeRange === '7d' ? 'EEE' : 'MMM d')),
    datasets: [{
      label: 'Sleep Quality',
      data: filtered.map(r => r.quality),
      borderColor: '#6366f1',
      backgroundColor: '#6366f120',
      fill: true, tension: 0.4, borderWidth: 2,
    }],
  };

  const stagesChart = {
    labels: filtered.slice(-14).map(r => format(new Date(r.recorded_at), 'MMM d')),
    datasets: [
      { label: 'Deep', data: filtered.slice(-14).map(r => r.deep_sleep_minutes), backgroundColor: '#4f46e5', borderRadius: 4 },
      { label: 'REM', data: filtered.slice(-14).map(r => r.rem_sleep_minutes), backgroundColor: '#a78bfa', borderRadius: 4 },
      { label: 'Light', data: filtered.slice(-14).map(r => r.light_sleep_minutes), backgroundColor: '#c4b5fd', borderRadius: 4 },
      { label: 'Awake', data: filtered.slice(-14).map(r => r.awake_minutes), backgroundColor: '#e2e8f0', borderRadius: 4 },
    ],
  };

  const handleAiAnalysis = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const ctx: HealthContext = {
        recentSleep: filtered.slice(-7).map(s => ({
          date: format(new Date(s.recorded_at), 'MMM d'),
          duration: s.duration,
          quality: s.quality,
        })),
        sleepHours: last ? +(last.duration / 60).toFixed(1) : undefined,
        sleepQuality: last?.quality,
      };
      const result = await generateSleepAnalysis(ctx);
      setAiAnalysis(result);
    } catch { setAiAnalysis('Unable to generate analysis. Please try again.'); }
    setAiLoading(false);
  };

  const renderMd = (text: string) => text.split('\n').map((line, i) => {
    let p = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (p.startsWith('- ') || p.startsWith('• ')) return <p key={i} className="ml-3 mb-1" dangerouslySetInnerHTML={{ __html: '• ' + p.slice(2) }} />;
    if (!p.trim()) return <br key={i} />;
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: p }} />;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-2 text-sm"><ArrowLeft size={16} className="mr-1" /> Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-800">Sleep Tracker</h1>
          <p className="text-slate-500">6 months of sleep data • {records.length} nights</p>
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          {(['7d', '30d', '90d', '180d'] as const).map(t => (
            <button key={t} onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium ${timeRange === t ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? '3 Months' : '6 Months'}
            </button>
          ))}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 col-span-2 flex items-center gap-4">
          <ProgressCircle percentage={avgQuality * 10} size={80} progressColor="#8b5cf6">
            <div className="text-center"><div className="text-lg font-bold">{avgQuality}</div><div className="text-[10px] text-slate-500">/10</div></div>
          </ProgressCircle>
          <div>
            <p className="text-sm text-slate-500">Avg Quality</p>
            <p className="text-xl font-bold text-slate-800">{Math.floor(avgDuration / 60)}h {avgDuration % 60}m</p>
            <p className="text-xs text-slate-500">Avg sleep duration</p>
          </div>
        </div>
        {[
          { label: 'Deep Sleep', value: `${avgDeep}m`, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'REM Sleep', value: `${avgRem}m`, color: 'text-purple-600 bg-purple-50' },
          { label: 'Light Sleep', value: `${avgLight}m`, color: 'text-blue-600 bg-blue-50' },
          { label: 'Awake', value: `${avgAwake}m`, color: 'text-slate-600 bg-slate-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${s.color}`}>avg/night</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Sleep Duration</h3>
          <Chart data={durationChart} height={280} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Sleep Quality Score</h3>
          <Chart data={qualityChart} height={280} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Sleep Stages (Last 14 Nights)</h3>
        <Chart data={stagesChart} type="bar" height={280} />
      </div>

      {/* AI Sleep Analysis */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center"><Sparkles className="mr-2" /> AI Sleep Analysis <span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">GPT-5.4</span></h3>
          <button onClick={handleAiAnalysis} disabled={aiLoading} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            {aiLoading ? <><Loader className="animate-spin" size={14} /> Analyzing...</> : <><Sparkles size={14} /> Generate Analysis</>}
          </button>
        </div>
        {aiAnalysis ? (
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 text-white/95 text-sm">{renderMd(aiAnalysis)}</div>
        ) : (
          <p className="text-indigo-200 text-sm">Click "Generate Analysis" to get AI-powered insights about your sleep patterns.</p>
        )}
      </div>

      {/* Sleep log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200"><h3 className="font-bold text-lg text-slate-800">Sleep Log</h3></div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {[...filtered].reverse().slice(0, 30).map((r, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">{format(new Date(r.recorded_at), 'MMM d, yyyy')}</p>
                <p className="text-sm text-slate-500">{r.bed_time ? format(new Date(r.bed_time), 'h:mm a') : ''} → {r.wake_time ? format(new Date(r.wake_time), 'h:mm a') : ''}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{Math.floor(r.duration / 60)}h {r.duration % 60}m</p>
                  <p className="text-sm text-slate-500">Quality: {r.quality}/10</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${r.quality >= 7 ? 'bg-green-400' : r.quality >= 5 ? 'bg-amber-400' : 'bg-red-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SleepPage;