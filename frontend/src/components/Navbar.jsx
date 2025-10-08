import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Avatar, NotificationDot } from './UI';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const unreadNotifications = 0;
  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, badge: unreadNotifications },
    { name: 'Profile', href: '/profile', icon: UserIcon }
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <>
      {/* Desktop/Tablet Top Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 md:block hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-2.5 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300 group-hover:shadow-xl">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BarterBee</div>
                <div className="text-xs text-gray-500 -mt-1 font-medium">Learn, Lend, Loop</div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {item.badge > 0 && <NotificationDot show={true} />}
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
              <Avatar src={user?.profile_picture} alt={user?.name} size="sm" />
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{user?.name || 'User'}</div>
                <div className="text-gray-500 font-medium">@{user?.username || 'username'}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="group text-gray-500 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50 transition-all duration-300 hover:shadow-md transform hover:scale-105"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Top Bar - Simple Logo Only */}
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40 md:hidden pb-safe">
      <div className="px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-2 rounded-lg shadow-md">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BarterBee</div>
            </div>
          </Link>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Bottom Navigation Bar */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-xl transition-all duration-200 active:scale-95"
            >
              <div className="relative">
                <Icon 
                  className={`h-6 w-6 transition-colors ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500'
                  }`} 
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span 
                className={`text-xs mt-1 font-medium ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
};

export default Navbar;