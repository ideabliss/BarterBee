import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from './UI';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const RecentActivity = ({ activities = [], showAll = false }) => {
  const displayActivities = showAll ? activities : activities.slice(0, 3);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'declined': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        {!showAll && activities.length > 3 && (
          <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </Link>
        )}
      </div>
      
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="border-l-4 border-blue-200 pl-4 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1 p-1 bg-gray-100 rounded-full">
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                  <Badge className={`${getStatusColor(activity.status)} text-xs`}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                  {activity.actionUrl && (
                    <Link to={activity.actionUrl}>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {displayActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;