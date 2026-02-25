import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, DollarSign, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Habits', icon: Calendar },
  { to: '/finance', label: 'Finance', icon: DollarSign },
  { to: '/profile', label: 'Profile', icon: User },
];

export const Navbar: React.FC = () => (
  <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
      <span className="text-indigo-400 font-bold text-lg tracking-tight">
        HabitTracker
      </span>
      <div className="flex gap-1">
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
      </div>
    </div>
  </nav>
);
