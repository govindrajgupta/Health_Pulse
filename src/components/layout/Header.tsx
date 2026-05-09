import React, { useState, useEffect } from 'react';
import { BellIcon, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  deleteNotification,
  clearAllNotifications as clearAllNotifs,
} from '../../lib/supabaseDataService';

interface HeaderNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);

  // Load notifications from Supabase
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications(user.id).then(({ data }) => {
      setNotifications((data || []) as HeaderNotification[]);
    });
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNotificationClick = async (id: string, path?: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (path) {
      navigate(path);
    }
    setShowNotifications(false);
  };

  const handleClearAll = async () => {
    if (!user?.id) return;
    await clearAllNotifs(user.id);
    setNotifications([]);
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-64 lg:w-96 hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10"
          />
        </div>

        {/* Mobile title */}
        <div className="md:hidden text-xl font-semibold text-slate-800">
          HealthPulse
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 relative"
              aria-label="Notifications"
            >
              <BellIcon size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                            onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                          className={`p-3 hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between">
                            <p className="font-medium text-slate-800">{notification.title}</p>
                            <span className="text-xs text-slate-500">
                              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500">
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-200">
                  <button 
                    className="w-full py-1.5 text-center text-sm text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => navigate('/notifications')}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-slate-100 rounded-lg p-1.5"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-medium">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-sm font-medium text-slate-700">
                {user?.displayName || 'User'}
              </span>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Settings
                  </button>
                  <hr className="my-1 border-slate-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;