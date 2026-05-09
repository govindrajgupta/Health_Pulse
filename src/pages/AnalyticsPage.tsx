import React, { useState, useEffect } from 'react';
import { BarChart2, Activity, Moon, Heart, Brain, ArrowLeft, Loader, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchActivityRecords, fetchSleepRecords, fetchStressRecords, fetchHeartRiskAssessments } from '../lib/supabaseDataService';
import { generateHealthInsights, HealthContext } from '../lib/aiService';
import Chart from '../components/common/Chart';
import { format } from 'date-fns';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);
  const [sleep, setSleep] = useState<any[]>([]);
  const [stress, setStress] = useState<any[]>([]);
  const [heartRisk, setHeartRisk] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      fetchActivityRecords(user.id, 180),
      fetchSleepRecords(user.id, 180),
      fetchStressRecords(user.id, 180),
      fetchHeartRiskAssessments(user.id),
    ]).then(([actRes, sleepRes, stressRes, heartRes]) => {
      setActivity(actRes.data);
      setSleep(sleepRes.data);
      setStress(stressRes.data);
      setHeartRisk(heartRes.data);
      setLoading(false);
    });
  }, [user?.id]);

  const handleGenerateInsights = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const ctx: HealthContext = {
        recentActivity: activity.slice(-7).map(a => ({ date: format(new Date(a.recorded_at), 'MMM d'), steps: a.steps, calories_burned: a.calories_burned })),
        recentSleep: sleep.slice(-7).map(s => ({ date: format(new Date(s.recorded_at), 'MMM d'), duration: s.duration, quality: s.quality })),
        recentStress: stress.slice(-7).map(s => ({ date: format(new Date(s.recorded_at), 'MMM d'), stress_level: s.stress_level })),
      };
      const result = await generateHealthInsights(ctx);
      setAiInsights(result);
    } catch { setAiInsights('Unable to generate insights. Please try again.'); }
    setAiLoading(false);
  };

  // Weekly averages (last 4 weeks)
  const weeklyAvg = (data: any[], key: string) => {
    const weeks: number[] = [];
    for (let w = 3; w >= 0; w--) {
      const start = data.length - (w + 1) * 7;
      const end = data.length - w * 7;
      const slice = data.slice(Math.max(0, start), end);
      weeks.push(slice.length > 0 ? Math.round(slice.reduce((s: number, r: any) => s + (r[key] || 0), 0) / slice.length) : 0);
    }
    return weeks;
  };

  const weekLabels = ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'Last week'];

  const overviewChart = {
    labels: weekLabels,
    datasets: [
      { label: 'Avg Steps', data: weeklyAvg(activity, 'steps'), borderColor: '#3b82f6', backgroundColor: '#3b82f620', fill: true, tension: 0.4, borderWidth: 2, yAxisID: 'y' },
    ],
  };

  const sleepVsStressChart = {
    labels: stress.slice(-30).map(s => format(new Date(s.recorded_at), 'MMM d')),
    datasets: [
      { label: 'Sleep Quality', data: sleep.slice(-30).map(s => s.quality), borderColor: '#8b5cf6', backgroundColor: '#8b5cf620', fill: false, tension: 0.4, borderWidth: 2 },
      { label: 'Stress Level', data: stress.slice(-30).map(s => s.stress_level), borderColor: '#ef4444', backgroundColor: '#ef444420', fill: false, tension: 0.4, borderWidth: 2 },
    ],
  };

  const renderMd = (text: string) => text.split('\n').map((line, i) => {
    let p = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (p.startsWith('- ') || p.startsWith('• ')) return <p key={i} className="ml-3 mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: '• ' + p.slice(2) }} />;
    if (!p.trim()) return <br key={i} />;
    return <p key={i} className="mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: p }} />;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  // Quick stats
  const totalDays = activity.length;
  const avgSteps = totalDays > 0 ? Math.round(activity.reduce((s, r) => s + r.steps, 0) / totalDays) : 0;
  const avgSleep = sleep.length > 0 ? +(sleep.reduce((s, r) => s + r.duration, 0) / sleep.length / 60).toFixed(1) : 0;
  const avgStress = stress.length > 0 ? +(stress.reduce((s, r) => s + r.stress_level, 0) / stress.length).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-2 text-sm"><ArrowLeft size={16} className="mr-1" /> Dashboard</Link>
        <h1 className="text-2xl font-bold text-slate-800">Health Analytics</h1>
        <p className="text-slate-500">Comprehensive analysis across {totalDays} days of health data</p>
      </header>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '6-Month Avg Steps', value: avgSteps.toLocaleString(), icon: Activity, color: 'text-blue-600 bg-blue-50', sub: '/day' },
          { label: 'Avg Sleep', value: `${avgSleep}h`, icon: Moon, color: 'text-indigo-600 bg-indigo-50', sub: '/night' },
          { label: 'Avg Stress', value: `${avgStress}`, icon: Brain, color: 'text-red-600 bg-red-50', sub: '/10' },
          { label: 'Heart Risk', value: heartRisk ? `${heartRisk.calculated_risk}%` : 'N/A', icon: Heart, color: 'text-emerald-600 bg-emerald-50', sub: 'score' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${s.color}`}><s.icon size={20} /></div>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800">{s.value} <span className="text-sm text-slate-400 font-normal">{s.sub}</span></p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Weekly Steps Trend</h3>
          <Chart data={overviewChart} height={280} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Sleep Quality vs Stress (30 Days)</h3>
          <Chart data={sleepVsStressChart} height={280} />
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center"><Sparkles className="mr-2" /> AI Health Recommendations <span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">GPT-5.4</span></h3>
          <button onClick={handleGenerateInsights} disabled={aiLoading} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            {aiLoading ? <><Loader className="animate-spin" size={14} /> Analyzing...</> : <><Sparkles size={14} /> {aiInsights ? 'Regenerate' : 'Generate'}</>}
          </button>
        </div>
        {aiInsights ? (
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 text-white/95">{renderMd(aiInsights)}</div>
        ) : (
          <p className="text-blue-200 text-sm">Click "Generate" to get AI-powered health recommendations based on your 6 months of data.</p>
        )}
      </div>

      {/* Heart Risk Card */}
      {heartRisk && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center"><Heart size={20} className="mr-2 text-red-500" /> Heart Risk Assessment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500">Blood Pressure</p><p className="font-bold text-slate-800">{heartRisk.systolic_bp}/{heartRisk.diastolic_bp}</p></div>
            <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500">Cholesterol</p><p className="font-bold text-slate-800">{heartRisk.cholesterol_total} mg/dL</p></div>
            <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500">Blood Glucose</p><p className="font-bold text-slate-800">{heartRisk.blood_glucose} mg/dL</p></div>
            <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500">Risk Score</p><p className="font-bold text-emerald-600">{heartRisk.calculated_risk}% — Low</p></div>
          </div>
          {heartRisk.recommendations?.length > 0 && (
            <div className="space-y-2">
              {heartRisk.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-emerald-500 mt-0.5">✓</span>{r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;