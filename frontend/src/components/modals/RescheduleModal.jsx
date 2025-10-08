import React from 'react';
import { Button } from '../UI';

const RescheduleModal = ({ isOpen, onClose, activity }) => {
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Reschedule Session</h3>
        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-yellow-800">
            Current: {activity?.scheduledDate} at {activity?.scheduledTime}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Time</label>
            <input type="time" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2" 
              rows="2" 
              placeholder="Let them know why you're rescheduling..."
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onClose} className="flex-1 bg-yellow-500 hover:bg-yellow-600">
            Reschedule
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;