import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
} from '../lib/supabaseDataService';

interface PageNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PageNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchNotifications(user.id).then(({ data }) => {
      setNotifications((data || []) as PageNotification[]);
      setLoading(false);
    });
  }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = async () => {
    if (!user?.id) return;
    await clearAllNotifications(user.id);
    setNotifications([]);
  };

  const handleMarkAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => markNotificationRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Notifications</h1>
          <p className="text-slate-600">Manage your health alerts and reminders</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex space-x-3">
            <button 
              onClick={handleMarkAllRead}
              className="btn btn-secondary flex items-center text-sm px-3 py-1.5"
            >
              <Check size={16} className="mr-1" /> Mark all read
            </button>
            <button 
              onClick={handleClearAll}
              className="btn flex items-center text-sm px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} className="mr-1" /> Clear all
            </button>
          </div>
        )}
      </header>
      
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Bell size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">All Caught Up!</h2>
          <p className="text-slate-600">You don't have any new notifications right now.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`p-3 rounded-full mr-4 flex-shrink-0 ${!notification.read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Bell size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{notification.title}</h3>
                      <span className="text-sm text-slate-500 whitespace-nowrap ml-4">
                        {new Date(notification.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4">
                      {!notification.read && (
                        <button 
                          onClick={() => handleMarkRead(notification.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                      {notification.action_url && (
                        <Link to={notification.action_url} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                          View details
                        </Link>
                      )}
                      <button 
                        onClick={() => handleDelete(notification.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
