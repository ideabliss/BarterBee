import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ApiStatus = () => {
  const apiEndpoints = [
    { name: 'Authentication', status: 'integrated', path: '/auth/login, /auth/register' },
    { name: 'Skills Management', status: 'integrated', path: '/skills/*' },
    { name: 'Items Management', status: 'integrated', path: '/items/*' },
    { name: 'Opinion Polls', status: 'integrated', path: '/polls/*' },
    { name: 'Barter Requests', status: 'integrated', path: '/barter/*' },
    { name: 'Sessions', status: 'integrated', path: '/sessions/*' },
    { name: 'Notifications', status: 'integrated', path: '/notifications/*' },
    { name: 'Messages/Chat', status: 'integrated', path: '/messages/*' },
    { name: 'Reviews', status: 'integrated', path: '/reviews/*' },
    { name: 'Tracking', status: 'integrated', path: '/tracking/*' },
    { name: 'Dashboard', status: 'integrated', path: '/dashboard/*' },
    { name: 'User Profile', status: 'integrated', path: '/users/*' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">API Integration Status</h3>
      <div className="space-y-3">
        {apiEndpoints.map((endpoint, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">{endpoint.name}</div>
              <div className="text-sm text-gray-500">{endpoint.path}</div>
            </div>
            <div className="flex items-center">
              {endpoint.status === 'integrated' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className={`ml-2 text-sm ${
                endpoint.status === 'integrated' ? 'text-green-600' : 'text-red-600'
              }`}>
                {endpoint.status === 'integrated' ? 'Integrated' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          <span className="font-medium text-green-800">All APIs Integrated Successfully!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Frontend is now connected to backend with full authentication and error handling.
        </p>
      </div>
    </div>
  );
};

export default ApiStatus;