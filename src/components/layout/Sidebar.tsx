import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  BarChart2, 
  Heart, 
  Home, 
  Menu, 
  Moon, 
  PanelRight, 
  Utensils, 
  X,
  BrainCircuit,
  BellRing,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { title: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { title: 'Stress Test', path: '/stress', icon: <BrainCircuit size={20} /> },
    { title: 'Diet Record', path: '/diet', icon: <Utensils size={20} /> },
    { title: 'Activity', path: '/activity', icon: <Activity size={20} /> },
    { title: 'Sleep', path: '/sleep', icon: <Moon size={20} /> },
    { title: 'Heart Health', path: '/heart', icon: <Heart size={20} /> },
    { title: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { title: 'Notifications', path: '/notifications', icon: <BellRing size={20} /> },
    { title: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed z-50 top-4 left-4 p-2 rounded-md md:hidden text-slate-500 hover:text-slate-600 hover:bg-slate-100"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-800/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          fixed md:relative
          z-40 md:z-0
          w-64 h-full
          bg-white border-r border-slate-200
          transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        <div className="flex items-center justify-center p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <PanelRight className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">HealthPulse</span>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-blue-600 font-medium">
                {user?.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium text-slate-800 truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="px-2 space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 rounded-lg text-sm
                    ${isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                    transition-colors duration-150
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            <p>HealthPulse v1.0</p>
            <p>© 2025 HealthTech Inc.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;