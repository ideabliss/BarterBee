import React, { useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const RecentActivityPage = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'skill_request',
      title: 'New skill exchange request',
      description: 'Rudra wants to learn cooking in exchange for guitar lessons',
      timestamp: '2024-03-15T16:30:00Z',
      status: 'pending'
    },
    {
      id: 2,
      type: 'thing_shipped',
      title: 'Item shipped',
      description: 'Your "White Nights" book has been shipped to Rudra',
      timestamp: '2024-03-15T14:20:00Z',
      status: 'in_progress'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
        <p className="text-gray-600 mt-2">Stay updated with all your barter activities</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Activity
          </button>
        </nav>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {activity.title}
                </h3>
                <p className="text-gray-600 mb-2">{activity.description}</p>
                <span className="text-sm text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status.replace('_', ' ').charAt(0).toUpperCase() + activity.status.replace('_', ' ').slice(1)}
                </Badge>
                <Button size="sm" variant="outline" className="w-full md:w-auto">
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityPage;