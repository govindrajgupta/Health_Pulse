import React from 'react';
import { Moon } from 'lucide-react';

const SleepPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Sleep Recorder
        </h1>
        <p className="text-slate-600">
          Track your sleep patterns and improve sleep quality
        </p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <Moon size={48} className="text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Sleep Module Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            The Sleep Recorder is under development. Check back soon to monitor your sleep cycles and get personalized recommendations.
          </p>
          <button className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepPage;