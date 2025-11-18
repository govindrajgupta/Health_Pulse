import React from 'react';
import { Activity } from 'lucide-react';

const ActivityPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Activity Tracker
        </h1>
        <p className="text-slate-600">
          Monitor your physical activity and fitness progress
        </p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <Activity size={48} className="text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Activity Module Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            The Activity Tracker is under development. Check back soon to track your steps, workouts, and fitness progress.
          </p>
          <button className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;