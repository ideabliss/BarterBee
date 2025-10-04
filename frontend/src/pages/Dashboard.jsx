import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  CubeIcon,
  ChatBubbleBottomCenterTextIcon,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Badge, Avatar } from '../components/UI';
import { currentUser } from '../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const services = [
    {
      id: 'skills',
      title: 'Skill Barter',
      description: 'Learn from experts, teach what you know',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      count: currentUser.skills?.length || 0,
      action: 'Find a Skill',
      route: '/skills',
      emoji: '🎸'
    },
    {
      id: 'things',
      title: 'Thing Barter',
      description: 'Share items without buying',
      icon: CubeIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      count: currentUser.things?.length || 0,
      action: 'Explore Items',
      route: '/things',
      emoji: '📦'
    },
    {
      id: 'opinions',
      title: 'Opinion Barter',
      description: 'Get real answers from community',
      icon: ChatBubbleBottomCenterTextIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      count: currentUser.points || 0,
      action: 'Answer Polls',
      route: '/polls',
      emoji: '💬'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'skill_request',
      title: 'Guitar lesson request',
      description: 'Rudra wants to learn guitar from you',
      time: '2 hours ago',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      action: 'Respond'
    },
    {
      id: 2,
      type: 'thing_accepted',
      title: 'Book exchange accepted',
      description: 'Your White Nights book request was accepted',
      time: '1 day ago',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      action: 'View Details'
    },
    {
      id: 3,
      type: 'session_completed',
      title: 'Cooking session completed',
      description: 'Great session with Priya! Leave a review?',
      time: '3 days ago',
      status: 'completed',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      action: 'Review'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <PlayCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-yellow-400 text-white p-2 rounded-xl">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">BarterBee</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-yellow-600 font-medium border-b-2 border-yellow-600 pb-1">
                Home
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 font-medium">
                Profile
              </Link>
              <Link to="/notifications" className="text-gray-600 hover:text-gray-900 font-medium relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <Avatar src={currentUser.profilePicture} alt={currentUser.name} size="sm" />
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-optimized Welcome Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Hello, {currentUser.name.split(' ')[0]} 👋
              </h1>
              <p className="text-yellow-100 text-base sm:text-lg">
                Ready to barter today? You have <span className="font-semibold">{currentUser.points} points</span> to spend!
              </p>
            </div>
            {/* Mobile-visible barter score */}
            <div className="w-full sm:w-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
                <div className="flex sm:flex-col items-center sm:items-center space-x-4 sm:space-x-0 text-center">
                  <div className="text-xl sm:text-2xl">🐝</div>
                  <div className="flex-1 sm:flex-none">
                    <div className="text-sm font-medium mb-1">Barter Score</div>
                    <div className="text-xl sm:text-2xl font-bold">{currentUser.points}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Service Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Barter Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`${service.bgColor} border-2 ${service.borderColor} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{service.emoji}</div>
                    <h3 className={`text-xl font-bold ${service.textColor} mb-2`}>
                      {service.title}
                    </h3>
                    <p className="text-gray-700 mb-4 text-sm">
                      {service.description}
                    </p>
                    
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('active')}`}>
                        {service.count} {service.id === 'opinions' ? 'points' : 'items'}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className={`w-full ${service.color} hover:opacity-90`}
                      onClick={() => navigate(service.route)}
                    >
                      {service.action}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  to="/skills/add"
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
                >
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 mb-2">
                    <PlusIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Skill</span>
                </Link>

                <Link 
                  to="/things/add"
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
                >
                  <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 mb-2">
                    <CubeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Item</span>
                </Link>

                <Link 
                  to="/polls/create"
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
                >
                  <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 mb-2">
                    <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Ask Opinion</span>
                </Link>

                <Link 
                  to="/profile"
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
                >
                  <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-200 mb-2">
                    <UserGroupIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">View Profile</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Feed</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <Avatar src={activity.avatar} alt="User" size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(activity.status)}
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {activity.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1"
                        >
                          {activity.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🌟</div>
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs mt-1">Start bartering to see updates here!</p>
                </div>
              )}
            </div>

            {/* Community Stats */}
            <Card className="mt-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Community Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Your Barters</span>
                  <span className="font-bold text-yellow-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Points Earned</span>
                  <span className="font-bold text-yellow-600">{currentUser.points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">People Helped</span>
                  <span className="font-bold text-yellow-600">8</span>
                </div>
                <div className="border-t border-yellow-200 pt-3 mt-3">
                  <div className="text-center">
                    <span className="text-sm font-medium text-yellow-800">Barter Level: </span>
                    <span className="font-bold text-yellow-600">Busy Bee 🐝</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;