import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  CubeIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Badge, Avatar } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats, useActivity } from '../hooks/useApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { data: activityData, loading: activityLoading, error: activityError } = useActivity();

  // Debug logging
  useEffect(() => {
    if (statsError) console.error('Stats API Error:', statsError);
    if (activityError) console.error('Activity API Error:', activityError);
    if (stats) console.log('Stats Data:', stats);
    if (activityData) console.log('Activity Data:', activityData);
  }, [stats, activityData, statsError, activityError]);

  const services = [
    {
      id: 'skills',
      title: 'Skill Barter',
      description: 'Learn from experts, teach what you know',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      count: stats?.stats?.skillsOffered || 0,
      action: 'Find a Skill',
      route: '/skills',
      emoji: '🎸'
    },
    {
      id: 'things',
      title: 'Thing Barter',
      description: 'Share items without buying',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      count: stats?.stats?.itemsAvailable || 0,
      action: 'Explore Items',
      route: '/things',
      emoji: '📦'
    },
    {
      id: 'opinions',
      title: 'Opinion Barter',
      description: 'Get real answers from community',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      count: stats?.stats?.opinionPoints || 0,
      action: 'Answer Polls',
      route: '/opinions',
      emoji: '💬'
    }
  ];



  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'active': return <PlayCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hello, {user?.name?.split(' ')[0] || 'Barterer'} 👋
            </h1>
            <p className="text-yellow-100 text-lg">
              Ready to barter today? You have <span className="font-semibold">{stats?.stats?.opinionPoints || 0} points</span> to spend!
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🐝</div>
            <div className="text-sm font-medium mb-1">Barter Score</div>
            <div className="text-2xl font-bold">{stats?.stats?.opinionPoints || 0}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Barter Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Your Barters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                to="/skills"
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 mr-3">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">My Skills</span>
                  <p className="text-xs text-gray-500">Manage & track skill exchanges</p>
                </div>
              </Link>

              <Link 
                to="/things"
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 mr-3">
                  <CubeIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">My Things</span>
                  <p className="text-xs text-gray-500">Manage & track item exchanges</p>
                </div>
              </Link>

              <Link 
                to="/opinions"
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 mr-3">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">My Opinions</span>
                  <p className="text-xs text-gray-500">Manage polls & track points</p>
                </div>
              </Link>
            </div>
          </div>
        </main>

        <aside className="w-full lg:w-80">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Feed</h2>
          <div className="space-y-4">
            {statsError && (
              <div className="text-center py-4 text-red-500">
                <p>Error loading stats: {statsError}</p>
              </div>
            )}
            {activityError && (
              <div className="text-center py-4 text-red-500">
                <p>Error loading activity: {activityError}</p>
              </div>
            )}
            {activityLoading ? (
              <div className="text-center py-4">Loading activities...</div>
            ) : activityData?.activities?.length > 0 ? (
              activityData.activities.slice(0, 3).map((activity) => (
                <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <Avatar 
                      src={activity.from_user?.profile_picture || activity.to_user?.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} 
                      alt="User" 
                      size="sm" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(activity.status)}
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {activity.type === 'skill' ? 'Skill Exchange' : activity.type === 'item' ? 'Item Exchange' : 'Barter Request'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.message || `${activity.type} barter with ${activity.from_user?.name || activity.to_user?.name}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1"
                          onClick={() => navigate(`/${activity.type}s`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No recent activity</p>
                <p className="text-xs">Start bartering to see your activity here!</p>
              </div>
            )}
          </div>

          <Card className="mt-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Community Impact</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Skills Offered</span>
                <span className="font-bold text-yellow-600">{stats?.stats?.skillsOffered || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items Available</span>
                <span className="font-bold text-yellow-600">{stats?.stats?.itemsAvailable || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Opinion Points</span>
                <span className="font-bold text-yellow-600">{stats?.stats?.opinionPoints || 0}</span>
              </div>
              <div className="border-t border-yellow-200 pt-3 mt-3">
                <div className="text-center">
                  <span className="text-sm font-medium text-yellow-800">Barter Level: </span>
                  <span className="font-bold text-yellow-600">Busy Bee 🐝</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;