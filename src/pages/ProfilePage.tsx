import React, { useState, useEffect } from 'react';
import { User, Save, ArrowLeft, Loader, Heart, Activity, Moon, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchHealthProfile, upsertHealthProfile } from '../lib/supabaseDataService';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(68);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [smokingStatus, setSmokingStatus] = useState('never');
  const [healthGoals, setHealthGoals] = useState<string[]>(['fitness', 'weight_management', 'better_sleep']);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchHealthProfile(user.id).then(({ data }) => {
      if (data) {
        setAge(data.age || 28);
        setGender(data.gender || 'male');
        setHeight(data.height || 175);
        setWeight(data.weight || 68);
        setActivityLevel(data.activity_level || 'moderate');
        setSmokingStatus(data.smoking_status || 'never');
        setHealthGoals(data.health_goals || []);
        setMedicalConditions(data.medical_conditions || []);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateProfile({ displayName });
      await upsertHealthProfile(user.id, {
        age, gender, height, weight,
        activity_level: activityLevel,
        smoking_status: smokingStatus,
        health_goals: healthGoals,
        medical_conditions: medicalConditions,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : '—';
  const bmiCategory = parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese';

  const toggleGoal = (goal: string) => {
    setHealthGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const goalOptions = ['fitness', 'weight_loss', 'weight_gain', 'weight_management', 'better_sleep', 'stress_reduction', 'heart_health', 'muscle_building'];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-2 text-sm"><ArrowLeft size={16} className="mr-1" /> Dashboard</Link>
        <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
        <p className="text-slate-500">Manage your personal information and health goals</p>
      </header>

      {/* Profile header card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayName || 'User'}</h2>
            <p className="text-blue-200">{user?.email}</p>
            <div className="flex gap-4 mt-3">
              <div className="bg-white/15 px-3 py-1 rounded-lg text-sm">BMI: {bmi} ({bmiCategory})</div>
              <div className="bg-white/15 px-3 py-1 rounded-lg text-sm">{activityLevel} activity</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center"><User size={20} className="mr-2 text-blue-600" /> Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                <input type="number" value={age} onChange={e => setAge(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
              <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Smoking Status</label>
              <select value={smokingStatus} onChange={e => setSmokingStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="never">Never</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </div>
          </div>
        </div>

        {/* Health Goals */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center"><Target size={20} className="mr-2 text-emerald-600" /> Health Goals</h3>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map(goal => (
                <button key={goal} onClick={() => toggleGoal(goal)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${healthGoals.includes(goal)
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {goal.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <Activity size={20} className="mx-auto text-blue-600 mb-1" />
                <p className="text-lg font-bold text-slate-800">{activityLevel}</p>
                <p className="text-xs text-slate-500">Activity Level</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg text-center">
                <Heart size={20} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-lg font-bold text-slate-800">{bmi}</p>
                <p className="text-xs text-slate-500">BMI</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <Moon size={20} className="mx-auto text-purple-600 mb-1" />
                <p className="text-lg font-bold text-slate-800">{healthGoals.length}</p>
                <p className="text-xs text-slate-500">Active Goals</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <User size={20} className="mx-auto text-amber-600 mb-1" />
                <p className="text-lg font-bold text-slate-800">{age}</p>
                <p className="text-xs text-slate-500">Years Old</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end gap-3">
        {saved && <span className="text-green-600 font-medium flex items-center">✓ Saved successfully</span>}
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
          {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;