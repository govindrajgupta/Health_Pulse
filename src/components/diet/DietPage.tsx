import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  BarChart, 
  Calendar, 
  Camera, 
  PieChart,
  Zap,
  Coffee,
  Soup,
  Apple,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Search
} from 'lucide-react';
import Chart from '../common/Chart';
import ProgressCircle from '../common/ProgressCircle';
import { generateMockMealEntries, generateMockChartData } from '../../utils/mockData';
import { MealEntry } from '../../types';

const DietPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addMealMode, setAddMealMode] = useState(false);
  
  // Get mock data
  const allMealEntries = generateMockMealEntries();
  const caloriesChartData = generateMockChartData('calories');
  
  // Filter entries for selected date
  const dateString = selectedDate.toDateString();
  const mealsForSelectedDate = allMealEntries.filter(
    meal => meal.date.toDateString() === dateString
  );
  
  // Calculate totals for the day
  const dailyTotals = mealsForSelectedDate.reduce(
    (acc, meal) => {
      acc.calories += meal.totalCalories;
      acc.protein += meal.totalProtein;
      acc.carbs += meal.totalCarbs;
      acc.fat += meal.totalFat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  // Calculate percentages for macros
  const totalGrams = dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat;
  const proteinPercentage = totalGrams > 0 ? Math.round((dailyTotals.protein / totalGrams) * 100) : 0;
  const carbsPercentage = totalGrams > 0 ? Math.round((dailyTotals.carbs / totalGrams) * 100) : 0;
  const fatPercentage = totalGrams > 0 ? Math.round((dailyTotals.fat / totalGrams) * 100) : 0;
  
  // Daily calorie goal (mock)
  const calorieGoal = 2000;
  const caloriePercentage = Math.min(Math.round((dailyTotals.calories / calorieGoal) * 100), 100);
  
  // Function to get meal type icon
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee size={18} />;
      case 'lunch':
        return <Soup size={18} />;
      case 'dinner':
        return <Utensils size={18} />;
      case 'snack':
        return <Apple size={18} />;
      default:
        return <Utensils size={18} />;
    }
  };
  
  // Function to get meal type background color
  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-amber-50 text-amber-600';
      case 'lunch':
        return 'bg-blue-50 text-blue-600';
      case 'dinner':
        return 'bg-purple-50 text-purple-600';
      case 'snack':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };
  
  // Function to render a meal entry
  const renderMealEntry = (meal: MealEntry) => {
    return (
      <div key={meal.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4 hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${getMealTypeColor(meal.mealType)} mr-3`}>
                {getMealTypeIcon(meal.mealType)}
              </div>
              <div>
                <h4 className="font-medium text-slate-800 capitalize">
                  {meal.mealType}
                </h4>
                <p className="text-sm text-slate-500">
                  {meal.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-1.5 rounded-full hover:bg-slate-100">
                <MoreHorizontal size={18} className="text-slate-500" />
              </button>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex space-x-4 text-sm">
                <div>
                  <span className="text-slate-500">Calories:</span>{' '}
                  <span className="font-medium text-slate-700">{meal.totalCalories}</span>
                </div>
                <div>
                  <span className="text-slate-500">Protein:</span>{' '}
                  <span className="font-medium text-slate-700">{meal.totalProtein}g</span>
                </div>
                <div>
                  <span className="text-slate-500">Carbs:</span>{' '}
                  <span className="font-medium text-slate-700">{meal.totalCarbs}g</span>
                </div>
                <div>
                  <span className="text-slate-500">Fat:</span>{' '}
                  <span className="font-medium text-slate-700">{meal.totalFat}g</span>
                </div>
              </div>
              
              <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {meal.nutritionalScore}/10 Score
              </div>
            </div>
            
            <div className="mt-2">
              <h5 className="text-sm font-medium text-slate-700 mb-2">Food Items</h5>
              <div className="text-sm">
                {meal.foods.map((food, index) => (
                  <div 
                    key={food.id} 
                    className={`flex justify-between py-1.5 ${
                      index < meal.foods.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="text-slate-700">{food.name} ({food.portion}g)</div>
                    <div className="text-slate-500">{food.calories} cal</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Diet Record
        </h1>
        <p className="text-slate-600">
          Track your nutrition and maintain a healthy diet
        </p>
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Daily Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Daily Summary</h3>
              
              <div className="flex items-center">
                <button 
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 mr-1"
                  aria-label="Previous Day"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"></path>
                  </svg>
                </button>
                
                <span className="text-sm font-medium text-slate-700">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                
                <button 
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 ml-1"
                  aria-label="Next Day"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Calories progress */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-1">
                <h4 className="text-sm font-medium text-slate-700">Calories</h4>
                <div className="text-sm">
                  <span className="font-medium text-slate-800">{dailyTotals.calories}</span>
                  <span className="text-slate-500"> / {calorieGoal}</span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${caloriePercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-500">0</span>
                <span className={caloriePercentage > 100 ? 'text-red-500 font-medium' : 'text-slate-500'}>
                  {caloriePercentage}%
                </span>
              </div>
            </div>
            
            {/* Macronutrients */}
            <h4 className="text-sm font-medium text-slate-700 mb-3">Macronutrients</h4>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700 mb-1">Protein</p>
                <p className="font-medium text-slate-800">{dailyTotals.protein}g</p>
                <p className="text-xs text-slate-500">{proteinPercentage}%</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-amber-700 mb-1">Carbs</p>
                <p className="font-medium text-slate-800">{dailyTotals.carbs}g</p>
                <p className="text-xs text-slate-500">{carbsPercentage}%</p>
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-xs text-indigo-700 mb-1">Fat</p>
                <p className="font-medium text-slate-800">{dailyTotals.fat}g</p>
                <p className="text-xs text-slate-500">{fatPercentage}%</p>
              </div>
            </div>
            
            {/* Macro distribution pie chart */}
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3"></circle>
                    
                    {/* Protein segment */}
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3" 
                      strokeDasharray={`${proteinPercentage} ${100 - proteinPercentage}`}
                    ></circle>
                    
                    {/* Carbs segment */}
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="3" 
                      strokeDasharray={`${carbsPercentage} ${100 - carbsPercentage}`}
                      strokeDashoffset={`${-proteinPercentage}`}
                    ></circle>
                    
                    {/* Fat segment */}
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="#818cf8" 
                      strokeWidth="3" 
                      strokeDasharray={`${fatPercentage} ${100 - fatPercentage}`}
                      strokeDashoffset={`${-(proteinPercentage + carbsPercentage)}`}
                    ></circle>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-500">Total</span>
                    <span className="text-lg font-bold text-slate-800">{totalGrams}g</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mb-2">
              <div className="flex space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Protein</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                  <span>Carbs</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div>
                  <span>Fat</span>
                </div>
              </div>
            </div>
            
            {/* Add meal button */}
            <div className="mt-4">
              <button 
                className="btn btn-primary w-full"
                onClick={() => setAddMealMode(true)}
              >
                <Plus size={16} className="mr-1" />
                Add Meal
              </button>
            </div>
          </div>
          
          {/* Weekly trend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Trend</h3>
            <Chart data={caloriesChartData} height={200} />
          </div>
        </div>
        
        {/* Main content - Meal entries */}
        <div className="lg:col-span-2">
          {/* Meal list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Today's Meals</h3>
              
              <div className="flex items-center">
                <div className="relative mr-2">
                  <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search meals..."
                    className="input-sm pl-8 py-1.5 text-sm border rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 mr-1"
                  aria-label="View Calendar"
                >
                  <Calendar size={18} />
                </button>
                
                <button
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 mr-1"
                  aria-label="View Chart"
                >
                  <BarChart size={18} />
                </button>
                
                <button
                  className="btn btn-primary inline-flex items-center text-sm py-1.5"
                  onClick={() => setAddMealMode(true)}
                >
                  <Plus size={16} className="mr-1" />
                  Add Meal
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {mealsForSelectedDate.length > 0 ? (
                mealsForSelectedDate.map(meal => renderMealEntry(meal))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-block p-3 bg-slate-50 rounded-full mb-3">
                    <Utensils size={24} className="text-slate-400" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-700 mb-2">No meals logged yet</h4>
                  <p className="text-slate-500 mb-4">
                    Start tracking your nutrition by adding your meals for the day
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setAddMealMode(true)}
                  >
                    <Plus size={16} className="mr-1" />
                    Add Your First Meal
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Nutrition insights */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Nutrition Insights</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                AI Generated
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start mb-2">
                  <div className="p-2 rounded-lg bg-green-50 mr-2">
                    <ArrowUpRight size={18} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Excellent Protein Intake</h4>
                    <p className="text-sm text-slate-500">
                      Your protein intake has been consistently within the recommended range.
                    </p>
                  </div>
                </div>
                <div className="pl-9">
                  <p className="text-xs text-slate-600 mt-1">
                    Adequate protein is essential for muscle maintenance and recovery.
                  </p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start mb-2">
                  <div className="p-2 rounded-lg bg-red-50 mr-2">
                    <ArrowDownRight size={18} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">High Added Sugar</h4>
                    <p className="text-sm text-slate-500">
                      Your added sugar intake has been above recommended levels.
                    </p>
                  </div>
                </div>
                <div className="pl-9">
                  <p className="text-xs text-slate-600 mt-1">
                    Try to limit processed foods and check nutrition labels for hidden sugars.
                  </p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start mb-2">
                  <div className="p-2 rounded-lg bg-blue-50 mr-2">
                    <Zap size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Hydration Reminder</h4>
                    <p className="text-sm text-slate-500">
                      Based on your activity level, aim for 2.5-3L of water daily.
                    </p>
                  </div>
                </div>
                <div className="pl-9">
                  <p className="text-xs text-slate-600 mt-1">
                    Proper hydration improves energy levels and aids digestion.
                  </p>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start mb-2">
                  <div className="p-2 rounded-lg bg-purple-50 mr-2">
                    <PieChart size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Diverse Diet</h4>
                    <p className="text-sm text-slate-500">
                      You've consumed 15 different types of foods this week.
                    </p>
                  </div>
                </div>
                <div className="pl-9">
                  <p className="text-xs text-slate-600 mt-1">
                    A diverse diet helps ensure you get a wide range of nutrients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add meal modal */}
      {addMealMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Add Meal</h3>
              <button 
                className="p-1 rounded-full hover:bg-slate-100"
                onClick={() => setAddMealMode(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Meal Type</label>
                  <select className="input">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="input"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0">Food Items</label>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Scan barcode
                  </button>
                </div>
                
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for a food..."
                    className="input pl-9"
                  />
                </div>
                
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 mb-3">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">Oatmeal</p>
                      <p className="text-xs text-slate-500">100g serving</p>
                    </div>
                    <div className="text-sm flex space-x-3">
                      <span className="text-slate-500">150 cal</span>
                      <span className="text-blue-600">Add</span>
                    </div>
                  </div>
                  
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">Banana</p>
                      <p className="text-xs text-slate-500">118g (1 medium)</p>
                    </div>
                    <div className="text-sm flex space-x-3">
                      <span className="text-slate-500">105 cal</span>
                      <span className="text-blue-600">Add</span>
                    </div>
                  </div>
                  
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">Greek Yogurt</p>
                      <p className="text-xs text-slate-500">170g serving</p>
                    </div>
                    <div className="text-sm flex space-x-3">
                      <span className="text-slate-500">100 cal</span>
                      <span className="text-blue-600">Add</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-center text-slate-500 mb-3">
                  Can't find your food? <button className="text-blue-600">Add a custom food</button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="label">Added Items</label>
                <div className="border border-slate-200 rounded-lg min-h-20 p-3">
                  <div className="text-center text-sm text-slate-500">
                    No items added yet
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label mb-1">Add Photo (Optional)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer">
                    <Camera size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500">
                      Click to upload a photo or drag and drop
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea 
                    className="input"
                    rows={4}
                    placeholder="Add any notes about this meal..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 flex space-x-3">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setAddMealMode(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // This would save the meal in a real app
                  setAddMealMode(false);
                }}
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPage;