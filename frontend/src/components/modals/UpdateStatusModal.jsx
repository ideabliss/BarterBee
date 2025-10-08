import React, { useState } from 'react';
import { Button } from '../UI';
import { TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UpdateStatusModal = ({ isOpen, onClose, activity }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'shipped', label: 'Package Shipped', icon: TruckIcon },
    { value: 'delivered', label: 'Package Delivered', icon: CheckCircleIcon },
    { value: 'return_shipped', label: 'Return Package Shipped', icon: TruckIcon },
    { value: 'completed', label: 'Exchange Completed', icon: CheckCircleIcon }
  ];

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Update Exchange Status</h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-medium">Exchange with {activity?.partnerName}</p>
          <p className="text-sm text-gray-600">{activity?.itemName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Update Status</label>
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
          </div>

          {(selectedStatus === 'shipped' || selectedStatus === 'return_shipped') && (
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
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onClose} 
            className="flex-1"
            disabled={!selectedStatus}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;