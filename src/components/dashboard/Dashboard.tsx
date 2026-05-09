import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Moon, Heart, User, Bell, Droplet, Flame, ArrowRight, Zap, Target, Bluetooth, Monitor, Loader, Wifi, WifiOff, Sparkles } from "lucide-react";
import { useSmartBand } from "../../hooks/useSmartBand";
import Chart from "../common/Chart";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchActivityRecords,
  fetchSleepRecords,
  fetchStressRecords,
  fetchNotifications,
  deleteNotification,
  clearAllNotifications as clearAllNotifs,
  seedUserData,
} from "../../lib/supabaseDataService";
import { generateHealthInsights, HealthContext } from "../../lib/aiService";
import { format, subDays } from "date-fns";

interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

const Dashboard: React.FC = () => {
  const { data, connectBluetooth, startDemoMode, isConnecting, connectionError } = useSmartBand();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Real data state
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [stressData, setStressData] = useState<any[]>([]);

  // Load real data from Supabase
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setDataLoading(true);

      // Seed demo data on first load if user has none
      if (!seeded) {
        await seedUserData(user.id);
        setSeeded(true);
      }

      const [actRes, sleepRes, notifRes, stressRes] = await Promise.all([
        fetchActivityRecords(user.id, 14),
        fetchSleepRecords(user.id, 14),
        fetchNotifications(user.id),
        fetchStressRecords(user.id, 14),
      ]);

      setActivityData(actRes.data);
      setSleepData(sleepRes.data);
      setStressData(stressRes.data);
      setNotifications(notifRes.data as DashboardNotification[]);
      setDataLoading(false);
    };

    loadData();
  }, [user?.id, seeded]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Build chart data from real records
  const buildChartData = (records: any[], valueKey: string, label: string, color: string) => {
    const last7 = records.slice(-7);
    return {
      labels: last7.map((r: any) => format(new Date(r.recorded_at), 'MMM d')),
      datasets: [{
        label,
        data: last7.map((r: any) => r[valueKey] || 0),
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }],
    };
  };

  const stepsChartData = buildChartData(activityData, 'steps', 'Steps', '#3b82f6');
  const sleepChartData = buildChartData(sleepData, 'duration', 'Sleep (min)', '#8b5cf6');

  // Get today's stats from the latest record
  const todayActivity = activityData.length > 0 ? activityData[activityData.length - 1] : null;
  const todaySleep = sleepData.length > 0 ? sleepData[sleepData.length - 1] : null;

  const handleRemoveNotification = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = async () => {
    if (!user?.id) return;
    await clearAllNotifs(user.id);
    setNotifications([]);
  };

  if (!data?.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Connect Your Smart Band</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">Sync your device to view your personalized dashboard with activity, sleep, diet, and advanced health analytics.</p>
          
          {connectionError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm max-w-md mx-auto">
              {connectionError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            {/* Bluetooth Pairing Button */}
            <button
              onClick={connectBluetooth}
              disabled={isConnecting}
              className="btn flex-1 px-6 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isConnecting ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Connecting...
                </>
              ) : (
                <>
                  <Bluetooth size={20} />
                  Pair via Bluetooth
                </>
              )}
            </button>

            {/* Demo Mode Button */}
            <button
              onClick={startDemoMode}
              disabled={isConnecting}
              className="btn flex-1 px-6 py-3 text-base font-medium bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Monitor size={20} />
              Use Demo Mode
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              <strong>Bluetooth:</strong> Opens your browser's device picker to pair with a real smart band/watch (requires Chrome/Edge).
              <br />
              <strong>Demo Mode:</strong> Uses realistic simulated sensor data to explore the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-slate-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case "activity":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800">Activity Overview</h3>
                <Activity className="text-blue-500" />
              </div>
              <Chart data={stepsChartData} height={250} />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <h3 className="font-bold text-lg text-slate-800 mb-2">Today's Goal</h3>
              <div className="text-5xl font-black text-blue-600 mb-4">
                {(todayActivity?.steps || data.steps).toLocaleString()} <span className="text-lg text-slate-500 font-normal">/ 10,000 steps</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden">
                <div className="bg-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${Math.min(((todayActivity?.steps || data.steps) / 10000) * 100, 100)}%` }}></div>
              </div>
              <p className="text-slate-600 mb-4">{(todayActivity?.steps || data.steps) >= 10000 ? "Goal reached! Amazing job!" : "You are on track! Keep moving to hit your daily goal."}</p>
              <Link to="/activity" className="text-blue-600 font-medium hover:underline flex items-center text-sm">View full activity log <ArrowRight size={16} className="ml-1" /></Link>
            </div>
          </div>
        );
      case "sleep":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800">Sleep Analysis</h3>
                <Moon className="text-indigo-500" />
              </div>
              <Chart data={sleepChartData} height={250} />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Last Night</h3>
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-5xl font-black text-indigo-600">
                  {todaySleep ? Math.floor(todaySleep.duration / 60) : 7}<span className="text-2xl text-indigo-400">h</span>{' '}
                  {todaySleep ? todaySleep.duration % 60 : 12}<span className="text-2xl text-indigo-400">m</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                  <div className="text-indigo-800 font-bold">{todaySleep ? `${Math.floor(todaySleep.deep_sleep_minutes / 60)}h ${todaySleep.deep_sleep_minutes % 60}m` : '1h 20m'}</div>
                  <div className="text-xs text-indigo-600 uppercase tracking-wider">Deep</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-blue-800 font-bold">{todaySleep ? `${Math.floor(todaySleep.light_sleep_minutes / 60)}h ${todaySleep.light_sleep_minutes % 60}m` : '4h 30m'}</div>
                  <div className="text-xs text-blue-600 uppercase tracking-wider">Light</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-purple-800 font-bold">{todaySleep ? `${Math.floor(todaySleep.rem_sleep_minutes / 60)}h ${todaySleep.rem_sleep_minutes % 60}m` : '1h 22m'}</div>
                  <div className="text-xs text-purple-600 uppercase tracking-wider">REM</div>
                </div>
              </div>
              <Link to="/sleep" className="text-indigo-600 font-medium hover:underline flex items-center text-sm">Detailed sleep metrics <ArrowRight size={16} className="ml-1" /></Link>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-32 w-32 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg">
                {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center text-4xl text-slate-400 font-bold">{user?.displayName?.charAt(0) || "U"}</div>}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{user?.displayName || "User Profile"}</h2>
                <p className="text-slate-500 mb-4">{user?.email}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Age</div>
                    <div className="font-bold text-lg text-slate-800">28</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Weight</div>
                    <div className="font-bold text-lg text-slate-800">68 kg</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Height</div>
                    <div className="font-bold text-lg text-slate-800">175 cm</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Goal</div>
                    <div className="font-bold text-lg text-slate-800">Fitness</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/profile" className="btn btn-primary">Edit Profile</Link>
                <Link to="/settings" className="btn btn-secondary">Settings</Link>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center">Notifications {unreadNotifications > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadNotifications}</span>}</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAllNotifications}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all notifications
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Bell className="mx-auto text-slate-300 mb-3" size={32} />
                <p>No notifications left</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleRemoveNotification(n.id)}
                    className={`p-4 rounded-xl border ${n.read ? "border-slate-100 bg-slate-50" : "border-blue-100 bg-blue-50"} cursor-pointer flex items-start transition-all hover:-translate-y-1 hover:shadow-sm`}
                    title="Click to dismiss"
                  >
                    <div className={`p-2 rounded-full mr-4 flex-shrink-0 ${n.read ? "bg-slate-200" : "bg-blue-100 text-blue-600"}`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{n.title}</h4>
                      <p className="text-slate-600 text-sm">{n.message}</p>
                      <div className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Link to="/notifications" className="btn btn-secondary w-full">View all past notifications</Link>
            </div>
          </div>
        );
      case "analytics": {
        const loadAiInsights = async () => {
          if (aiInsights || aiLoading) return;
          setAiLoading(true);
          try {
            const ctx: HealthContext = {
              heartRate: data.heartRate,
              bloodOxygen: data.bloodOxygen,
              steps: data.steps,
              calories: data.caloriesBurned,
              stressLevel: data.stressLevel ? Math.round(data.stressLevel / 10) : undefined,
            };
            if (activityData.length > 0) {
              ctx.recentActivity = activityData.slice(-7).map((a: any) => ({
                date: new Date(a.recorded_at).toLocaleDateString(),
                steps: a.steps,
                calories_burned: a.calories_burned,
              }));
            }
            if (sleepData.length > 0) {
              const lastSleep = sleepData[sleepData.length - 1];
              ctx.sleepHours = Math.round((lastSleep?.duration || 0) / 60 * 10) / 10;
              ctx.sleepQuality = lastSleep?.quality;
              ctx.recentSleep = sleepData.slice(-7).map((s: any) => ({
                date: new Date(s.recorded_at).toLocaleDateString(),
                duration: s.duration,
                quality: s.quality,
              }));
            }
            if (stressData.length > 0) {
              ctx.recentStress = stressData.slice(-7).map((s: any) => ({
                date: new Date(s.recorded_at).toLocaleDateString(),
                stress_level: s.stress_level,
              }));
            }
            const insights = await generateHealthInsights(ctx);
            setAiInsights(insights);
          } catch (err) {
            console.error('AI insights error:', err);
            setAiInsights('Unable to generate AI insights at this time. Please try again later.');
          } finally {
            setAiLoading(false);
          }
        };

        // Auto-load insights when tab is opened
        if (!aiInsights && !aiLoading) {
          loadAiInsights();
        }

        const renderInsightContent = (text: string) => {
          return text.split('\n').map((line, i) => {
            let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (processed.startsWith('- ') || processed.startsWith('• ')) {
              processed = '• ' + processed.slice(2);
              return <p key={i} className="ml-3 mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: processed }} />;
            }
            if (processed.trim() === '') return <br key={i} />;
            return <p key={i} className="mb-1.5 text-sm" dangerouslySetInnerHTML={{ __html: processed }} />;
          });
        };

        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-2 flex items-center"><Sparkles className="mr-2" /> AI Health Insights <span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">GPT-5.4</span></h3>
              <p className="text-blue-100 mb-6 max-w-2xl">Personalized analysis powered by AI, using your real health data from the last 14 days.</p>
              
              {aiLoading ? (
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 flex items-center justify-center gap-3">
                  <Loader className="animate-spin" size={20} />
                  <span>Analyzing your health data with AI...</span>
                </div>
              ) : aiInsights ? (
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-white/95">
                  {renderInsightContent(aiInsights)}
                </div>
              ) : null}
              
              {aiInsights && (
                <button
                  onClick={() => { setAiInsights(null); }}
                  className="mt-4 text-sm text-blue-200 hover:text-white flex items-center gap-1"
                >
                  <Sparkles size={14} /> Regenerate insights
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {["Heart Health", "Stress Analysis", "Workout Intensity"].map(title => (
                 <div key={title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
                   <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
                   <p className="text-sm text-slate-500 mb-4">View comprehensive {title.toLowerCase()} metrics over the last 14 days.</p>
                   <span className="text-blue-600 text-sm font-medium flex items-center">Open report <ArrowRight size={14} className="ml-1" /></span>
                 </div>
               ))}
            </div>
          </div>
        );
      }
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div onClick={() => setActiveTab("activity")} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 cursor-pointer transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity size={24} /></div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">+12%</span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Daily Steps</h3>
              <div className="text-2xl font-bold text-slate-800">{(todayActivity?.steps || data.steps).toLocaleString()}</div>
            </div>
            <div onClick={() => setActiveTab("sleep")} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Moon size={24} /></div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Good</span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Sleep Score</h3>
              <div className="text-2xl font-bold text-slate-800">{todaySleep?.quality || 85}<span className="text-sm text-slate-400 font-normal">/10</span></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-400 cursor-pointer transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Heart size={24} /></div>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-full">Normal</span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Avg Heart Rate</h3>
              <div className="text-2xl font-bold text-slate-800">{data.heartRate} <span className="text-sm text-slate-400 font-normal">bpm</span></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-400 cursor-pointer transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Flame size={24} /></div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">+4%</span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Calories Burned</h3>
              <div className="text-2xl font-bold text-slate-800">{(todayActivity?.calories_burned || data.caloriesBurned).toLocaleString()} <span className="text-sm text-slate-400 font-normal">kcal</span></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Health Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.displayName || "User"}! Here's your health summary.</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 self-start">
          {[
            { id: "overview", label: "Overview" },
            { id: "activity", label: "Activity" },
            { id: "sleep", label: "Sleep" },
            { id: "analytics", label: "Analytics" },
            { id: "profile", label: "Profile" },
            { id: "notifications", label: "Notifications" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              {tab.label} {tab.id === "notifications" && unreadNotifications > 0 && `(${unreadNotifications})`}
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === "overview" && renderTabContent()}
      
      {activeTab !== "overview" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
