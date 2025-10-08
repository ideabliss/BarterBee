import React, { useState } from 'react';
import { Button } from '../UI';

const AcceptDeclineModal = ({ isOpen, onClose, activity, onAccept, onDecline }) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
    <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Respond to Request</h3>
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
            <div className="flex justify-between">
              <span className="text-sm font-medium">Will teach you:</span>
              <span className="text-sm">{activity?.exchangeSkill}</span>
            </div>
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
            disabled={loading}
            loading={loading}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcceptDeclineModal;