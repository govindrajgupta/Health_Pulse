import React from 'react';
import { BarChart2 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Health Analytics
        </h1>
        <p className="text-slate-600">
          View comprehensive analytics of your health data
        </p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <BarChart2 size={48} className="text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Analytics Module Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            The Health Analytics module is under development. Check back soon to access detailed reports and trends across all your health metrics.
          </p>
          <button className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;