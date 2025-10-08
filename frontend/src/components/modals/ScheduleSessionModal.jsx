import React, { useState } from 'react';
import { Button } from '../UI';
import apiService from '../../services/api';

const ScheduleSessionModal = ({ isOpen, onClose, activity, onScheduled }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time) {
      alert('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      await apiService.scheduleSession({
        barter_request_id: activity?.requestId,
        scheduled_date: formData.date,
        scheduled_time: formData.time,
        duration_minutes: parseInt(formData.duration),
        session_notes: formData.notes
      });
      
      onScheduled?.();
      onClose();
    } catch (error) {
      console.error('Failed to schedule session:', error);
      alert('Failed to schedule session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">  
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Schedule Session</h3>
        
        <div className="bg-green-50 p-4 rounded-lg mb-4">
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
              <span className="text-sm font-medium">Session type:</span>
              <span className="text-sm">{activity?.skill} exchange</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">You'll learn:</span>
              <span className="text-sm">{activity?.skill}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">You'll teach:</span>
              <span className="text-sm">{activity?.exchangeSkill || 'Photography'}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border rounded-lg px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input 
              type="time" 
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <select 
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Session notes (optional)</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2" 
              rows="2" 
              placeholder="Any specific topics or preparation notes..."
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            Schedule Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;