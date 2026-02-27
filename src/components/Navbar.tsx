import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../store';

const NAV_ITEMS = [
  { to: '/', label: 'Habits', icon: Calendar },
  { to: '/finance', label: 'Finance', icon: DollarSign },
  { to: '/profile', label: 'Profile', icon: User },
];

export const Navbar: React.FC = () => {
  const { user, cloudEnabled, signOut } = useAuth();
  const resetState = useStore((s) => s.resetState);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    resetState();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="text-indigo-400 font-bold text-lg tracking-tight">
          HabitTracker
        </span>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {cloudEnabled && user && (
            <button
              onClick={handleSignOut}
              className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              title={`Sign out (${user.email})`}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
