import React, { useState, useEffect } from 'react';
import { 
  Utensils, Plus, Calendar, PieChart, Coffee, Soup, Apple,
  Search, ArrowLeft, Loader, Sparkles, X, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchMeals, saveMeal } from '../../lib/supabaseDataService';
import { sendChatMessage, ChatMessage, generateDietRecommendations, HealthContext } from '../../lib/aiService';
import Chart from '../common/Chart';
import ProgressCircle from '../common/ProgressCircle';
import { format } from 'date-fns';

interface FoodItem {
  name: string;
  portion: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DietPage: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMealMode, setAddMealMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // AI food analysis
  const [customFoodInput, setCustomFoodInput] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState<FoodItem[]>([]);
  
  // Add meal form
  const [mealType, setMealType] = useState('lunch');
  const [addedFoods, setAddedFoods] = useState<FoodItem[]>([]);
  const [saving, setSaving] = useState(false);

  // AI diet recommendations
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiRecLoading, setAiRecLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchMeals(user.id, 500).then(({ data }) => {
      setMeals(data);
      setLoading(false);
    });
  }, [user?.id]);

  // Filter meals for selected date
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const mealsForDate = meals.filter(m => format(new Date(m.recorded_at), 'yyyy-MM-dd') === dateStr);

  // Daily totals
  const daily = mealsForDate.reduce((acc, m) => ({
    calories: acc.calories + (m.total_calories || 0),
    protein: acc.protein + (m.total_protein || 0),
    carbs: acc.carbs + (m.total_carbs || 0),
    fat: acc.fat + (m.total_fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = 2000;
  const calPct = Math.min(Math.round((daily.calories / calorieGoal) * 100), 100);
  const totalG = daily.protein + daily.carbs + daily.fat || 1;
  const protPct = Math.round((daily.protein / totalG) * 100);
  const carbPct = Math.round((daily.carbs / totalG) * 100);
  const fatPct = Math.round((daily.fat / totalG) * 100);

  // Weekly calories chart (last 14 days)
  const last14 = meals.reduce((acc: Record<string, number>, m) => {
    const d = format(new Date(m.recorded_at), 'MMM d');
    acc[d] = (acc[d] || 0) + (m.total_calories || 0);
    return acc;
  }, {});
  const chartDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = format(d, 'MMM d');
    chartDays.push({ label, value: last14[label] || 0 });
  }
  const caloriesChart = {
    labels: chartDays.map(d => d.label),
    datasets: [{
      label: 'Calories', data: chartDays.map(d => d.value),
      borderColor: '#f59e0b', backgroundColor: '#f59e0b20', fill: true, tension: 0.4, borderWidth: 2,
    }],
  };

  // AI Food Analysis — send food description to GPT-5.4
  const analyzeFood = async () => {
    if (!customFoodInput.trim() || aiAnalyzing) return;
    setAiAnalyzing(true);
    setAnalyzedFoods([]);
    try {
      const messages: ChatMessage[] = [{
        role: 'user',
        content: `Analyze this food and estimate its nutritional content. Return ONLY a JSON array of objects with these exact fields: name, portion (grams), calories, protein (grams), carbs (grams), fat (grams). No explanation, no markdown, just the JSON array.

Food: "${customFoodInput}"

Example output format: [{"name":"Paneer Butter Masala","portion":200,"calories":350,"protein":15,"carbs":12,"fat":25}]`,
      }];
      const response = await sendChatMessage(messages);
      // Parse JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as FoodItem[];
        setAnalyzedFoods(parsed);
      } else {
        console.error('Could not parse AI response:', response);
      }
    } catch (err) {
      console.error('Food analysis error:', err);
    }
    setAiAnalyzing(false);
  };

  const addFoodToMeal = (food: FoodItem) => {
    setAddedFoods(prev => [...prev, food]);
    setAnalyzedFoods(prev => prev.filter(f => f.name !== food.name));
    setCustomFoodInput('');
  };

  const removeFoodFromMeal = (idx: number) => {
    setAddedFoods(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMeal = async () => {
    if (!user?.id || addedFoods.length === 0) return;
    setSaving(true);
    const totalCal = addedFoods.reduce((s, f) => s + f.calories, 0);
    const totalProt = addedFoods.reduce((s, f) => s + f.protein, 0);
    const totalCarb = addedFoods.reduce((s, f) => s + f.carbs, 0);
    const totalFat = addedFoods.reduce((s, f) => s + f.fat, 0);

    await saveMeal(user.id, {
      meal_type: mealType,
      total_calories: totalCal,
      total_protein: totalProt,
      total_carbs: totalCarb,
      total_fat: totalFat,
      nutritional_score: 7,
      recorded_at: selectedDate.toISOString(),
      foods: addedFoods,
    });

    // Refresh
    const { data } = await fetchMeals(user.id, 500);
    setMeals(data);
    setAddedFoods([]);
    setAddMealMode(false);
    setSaving(false);
  };

  const handleAiRecommendation = async () => {
    if (aiRecLoading) return;
    setAiRecLoading(true);
    try {
      const recentMeals = meals.slice(0, 20).map(m => ({
        meal_type: m.meal_type, total_calories: m.total_calories,
        total_protein: m.total_protein, total_carbs: m.total_carbs, total_fat: m.total_fat,
      }));
      const ctx: HealthContext = {};
      const result = await generateDietRecommendations(recentMeals, ctx);
      setAiRecommendation(result);
    } catch { setAiRecommendation('Unable to generate recommendations.'); }
    setAiRecLoading(false);
  };

  const getMealIcon = (type: string) => {
    switch (type) { case 'breakfast': return <Coffee size={18} />; case 'lunch': return <Soup size={18} />; case 'snack': return <Apple size={18} />; default: return <Utensils size={18} />; }
  };
  const getMealColor = (type: string) => {
    switch (type) { case 'breakfast': return 'bg-amber-50 text-amber-600'; case 'lunch': return 'bg-blue-50 text-blue-600'; case 'dinner': return 'bg-purple-50 text-purple-600'; case 'snack': return 'bg-green-50 text-green-600'; default: return 'bg-slate-50 text-slate-600'; }
  };

  const renderMd = (text: string) => text.split('\n').map((line, i) => {
    let p = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (p.startsWith('- ') || p.startsWith('• ')) return <p key={i} className="ml-3 mb-1" dangerouslySetInnerHTML={{ __html: '• ' + p.slice(2) }} />;
    if (!p.trim()) return <br key={i} />;
    return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: p }} />;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-amber-600" size={32} /></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-2 text-sm"><ArrowLeft size={16} className="mr-1" /> Dashboard</Link>
        <h1 className="text-2xl font-bold text-slate-800">Diet Record</h1>
        <p className="text-slate-500">Track your nutrition with AI-powered food analysis</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Daily Summary */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Daily Summary</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }} className="p-1 hover:bg-slate-100 rounded">←</button>
                <span className="text-sm font-medium px-2">{format(selectedDate, 'MMM d')}</span>
                <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }} className="p-1 hover:bg-slate-100 rounded">→</button>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <ProgressCircle percentage={calPct} size={120} progressColor={calPct > 100 ? '#ef4444' : '#3b82f6'}>
                <div className="text-center"><div className="text-lg font-bold">{daily.calories}</div><div className="text-[10px] text-slate-500">/ {calorieGoal}</div></div>
              </ProgressCircle>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-xs text-blue-700">Protein</p><p className="font-bold text-slate-800">{daily.protein}g</p><p className="text-xs text-slate-500">{protPct}%</p></div>
              <div className="bg-amber-50 p-3 rounded-lg text-center"><p className="text-xs text-amber-700">Carbs</p><p className="font-bold text-slate-800">{daily.carbs}g</p><p className="text-xs text-slate-500">{carbPct}%</p></div>
              <div className="bg-indigo-50 p-3 rounded-lg text-center"><p className="text-xs text-indigo-700">Fat</p><p className="font-bold text-slate-800">{daily.fat}g</p><p className="text-xs text-slate-500">{fatPct}%</p></div>
            </div>

            <button onClick={() => setAddMealMode(true)} className="btn btn-primary w-full"><Plus size={16} className="mr-1" /> Add Meal</button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-800 mb-4">Calorie Trend (14 Days)</h3>
            <Chart data={caloriesChart} height={200} />
          </div>
        </div>

        {/* Main — Meals + AI */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's meals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Meals for {format(selectedDate, 'MMM d, yyyy')}</h3>
              <button onClick={() => setAddMealMode(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Meal</button>
            </div>
            <div className="p-4">
              {mealsForDate.length > 0 ? mealsForDate.map((meal: any) => (
                <div key={meal.id} className="border border-slate-200 rounded-lg p-4 mb-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getMealColor(meal.meal_type)}`}>{getMealIcon(meal.meal_type)}</div>
                      <div>
                        <h4 className="font-medium text-slate-800 capitalize">{meal.meal_type}</h4>
                        <p className="text-xs text-slate-500">{format(new Date(meal.recorded_at), 'h:mm a')}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{meal.total_calories} kcal</span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500 mb-2">
                    <span>P: {meal.total_protein}g</span><span>C: {meal.total_carbs}g</span><span>F: {meal.total_fat}g</span>
                  </div>
                  {meal.food_items?.length > 0 && (
                    <div className="border-t border-slate-100 pt-2 mt-2">
                      {meal.food_items.map((f: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-1"><span className="text-slate-700">{f.name} ({f.portion}g)</span><span className="text-slate-500">{f.calories} cal</span></div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8">
                  <Utensils size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No meals logged for this date</p>
                  <button onClick={() => setAddMealMode(true)} className="mt-3 btn btn-primary text-sm"><Plus size={14} className="mr-1" /> Add Meal</button>
                </div>
              )}
            </div>
          </div>

          {/* AI Diet Recommendations */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center"><Sparkles className="mr-2" /> AI Diet Recommendations <span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">GPT-5.4</span></h3>
              <button onClick={handleAiRecommendation} disabled={aiRecLoading} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                {aiRecLoading ? <><Loader className="animate-spin" size={14} /> Analyzing...</> : <><Sparkles size={14} /> {aiRecommendation ? 'Regenerate' : 'Analyze Diet'}</>}
              </button>
            </div>
            {aiRecommendation ? (
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 text-white/95 text-sm">{renderMd(aiRecommendation)}</div>
            ) : (
              <p className="text-amber-100 text-sm">Click "Analyze Diet" to get AI-powered nutrition recommendations based on your recent meals.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Meal Modal with AI Food Analysis */}
      {addMealMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Add Meal</h3>
              <button onClick={() => { setAddMealMode(false); setAddedFoods([]); setAnalyzedFoods([]); }} className="p-1 rounded-full hover:bg-slate-100"><X size={20} className="text-slate-500" /></button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Meal Type</label>
                <select value={mealType} onChange={e => setMealType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option>
                </select>
              </div>

              {/* AI Food Analysis Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Sparkles size={14} className="text-blue-600" /> Describe Your Food (AI Analysis)
                </label>
                <div className="flex gap-2">
                  <input type="text" value={customFoodInput} onChange={e => setCustomFoodInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && analyzeFood()}
                    placeholder='e.g. "2 rotis with dal and paneer curry" or "chicken biryani with raita"'
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                  <button onClick={analyzeFood} disabled={aiAnalyzing || !customFoodInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium flex items-center gap-1">
                    {aiAnalyzing ? <Loader className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    {aiAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">AI will estimate calories, protein, carbs, and fat for any food you describe</p>
              </div>

              {/* AI Analyzed Results */}
              {analyzedFoods.length > 0 && (
                <div className="mb-4 border border-blue-200 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1"><Sparkles size={14} /> AI Analysis Results</p>
                  {analyzedFoods.map((food, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-slate-800">{food.name}</p>
                        <p className="text-xs text-slate-500">{food.portion}g • {food.calories} cal • P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                      </div>
                      <button onClick={() => addFoodToMeal(food)} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Add</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Added Foods */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Added Items ({addedFoods.length})</label>
                <div className="border border-slate-200 rounded-lg min-h-[60px] p-3">
                  {addedFoods.length > 0 ? addedFoods.map((food, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0">
                      <span className="text-sm text-slate-700">{food.name} ({food.portion}g) — {food.calories} cal</span>
                      <button onClick={() => removeFoodFromMeal(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                    </div>
                  )) : <p className="text-sm text-slate-400 text-center">No items added yet. Use AI to analyze your food above.</p>}
                </div>
                {addedFoods.length > 0 && (
                  <div className="mt-2 flex gap-3 text-sm text-slate-600">
                    <span>Total: <strong>{addedFoods.reduce((s, f) => s + f.calories, 0)} cal</strong></span>
                    <span>P: {addedFoods.reduce((s, f) => s + f.protein, 0)}g</span>
                    <span>C: {addedFoods.reduce((s, f) => s + f.carbs, 0)}g</span>
                    <span>F: {addedFoods.reduce((s, f) => s + f.fat, 0)}g</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex gap-3">
              <button onClick={() => { setAddMealMode(false); setAddedFoods([]); setAnalyzedFoods([]); }} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Cancel</button>
              <button onClick={handleSaveMeal} disabled={addedFoods.length === 0 || saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                {saving ? <Loader className="animate-spin" size={16} /> : null}
                {saving ? 'Saving...' : 'Save Meal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPage;