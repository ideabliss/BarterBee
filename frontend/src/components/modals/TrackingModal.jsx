import React, { useState, useEffect } from 'react';
import { Button } from '../UI';
import { TruckIcon, CheckCircleIcon, ClockIcon, PlusIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
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
      return {
        yourItem: [
          { id: 1, title: 'Your Item Packed', completed: false, date: 'Pending', canUpdate: false },
          { id: 2, title: 'Your Item Dispatched', completed: false, date: 'Pending', canUpdate: false },
          { id: 3, title: 'Your Item Delivered', completed: false, date: 'Pending', canUpdate: false }
        ],
        theirItem: [
          { id: 4, title: 'Their Item Packed', completed: false, date: 'Pending', canUpdate: false },
          { id: 5, title: 'Their Item Dispatched', completed: false, date: 'Pending', canUpdate: false },
          { id: 6, title: 'Their Item Received', completed: false, date: 'Pending', canUpdate: false }
        ]
      };
    }
    
    const isFromUser = user?.id === barterRequest?.from_user_id;
    const isToUser = user?.id === barterRequest?.to_user_id;
    
    return {
      yourItem: [
        { 
          id: 1, 
          title: `Your Item Packed (${isFromUser ? barterRequest?.from_item_name : barterRequest?.to_item_name})`, 
          completed: isFromUser ? trackingData.from_item_packed : trackingData.to_item_packed,
          date: isFromUser ? 
            (trackingData.from_item_packed_date ? new Date(trackingData.from_item_packed_date).toLocaleDateString() : 'Pending') :
            (trackingData.to_item_packed_date ? new Date(trackingData.to_item_packed_date).toLocaleDateString() : 'Pending'),
          canUpdate: isFromUser ? !trackingData.from_item_packed : !trackingData.to_item_packed,
          userAction: 'Pack your item for shipping'
        },
        { 
          id: 2, 
          title: 'Your Item Dispatched', 
          completed: isFromUser ? trackingData.from_package_sent : trackingData.to_package_sent,
          date: isFromUser ? 
            (trackingData.from_package_sent_date ? new Date(trackingData.from_package_sent_date).toLocaleDateString() : 'Pending') :
            (trackingData.to_package_sent_date ? new Date(trackingData.to_package_sent_date).toLocaleDateString() : 'Pending'),
          tracking_number: isFromUser ? trackingData.from_tracking_number : trackingData.to_tracking_number,
          canUpdate: isFromUser ? 
            (trackingData.from_item_packed && !trackingData.from_package_sent) :
            (trackingData.to_item_packed && !trackingData.to_package_sent),
          userAction: 'Dispatch your packed item'
        },
        { 
          id: 3, 
          title: 'Your Item Delivered', 
          completed: isFromUser ? trackingData.from_package_delivered : trackingData.to_package_delivered,
          date: isFromUser ? 
            (trackingData.from_package_delivered_date ? new Date(trackingData.from_package_delivered_date).toLocaleDateString() : 'Pending') :
            (trackingData.to_package_delivered_date ? new Date(trackingData.to_package_delivered_date).toLocaleDateString() : 'Pending'),
          canUpdate: false,
          userAction: 'Item delivered to partner'
        }
      ],
      theirItem: [
        { 
          id: 4, 
          title: `Their Item Packed (${isFromUser ? barterRequest?.to_item_name : barterRequest?.from_item_name})`, 
          completed: isFromUser ? trackingData.to_item_packed : trackingData.from_item_packed,
          date: isFromUser ? 
            (trackingData.to_item_packed_date ? new Date(trackingData.to_item_packed_date).toLocaleDateString() : 'Pending') :
            (trackingData.from_item_packed_date ? new Date(trackingData.from_item_packed_date).toLocaleDateString() : 'Pending'),
          canUpdate: false,
          userAction: 'Waiting for partner to pack'
        },
        { 
          id: 5, 
          title: 'Their Item Dispatched', 
          completed: isFromUser ? trackingData.to_package_sent : trackingData.from_package_sent,
          date: isFromUser ? 
            (trackingData.to_package_sent_date ? new Date(trackingData.to_package_sent_date).toLocaleDateString() : 'Pending') :
            (trackingData.from_package_sent_date ? new Date(trackingData.from_package_sent_date).toLocaleDateString() : 'Pending'),
          tracking_number: isFromUser ? trackingData.to_tracking_number : trackingData.from_tracking_number,
          canUpdate: false,
          userAction: 'Partner dispatching item'
        },
        { 
          id: 6, 
          title: 'Their Item Received', 
          completed: isFromUser ? trackingData.to_package_delivered : trackingData.from_package_delivered,
          date: isFromUser ? 
            (trackingData.to_package_delivered_date ? new Date(trackingData.to_package_delivered_date).toLocaleDateString() : 'Pending') :
            (trackingData.from_package_delivered_date ? new Date(trackingData.from_package_delivered_date).toLocaleDateString() : 'Pending'),
          canUpdate: isFromUser ? 
            (trackingData.to_package_sent && !trackingData.to_package_delivered) :
            (trackingData.from_package_sent && !trackingData.from_package_delivered),
          userAction: 'Confirm item received'
        }
      ]
    };
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
              <div className="text-sm text-gray-600 space-y-1">
                <p>📦 Your item: {barterRequest?.from_item_name || activity?.itemName}</p>
                <p>📦 Their item: {barterRequest?.to_item_name || 'Item'}</p>
              </div>
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
          <div className="space-y-6">
            {/* Your Item Section */}
            <div>
              <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
                <ArchiveBoxIcon className="w-4 h-4" />
                Your Item Progress
              </h4>
              <div className="space-y-3">
                {trackingSteps.yourItem.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <ClockIcon className="w-4 h-4" />
                        )}
                      </div>
                      {index < trackingSteps.yourItem.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        {step.canUpdate && (
                          <Button 
                            size="sm" 
                            className="ml-2 px-2 py-1 text-xs"
                            onClick={() => setShowUpdateModal(true)}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{step.date}</p>
                      {step.userAction && !step.completed && (
                        <p className="text-xs text-blue-600 italic">{step.userAction}</p>
                      )}
                      {step.tracking_number && (
                        <p className="text-xs text-blue-600">Tracking: {step.tracking_number}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Their Item Section */}
            <div>
              <h4 className="font-medium text-orange-600 mb-3 flex items-center gap-2">
                <TruckIcon className="w-4 h-4" />
                Their Item Progress
              </h4>
              <div className="space-y-3">
                {trackingSteps.theirItem.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <ClockIcon className="w-4 h-4" />
                        )}
                      </div>
                      {index < trackingSteps.theirItem.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        {step.canUpdate && (
                          <Button 
                            size="sm" 
                            className="ml-2 px-2 py-1 text-xs"
                            onClick={() => setShowUpdateModal(true)}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{step.date}</p>
                      {step.userAction && !step.completed && (
                        <p className="text-xs text-blue-600 italic">{step.userAction}</p>
                      )}
                      {step.tracking_number && (
                        <p className="text-xs text-blue-600">Tracking: {step.tracking_number}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          {trackingData && (getTrackingSteps().yourItem.some(step => step.canUpdate) || getTrackingSteps().theirItem.some(step => step.canUpdate)) && (
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