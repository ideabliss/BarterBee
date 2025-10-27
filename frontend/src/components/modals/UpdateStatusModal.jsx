import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import { TruckIcon, CheckCircleIcon, ArchiveBoxIcon, InboxIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UpdateStatusModal = ({ isOpen, onClose, activity, trackingData, onUpdate }) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [barterRequest, setBarterRequest] = useState(null);

  useEffect(() => {
    if (isOpen && activity?.requestId) {
      loadBarterRequest();
    }
  }, [isOpen, activity?.requestId]);
  
  const loadBarterRequest = async () => {
    try {
      const response = await apiService.getBarterRequests();
      const request = response.requests?.find(req => req.id === activity.requestId);
      setBarterRequest(request);
    } catch (error) {
      console.error('Failed to load barter request:', error);
    }
  };

  if (!isOpen) return null;
  
  const handleUpdateStatus = async () => {
    if (!selectedStatus || !trackingData) return;
    
    try {
      setLoading(true);
      await apiService.updateTrackingStatus(trackingData.id, {
        status: selectedStatus,
        tracking_number: trackingNumber,
        notes
      });
      
      setSelectedStatus('');
      setTrackingNumber('');
      setNotes('');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to update tracking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStatusOptions = () => {
    if (!trackingData || !barterRequest) return [];
    
    const isFromUser = user?.id === barterRequest.from_user_id;
    const isToUser = user?.id === barterRequest.to_user_id;
    const options = [];
    
    if (isToUser) {
      // Item owner can update: pack, dispatch, receive return
      if (!trackingData.item_packed) {
        options.push({ value: 'item_packed', label: 'Item Packed', icon: ArchiveBoxIcon });
      } else if (!trackingData.package_sent) {
        options.push({ value: 'dispatched', label: 'Item Dispatched', icon: TruckIcon });
      } else if (trackingData.return_sent && !trackingData.return_delivered) {
        options.push({ value: 'return_received', label: 'Return Received', icon: InboxIcon });
      }
    }
    
    if (isFromUser) {
      // Item borrower can update: receive item, pack return, dispatch return
      if (trackingData.package_sent && !trackingData.package_delivered) {
        options.push({ value: 'received', label: 'Item Received', icon: CheckCircleIcon });
      } else if (trackingData.package_delivered && !trackingData.return_packed) {
        options.push({ value: 'return_packed', label: 'Return Packed', icon: ArchiveBoxIcon });
      } else if (trackingData.return_packed && !trackingData.return_sent) {
        options.push({ value: 'return_dispatched', label: 'Return Dispatched', icon: TruckIcon });
      }
    }
    
    return options;
  };
  
  const statusOptions = getAvailableStatusOptions();

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Update Exchange Status</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-medium">Exchange with {activity?.partnerName}</p>
          <p className="text-sm text-gray-600">{activity?.itemName}</p>
          {trackingData?.tracking_number && (
            <p className="text-xs text-gray-500 mt-1">Tracking: {trackingData.tracking_number}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Update Status</label>
            {statusOptions.length > 0 ? (
              <div className="space-y-2">
                {statusOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="text-blue-600"
                      />
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No status updates available at this time.</p>
              </div>
            )}
          </div>

          {(selectedStatus === 'dispatched' || selectedStatus === 'return_dispatched') && (
            <div>
              <label className="block text-sm font-medium mb-1">Tracking Number (optional)</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter tracking number..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows="3"
              placeholder="Add any additional notes about the status update..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            className="flex-1"
            disabled={!selectedStatus || loading}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;