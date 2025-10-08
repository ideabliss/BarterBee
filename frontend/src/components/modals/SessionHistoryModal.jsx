import React from 'react';
import { Modal, Button, Badge } from '../UI';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const SessionHistoryModal = ({ isOpen, onClose, activity, onScheduleNext }) => {
  if (!activity) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session History">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Progress Overview</h3>
          <div className="flex items-center justify-between">
            <span>Sessions Completed:</span>
            <span className="font-semibold">{activity.completedSessions || 0} / {activity.totalSessions || 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((activity.completedSessions || 0) / (activity.totalSessions || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Session History</h4>
          {activity.sessionHistory && activity.sessionHistory.length > 0 ? (
            activity.sessionHistory.map((session, index) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(session.status)}
                    <span className="font-medium">Session {index + 1}</span>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Date: {new Date(session.scheduled_date).toLocaleDateString()}</div>
                  <div>Time: {session.scheduled_time}</div>
                  <div>Duration: {session.duration_minutes || 60} minutes</div>
                  {session.session_notes && (
                    <div>Notes: {session.session_notes}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sessions scheduled yet
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          {activity.canScheduleNext && (
            <Button 
              onClick={() => {
                onScheduleNext();
                onClose();
              }}
              className="flex-1"
            >
              Schedule Next Session
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SessionHistoryModal;