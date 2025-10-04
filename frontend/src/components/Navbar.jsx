import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Avatar, NotificationDot } from './UI';
import { currentUser, mockNotifications } from '../data/mockData';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;
  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, badge: unreadNotifications }
  ];
  
  const handleLogout = () => {
    // In a real app, this would clear auth tokens
    navigate('/login');
  };
  
  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
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
          <div className="hidden md:block">
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
          </div>
          
          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
              <Avatar src={currentUser.profilePicture} alt={currentUser.name} size="sm" />
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{currentUser.name}</div>
                <div className="text-gray-500 font-medium">@{currentUser.username}</div>
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
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="group text-gray-500 hover:text-gray-700 p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-md transform hover:scale-105"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
              ) : (
                <Bars3Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="px-4 pt-4 pb-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                    {item.badge > 0 && <NotificationDot show={true} />}
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex items-center space-x-4 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <Avatar src={currentUser.profilePicture} alt={currentUser.name} />
                <div>
                  <div className="font-semibold text-gray-900">{currentUser.name}</div>
                  <div className="text-sm text-gray-500 font-medium">@{currentUser.username}</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-4 px-4 py-3 mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-md font-semibold transform hover:scale-[1.02]"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;