import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import apiService from '../../services/api';

const AcceptDeclineModal = ({ isOpen, onClose, activity, onAccept, onDecline, currentUserId }) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSenderSkill, setSelectedSenderSkill] = useState('');
  const [senderSkills, setSenderSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  
  // Check if current user is the sender (from_user) or receiver (to_user)
  const isSender = activity?.fromUserId === currentUserId;
  
  // Fetch sender's skills when modal opens
  useEffect(() => {
    if (isOpen && !isSender && activity?.fromUserId) {
      fetchSenderSkills();
    }
  }, [isOpen, isSender, activity?.fromUserId]);

  if (!isOpen) return null;
  
  const fetchSenderSkills = async () => {
    try {
      setLoadingSkills(true);
      const response = await apiService.getUserSkills(activity.fromUserId);
      setSenderSkills(response.skills || []);
    } catch (error) {
      console.error('Failed to fetch sender skills:', error);
      setSenderSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept?.(activity?.requestId, responseMessage);
      onClose();
    } catch (error) {
      console.error('Failed to accept request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await onDecline?.(activity?.requestId, responseMessage);
      onClose();
    } catch (error) {
      console.error('Failed to decline request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onDecline?.(activity?.requestId, 'Request cancelled by sender');
      onClose();
    } catch (error) {
      console.error('Failed to cancel request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
    <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {isSender ? 'Your Skill Exchange Request' : 'Respond to Skill Request'}
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={activity?.partnerAvatar || '/api/placeholder/40/40'} 
              alt={activity?.partnerName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{activity?.partnerName}</p>
              <p className="text-sm text-gray-600">⭐ 4.8 • 25 sessions</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Wants to learn:</span>
              <span className="text-sm">{activity?.skill}</span>
            </div>
            {isSender ? (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Will teach you:</span>
                <span className="text-sm">{activity?.exchangeSkill}</span>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium mb-2 block">Select skill you want to learn from them:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {loadingSkills ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading skills...</p>
                    </div>
                  ) : senderSkills.length > 0 ? (
                    senderSkills.map(skill => (
                      <label key={skill.id} className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                        selectedSenderSkill == skill.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="senderSkill"
                          value={skill.id}
                          checked={selectedSenderSkill == skill.id}
                          onChange={(e) => setSelectedSenderSkill(e.target.value)}
                          className="text-green-600"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedSenderSkill == skill.id ? 'text-green-900' : 'text-gray-900'
                          }`}>{skill.name}</p>
                          <p className={`text-xs ${
                            selectedSenderSkill == skill.id ? 'text-green-600' : 'text-gray-500'
                          }`}>{skill.category} • {skill.proficiency_level}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills available</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Preferred date:</span>
              <span className="text-sm">{activity?.preferredDate || 'March 22, 2024'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Preferred time:</span>
              <span className="text-sm">{activity?.preferredTime || '6:00 PM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Duration:</span>
              <span className="text-sm">{activity?.duration || '60 minutes'}</span>
            </div>
          </div>
          
          {activity?.requestMessage && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm font-medium mb-1">Message:</p>
              <p className="text-sm text-gray-700 italic">"{activity.requestMessage}"</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your response message (optional)</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2" 
              rows="3" 
              placeholder="Hi! I'd be happy to help you learn. The time works for me..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          {isSender ? (
            // Sender can only cancel the request
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
                loading={loading}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Cancel Request
              </Button>
            </>
          ) : (
            // Receiver can accept or decline
            <>
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={loading}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Decline
              </Button>
              <Button 
                onClick={handleAccept}
                disabled={loading || !selectedSenderSkill}
                loading={loading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Accept
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptDeclineModal;