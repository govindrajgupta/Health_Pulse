import React from 'react';
import { BellRing } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Notifications
        </h1>
        <p className="text-slate-600">
          Manage your health alerts and reminders
        </p>
      </header>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <BellRing size={48} className="text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Notifications Module Coming Soon
          </h2>
          <p className="text-slate-600 mb-4">
            The Notifications module is under development. Check back soon to manage your health reminders and alerts.
          </p>
          <button className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;