import React from 'react';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Your Profile
        </h1>
        <p className="text-slate-600">
          Manage your personal information and health data
        </p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <User size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Profile Module Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            The Profile module is under development. Check back soon to update your personal details and manage your health profile.
          </p>
          <button className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;