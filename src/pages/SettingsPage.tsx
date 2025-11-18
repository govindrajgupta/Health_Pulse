import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Settings
        </h1>
        <p className="text-slate-600">
          Configure your account and application preferences
        </p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <Settings size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Settings Module Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            The Settings module is under development. Check back soon to customize your preferences and manage account settings.
          </p>
          <button className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;