import React from 'react';
import { Modal, Button, Badge } from '../UI';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ isOpen, onClose, user: profileUser }) => {
  const { user: currentUser } = useAuth();
  
  const user = profileUser || currentUser;
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="text-center">
          <img
            src={user.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
            alt={user.name}
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">@{user.username}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Opinion Points</span>
            <Badge variant="primary">{user.points || 0}</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Sessions</span>
            <span className="text-sm font-medium">{user.total_skill_sessions || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Item Exchanges</span>
            <span className="text-sm font-medium">{user.total_item_exchanges || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average Rating</span>
            <div className="flex items-center">
              <span className="text-sm font-medium">{user.average_rating || 0}</span>
              <span className="text-yellow-400 ml-1">★</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;