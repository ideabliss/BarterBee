import React, { useState } from 'react';
import { Button } from '../UI';
import { TruckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import UpdateStatusModal from './UpdateStatusModal';

const TrackingModal = ({ isOpen, onClose, activity }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  if (!isOpen) return null;

  const trackingSteps = [
    { id: 1, title: 'Package Sent', completed: true, date: 'Mar 15, 2024' },
    { id: 2, title: 'In Transit', completed: true, date: 'Mar 16, 2024' },
    { id: 3, title: 'Package Delivered', completed: activity?.status === 'delivered', date: activity?.status === 'delivered' ? 'Mar 18, 2024' : 'Pending' },
    { id: 4, title: 'Return Shipped', completed: false, date: 'Pending' },
    { id: 5, title: 'Exchange Complete', completed: false, date: 'Pending' }
  ];

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
            <p>Tracking ID: BT{Math.random().toString().slice(2, 8)}</p>
            <p>Barter Period: {activity?.barterPeriod || '14 days'}</p>
          </div>
        </div>

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
                <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-500">{step.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Reminder:</strong> Please return the item by Mar 29, 2024 to complete the exchange.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            onClick={() => setShowUpdateModal(true)} 
            className="flex-1"
          >
            Update Status
          </Button>
        </div>

        <UpdateStatusModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          activity={activity}
        />
      </div>
    </div>
  );
};

export default TrackingModal;