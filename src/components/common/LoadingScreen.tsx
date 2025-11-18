import React from 'react';
import { ActivityIcon } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <ActivityIcon size={48} className="text-blue-600 animate-pulse" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-5 bg-white rounded-full" />
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-700">Loading</h2>
      <p className="mt-2 text-slate-500">Preparing your health dashboard...</p>
      
      <div className="mt-6 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;