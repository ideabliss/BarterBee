import React, { useState } from 'react';
import { Modal, Button } from '../UI';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const SessionViewModal = ({ isOpen, onClose, session, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    
    setLoading(true);
    try {
      await apiService.updateSessionStatus(session.id, 'cancelled');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      alert('Failed to cancel session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      alert('Please select new date and time');
      return;
    }

    setLoading(true);
    try {
      await apiService.rescheduleSession(session.id, {
        scheduled_date: newDate,
        scheduled_time: newTime,
        reschedule_reason: rescheduleReason
      });
      onUpdate();
      onClose();
      setShowReschedule(false);
    } catch (error) {
      console.error('Failed to reschedule session:', error);
      alert('Failed to reschedule session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen || !session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Details" maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Session Details */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3">Your Scheduled Session</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Partner: {session.partnerName}</p>
                <p className="text-sm text-gray-600">Skill: {session.skillName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">{formatDate(session.scheduled_date)}</p>
                <p className="text-sm text-gray-600">Scheduled Date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">{formatTime(session.scheduled_time)}</p>
                <p className="text-sm text-gray-600">Duration: {session.duration_minutes || 60} minutes</p>
              </div>
            </div>
          </div>

          {session.session_notes && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-sm font-medium text-gray-700">Notes:</p>
              <p className="text-sm text-gray-600 mt-1">{session.session_notes}</p>
            </div>
          )}
        </div>

        {/* Reschedule Form */}
        {showReschedule && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-gray-900">Reschedule Session</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Why do you need to reschedule?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {!showReschedule ? (
            <>
              <Button
                onClick={() => setShowReschedule(true)}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Reschedule Session
              </Button>
              
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="w-full"
                variant="danger"
              >
                {loading ? 'Cancelling...' : 'Cancel Session'}
              </Button>
            </>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowReschedule(false)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={loading || !newDate || !newTime}
                className="flex-1"
              >
                {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SessionViewModal;