import React from 'react';
import { Button } from '../UI';

const ReviewModal = ({ isOpen, onClose, activity }) => {
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          Leave Review for {activity?.partnerName}
        </h3>
        <div className="bg-green-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-green-800">
            Session: {activity?.skill} exchange completed
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Teaching Quality (1-5 stars)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="text-2xl text-yellow-400 hover:text-yellow-500">
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Communication (1-5 stars)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="text-2xl text-yellow-400 hover:text-yellow-500">
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Written Review</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2" 
              rows="4" 
              placeholder="Share your learning experience, teaching style, and overall satisfaction..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="recommend" className="rounded" />
            <label htmlFor="recommend" className="text-sm">
              I would recommend this teacher to others
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onClose} className="flex-1 bg-orange-500 hover:bg-orange-600">
            Submit Review
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;