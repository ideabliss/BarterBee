import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import { TruckIcon, CheckCircleIcon, ClockIcon, PlusIcon, PackageIcon } from '@heroicons/react/24/outline';
import UpdateStatusModal from './UpdateStatusModal';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TrackingModal = ({ isOpen, onClose, activity, onUpdate }) => {
  const { user } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddTracking, setShowAddTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [barterRequest, setBarterRequest] = useState(null);
  
  useEffect(() => {
    if (isOpen && activity?.requestId) {
      loadTrackingData();
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
  
  const loadTrackingData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTracking(activity.requestId);
      setTrackingData(response.tracking);
    } catch (error) {
      console.log('No tracking data found, will show add tracking option');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTracking = async () => {
    try {
      await apiService.createTracking({
        barter_request_id: activity.requestId,
        tracking_number: trackingNumber,
        shipping_method: 'Standard postal'
      });
      setShowAddTracking(false);
      setTrackingNumber('');
      loadTrackingData();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add tracking:', error);
    }
  };
  
  if (!isOpen) return null;

  const getTrackingSteps = () => {
    if (!trackingData) {
      return [
        { id: 1, title: 'Item Packed', completed: false, date: 'Pending', canUpdate: false },
        { id: 2, title: 'Item Dispatched', completed: false, date: 'Pending', canUpdate: false },
        { id: 3, title: 'Item Received', completed: false, date: 'Pending', canUpdate: false },
        { id: 4, title: 'Exchange Period', completed: false, date: 'Pending', canUpdate: false },
        { id: 5, title: 'Return Packed', completed: false, date: 'Pending', canUpdate: false },
        { id: 6, title: 'Return Dispatched', completed: false, date: 'Pending', canUpdate: false },
        { id: 7, title: 'Return Received', completed: false, date: 'Pending', canUpdate: false },
        { id: 8, title: 'Exchange Complete', completed: false, date: 'Pending', canUpdate: false }
      ];
    }
    
    const isFromUser = user?.id === barterRequest?.from_user_id;
    const isToUser = user?.id === barterRequest?.to_user_id;
    
    return [
      { 
        id: 1, 
        title: 'Item Packed', 
        completed: trackingData.item_packed,
        date: trackingData.item_packed_date ? new Date(trackingData.item_packed_date).toLocaleDateString() : 'Pending',
        canUpdate: isToUser && !trackingData.item_packed,
        userAction: 'Pack your item for shipping'
      },
      { 
        id: 2, 
        title: 'Item Dispatched', 
        completed: trackingData.package_sent,
        date: trackingData.package_sent_date ? new Date(trackingData.package_sent_date).toLocaleDateString() : 'Pending',
        tracking_number: trackingData.tracking_number,
        canUpdate: isToUser && trackingData.item_packed && !trackingData.package_sent,
        userAction: 'Dispatch the packed item'
      },
      { 
        id: 3, 
        title: 'Item Received', 
        completed: trackingData.package_delivered,
        date: trackingData.package_delivered_date ? new Date(trackingData.package_delivered_date).toLocaleDateString() : 'Pending',
        canUpdate: isFromUser && trackingData.package_sent && !trackingData.package_delivered,
        userAction: 'Confirm item received'
      },
      { 
        id: 4, 
        title: 'Exchange Period', 
        completed: trackingData.exchange_started,
        date: trackingData.exchange_started_date ? new Date(trackingData.exchange_started_date).toLocaleDateString() : 'Pending',
        canUpdate: false,
        userAction: 'Enjoy using the item'
      },
      { 
        id: 5, 
        title: 'Return Packed', 
        completed: trackingData.return_packed,
        date: trackingData.return_packed_date ? new Date(trackingData.return_packed_date).toLocaleDateString() : 'Pending',
        canUpdate: isFromUser && trackingData.package_delivered && !trackingData.return_packed,
        userAction: 'Pack item for return'
      },
      { 
        id: 6, 
        title: 'Return Dispatched', 
        completed: trackingData.return_sent,
        date: trackingData.return_sent_date ? new Date(trackingData.return_sent_date).toLocaleDateString() : 'Pending',
        tracking_number: trackingData.return_tracking_number,
        canUpdate: isFromUser && trackingData.return_packed && !trackingData.return_sent,
        userAction: 'Dispatch return package'
      },
      { 
        id: 7, 
        title: 'Return Received', 
        completed: trackingData.return_delivered,
        date: trackingData.return_delivered_date ? new Date(trackingData.return_delivered_date).toLocaleDateString() : 'Pending',
        canUpdate: isToUser && trackingData.return_sent && !trackingData.return_delivered,
        userAction: 'Confirm return received'
      },
      { 
        id: 8, 
        title: 'Exchange Complete', 
        completed: trackingData.exchange_completed,
        date: trackingData.exchange_completed_date ? new Date(trackingData.exchange_completed_date).toLocaleDateString() : 'Pending',
        canUpdate: false,
        userAction: 'Exchange completed successfully'
      }
    ];
  };
  
  const trackingSteps = getTrackingSteps();

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Package Tracking</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3 mb-2">
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Exchange with {activity?.partnerName}</p>
              <p className="text-sm text-gray-600">{activity?.itemName}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {trackingData?.tracking_number && (
              <p>Tracking ID: {trackingData.tracking_number}</p>
            )}
            <p>Barter Period: {activity?.barterPeriod || '14 days'}</p>
            <p>Shipping Method: {trackingData?.shipping_method || 'Standard postal'}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading tracking information...</p>
          </div>
        ) : !trackingData && !showAddTracking ? (
          <div className="text-center py-8">
            <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-900 mb-2">No Tracking Information</h4>
            <p className="text-sm text-gray-600 mb-4">Add tracking information to monitor the exchange progress.</p>
            <Button onClick={() => setShowAddTracking(true)} className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add Tracking
            </Button>
          </div>
        ) : showAddTracking ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter tracking number..."
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddTracking(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddTracking} className="flex-1" disabled={!trackingNumber.trim()}>
                Add Tracking
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <ClockIcon className="w-5 h-5" />
                    )}
                  </div>
                  {index < trackingSteps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </p>
                    {step.canUpdate && (
                      <Button 
                        size="sm" 
                        className="ml-2 px-2 py-1 text-xs"
                        onClick={() => {
                          setShowUpdateModal(true);
                        }}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{step.date}</p>
                  {step.userAction && !step.completed && step.canUpdate && (
                    <p className="text-xs text-blue-600 italic">{step.userAction}</p>
                  )}
                  {step.tracking_number && (
                    <p className="text-xs text-blue-600">Tracking: {step.tracking_number}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {trackingData && !trackingData.return_delivered && (
          <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Reminder:</strong> Please return the item by {new Date(Date.now() + (parseInt(activity?.barterPeriod) || 14) * 24 * 60 * 60 * 1000).toLocaleDateString()} to complete the exchange.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {trackingData && getTrackingSteps().some(step => step.canUpdate) && (
            <Button 
              onClick={() => setShowUpdateModal(true)} 
              className="flex-1"
            >
              Update Status
            </Button>
          )}
        </div>

        <UpdateStatusModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          activity={activity}
          trackingData={trackingData}
          onUpdate={() => {
            loadTrackingData();
            onUpdate?.();
          }}
        />
      </div>
    </div>
  );
};

export default TrackingModal;