import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import apiService from '../../services/api';

const ItemAcceptDeclineModal = ({ isOpen, onClose, activity, onAccept, onDecline, currentUserId }) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSenderItem, setSelectedSenderItem] = useState('');
  const [senderItems, setSenderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Check if current user is the sender (from_user) or receiver (to_user)
  const isSender = activity?.fromUserId === currentUserId;
  
  // Fetch sender's items when modal opens
  useEffect(() => {
    if (isOpen && !isSender && activity?.fromUserId) {
      fetchSenderItems();
    }
  }, [isOpen, isSender, activity?.fromUserId]);

  if (!isOpen) return null;
  
  const fetchSenderItems = async () => {
    try {
      setLoadingItems(true);
      console.log('Fetching items for user:', activity.fromUserId);
      const response = await apiService.getUserItems(activity.fromUserId);
      console.log('Sender items response:', response);
      const availableItems = response.items?.filter(item => item.is_available !== false) || [];
      console.log('Available items:', availableItems);
      setSenderItems(availableItems);
    } catch (error) {
      console.error('Failed to fetch sender items:', error);
      setSenderItems([]);
    } finally {
      setLoadingItems(false);
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
          {isSender ? 'Your Item Exchange Request' : 'Respond to Item Exchange Request'}
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
              <p className="text-sm text-gray-600">⭐ 4.7 • 12 exchanges</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">They want:</span>
              <span className="text-sm">{activity?.itemName || activity?.wantedItem || 'Item'}</span>
            </div>
            {isSender ? (
              <div className="flex justify-between">
                <span className="text-sm font-medium">You offer:</span>
                <span className="text-sm">{activity?.offeredItemName || activity?.offeredItem || 'Your item'}</span>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium mb-2 block">Select item you want from them:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {loadingItems ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading items...</p>
                    </div>
                  ) : senderItems.length > 0 ? (
                    senderItems.map(item => (
                      <label key={item.id} className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                        selectedSenderItem == item.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="senderItem"
                          value={item.id}
                          checked={selectedSenderItem == item.id}
                          onChange={(e) => setSelectedSenderItem(e.target.value)}
                          className="text-green-600"
                        />
                        <img
                          src={item.image || '/api/placeholder/32/32'}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            selectedSenderItem == item.id ? 'text-green-900' : 'text-gray-900'
                          }`}>{item.name}</p>
                          <p className={`text-xs ${
                            selectedSenderItem == item.id ? 'text-green-600' : 'text-gray-500'
                          }`}>{item.category}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items available</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Barter period:</span>
              <span className="text-sm">{activity?.barterPeriod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Shipping:</span>
              <span className="text-sm">{activity?.shippingMethod || 'Standard postal'}</span>
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
              placeholder="Hi! I'd be happy to exchange items. The barter period works for me..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Postal address (if accepting)</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2" 
              rows="2" 
              placeholder="Your shipping address for item exchange..."
              value={postalAddress}
              onChange={(e) => setPostalAddress(e.target.value)}
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
                disabled={loading || !selectedSenderItem}
                loading={loading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Accept Exchange
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemAcceptDeclineModal;