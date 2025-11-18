import React, { useState } from 'react';
import {
  BrainCircuit,
  ArrowRight,
  Heart,
  Plus,
  BarChart3,
  ListChecks,
  LineChart,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Chart from '../common/Chart';
import ProgressCircle from '../common/ProgressCircle';
import { 
  generateMockStressData, 
  mockStressQuestions, 
  generateMockChartData 
} from '../../utils/mockData';
import { StressData, StressQuestion } from '../../types';

const StressPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'history'>('overview');
  const [stressLogMode, setStressLogMode] = useState(false);
  
  // Get mock data
  const stressDataList = generateMockStressData();
  const stressChartData = generateMockChartData('stress');
  const hrvChartData = generateMockChartData('heartRate');
  
  // State for the stress test
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testComplete, setTestComplete] = useState(false);
  const [testScore, setTestScore] = useState(0);
  
  // Handle stress test answer selection
  const handleAnswerSelect = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value });
  };
  
  // Handle next question in stress test
  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockStressQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
      const averageScore = Math.round(totalScore / mockStressQuestions.length);
      setTestScore(averageScore);
      setTestComplete(true);
    }
  };
  
  // Restart the stress test
  const handleRestartTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestComplete(false);
    setTestScore(0);
  };
  
  // Get the latest stress level
  const latestStressLevel = stressDataList.length > 0 ? stressDataList[0].level : 5;
  
  // Render the current question in the stress test
  const renderCurrentQuestion = () => {
    const question = mockStressQuestions[currentQuestionIndex];
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Question {currentQuestionIndex + 1} of {mockStressQuestions.length}
        </h3>
        
        <p className="text-slate-800 mb-6">{question.question}</p>
        
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              className={`w-full text-left p-3 rounded-lg border ${
                answers[question.id] === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => handleAnswerSelect(question.id, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            className="btn btn-primary"
            onClick={handleNextQuestion}
            disabled={!answers[question.id]}
          >
            {currentQuestionIndex < mockStressQuestions.length - 1 ? 'Next Question' : 'Complete Test'}
          </button>
        </div>
      </div>
    );
  };
  
  // Render the test results
  const renderTestResults = () => {
    let resultMessage = '';
    let resultColor = '';
    
    if (testScore <= 3) {
      resultMessage = 'Your stress levels are low. Keep up the good work!';
      resultColor = 'text-green-600';
    } else if (testScore <= 6) {
      resultMessage = 'You have moderate stress levels. Consider some stress management techniques.';
      resultColor = 'text-amber-600';
    } else {
      resultMessage = 'Your stress levels are high. We recommend talking to a healthcare professional.';
      resultColor = 'text-red-600';
    }
    
    return (
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <ProgressCircle
            percentage={(testScore / 10) * 100}
            size={120}
            progressColor={
              testScore <= 3 ? '#22c55e' : testScore <= 6 ? '#f59e0b' : '#ef4444'
            }
          >
            <div className="text-center">
              <div className="text-2xl font-bold">{testScore}</div>
              <div className="text-xs text-slate-500">out of 10</div>
            </div>
          </ProgressCircle>
        </div>
        
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Test Complete
        </h3>
        
        <p className={`text-lg mb-4 ${resultColor}`}>
          {resultMessage}
        </p>
        
        <p className="text-slate-600 mb-6">
          Based on your responses, we've calculated your stress level. 
          This is a point-in-time assessment and may change based on circumstances.
        </p>
        
        <div className="flex justify-center space-x-3">
          <button
            className="btn btn-secondary"
            onClick={handleRestartTest}
          >
            Take Test Again
          </button>
          
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab('overview')}
          >
            View Stress Overview
          </button>
        </div>
      </div>
    );
  };
  
  // Render stress history
  const renderStressHistory = () => {
    return stressDataList.map((stressData, index) => (
      <div 
        key={stressData.id} 
        className="p-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-slate-800">
              {stressData.date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-sm text-slate-500">
              {stressData.symptoms.length > 0 
                ? `Symptoms: ${stressData.symptoms.join(', ')}` 
                : 'No symptoms reported'}
            </p>
          </div>
          
          <div className="flex items-center">
            <div 
              className={`
                h-10 w-10 rounded-full flex items-center justify-center font-medium
                ${stressData.level <= 3 
                  ? 'bg-green-100 text-green-700' 
                  : stressData.level <= 6 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-red-100 text-red-700'
                }
              `}
            >
              {stressData.level}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Stress Management
        </h1>
        <p className="text-slate-600">
          Monitor and manage your stress levels for better mental health
        </p>
      </header>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            className={`pb-3 px-1 font-medium text-sm ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-3 px-1 font-medium text-sm ${
              activeTab === 'test'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setActiveTab('test');
              setTestComplete(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
            }}
          >
            Stress Test
          </button>
          <button
            className={`pb-3 px-1 font-medium text-sm ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div>
          {/* Main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-4">Current Stress Level</h3>
              <div className="flex justify-center">
                <ProgressCircle
                  percentage={(latestStressLevel / 10) * 100}
                  size={140}
                  progressColor={
                    latestStressLevel <= 3 ? '#22c55e' : latestStressLevel <= 6 ? '#f59e0b' : '#ef4444'
                  }
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold">{latestStressLevel}</div>
                    <div className="text-xs text-slate-500">out of 10</div>
                  </div>
                </ProgressCircle>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600">
                  {latestStressLevel <= 3 
                    ? 'Low stress level' 
                    : latestStressLevel <= 6 
                      ? 'Moderate stress level' 
                      : 'High stress level'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-4">Heart Rate Variability</h3>
              <div className="flex items-center justify-center h-[140px]">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Heart className="text-red-500 mr-2" size={24} />
                    <span className="text-3xl font-bold">67</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">ms</p>
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    Good HRV score
                  </p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center mx-auto"
                  onClick={() => {}}
                >
                  Learn about HRV <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Quick Actions</h3>
              
              <div className="space-y-2 mt-4">
                <button 
                  className="w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-left"
                  onClick={() => setActiveTab('test')}
                >
                  <span className="flex items-center">
                    <ListChecks size={18} className="text-blue-600 mr-2" />
                    Take Stress Assessment
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>
                
                <button 
                  className="w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-left"
                  onClick={() => setStressLogMode(true)}
                >
                  <span className="flex items-center">
                    <Plus size={18} className="text-blue-600 mr-2" />
                    Log Stress Manually
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>
                
                <button 
                  className="w-full flex items-center justify-between p-3 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-left"
                  onClick={() => {}}
                >
                  <span className="flex items-center">
                    <BarChart3 size={18} className="text-blue-600 mr-2" />
                    View Detailed Analytics
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Stress Trend (Last Week)</h3>
              <Chart data={stressChartData} height={250} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Heart Rate Variability Trend</h3>
              <Chart data={hrvChartData} height={250} />
            </div>
          </div>
          
          {/* Stress management tips */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Stress Management Recommendations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-slate-800 mb-2">Deep Breathing Exercises</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Practice 4-7-8 breathing: inhale for 4 seconds, hold for 7, exhale for 8.
                  Repeat 5 times, 3 times daily.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">5 min daily</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Learn more</button>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-slate-800 mb-2">Progressive Muscle Relaxation</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Tense and then release each muscle group, starting from feet and moving up.
                  Focus on the sensation of relaxation.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">10 min daily</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Learn more</button>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-slate-800 mb-2">Mindfulness Meditation</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Find a quiet place, focus on your breath, and bring awareness to the present moment.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">15 min daily</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Learn more</button>
                </div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-slate-800 mb-2">Physical Activity</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Engage in moderate exercise like walking, jogging, or yoga to reduce stress hormones.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">30 min daily</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Learn more</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'test' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-purple-100 mr-3">
                <BrainCircuit size={24} className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Stress Assessment
              </h2>
            </div>
            
            <p className="text-slate-600 mb-6">
              This scientifically-validated questionnaire helps measure your current stress levels. 
              Answer honestly for the most accurate results.
            </p>
            
            {testComplete ? renderTestResults() : renderCurrentQuestion()}
          </div>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Stress History</h3>
            
            <div className="flex items-center">
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
                <LineChart size={18} />
              </button>
              <button 
                className="btn btn-primary inline-flex items-center text-sm py-1.5"
                onClick={() => setStressLogMode(true)}
              >
                <Plus size={16} className="mr-1" />
                Log Stress
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {renderStressHistory()}
          </div>
          
          <div className="p-4 border-t border-slate-200">
            <button 
              className="w-full py-2 text-center text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              View More History
            </button>
          </div>
        </div>
      )}
      
      {/* Stress log modal */}
      {stressLogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Log Stress Level</h3>
              <button 
                className="p-1 rounded-full hover:bg-slate-100"
                onClick={() => setStressLogMode(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="label">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="input"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="mb-4">
                <label className="label">Stress Level (1-10)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  defaultValue="5"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 (Low)</span>
                  <span>10 (High)</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="label">Symptoms (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {['Headache', 'Fatigue', 'Irritability', 'Trouble focusing', 'Muscle tension'].map(symptom => (
                    <label key={symptom} className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                      <input type="checkbox" className="mr-1.5" />
                      {symptom}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="label">Notes (Optional)</label>
                <textarea 
                  className="input"
                  rows={3}
                  placeholder="Add any notes about what might be causing your stress..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 flex space-x-3">
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setStressLogMode(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={() => {
                  // This would save the data in a real app
                  setStressLogMode(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StressPage;