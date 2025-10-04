import React, { useState } from 'react';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Avatar } from '../components/UI';
import { mockNotifications, currentUser } from '../data/mockData';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    // TODO: Replace with actual API call to backend
    // Example: await notificationsAPI.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    // TODO: Replace with actual API call to backend
    // Example: await notificationsAPI.markAllAsRead();
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'barter_request':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'session_reminder':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'package_update':
        return <InformationCircleIcon className="h-6 w-6 text-green-500" />;
      case 'poll_response':
        return <CheckCircleIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'barter_request':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'session_reminder':
        return 'border-l-blue-500 bg-blue-50';
      case 'package_update':
        return 'border-l-green-500 bg-green-50';
      case 'poll_response':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const NotificationCard = ({ notification }) => (
    <Card className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-md ${
      !notification.read ? 'ring-2 ring-blue-100' : ''
    }`}>
      <div className={`border-l-4 ${getNotificationColor(notification.type)}`}>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    !notification.read ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{getTimeAgo(notification.createdAt)}</span>
                    {!notification.read && (
                      <Badge variant="primary" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(notification.id)}
                      icon={<CheckIcon className="h-4 w-4" />}
                      className="text-xs"
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNotification(notification.id)}
                    icon={<XMarkIcon className="h-4 w-4" />}
                    className="text-gray-400 hover:text-red-500"
                  />
                </div>
              </div>
              
              {notification.actionUrl && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      markAsRead(notification.id);
                      window.location.href = notification.actionUrl;
                    }}
                  >
                    {notification.type === 'barter_request' && 'View Request'}
                    {notification.type === 'session_reminder' && 'Join Session'}
                    {notification.type === 'package_update' && 'Track Package'}
                    {notification.type === 'poll_response' && 'View Poll'}
                    {!['barter_request', 'session_reminder', 'package_update', 'poll_response'].includes(notification.type) && 'View'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              Stay updated with your barter activities and community interactions.
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="hidden sm:flex"
            >
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.read).length}
            </div>
            <div className="text-sm text-gray-600">Read</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'read' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Read ({notifications.filter(n => n.read).length})
          </button>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            className="sm:hidden"
            size="sm"
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No Unread Notifications' : 
               filter === 'read' ? 'No Read Notifications' : 'No Notifications'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'unread' 
                ? 'You\'re all caught up! New notifications will appear here.'
                : filter === 'read'
                ? 'No read notifications yet. Mark some as read to see them here.'
                : 'Your notifications will appear here when you receive them.'
              }
            </p>
            {filter !== 'all' && (
              <Button onClick={() => setFilter('all')}>
                View All Notifications
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="w-full"
            >
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifications([])}
              className="w-full text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/profile'}
              className="w-full"
            >
              View Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/settings'}
              className="w-full"
            >
              Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;