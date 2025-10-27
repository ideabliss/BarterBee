import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  ArrowsRightLeftIcon,
  StarIcon,
  PlusIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, Input, Button, Badge, Avatar, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const SkillBarterActivityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectSkillModalOpen, setSelectSkillModalOpen] = useState(false);
  const [updateSessionModalOpen, setUpdateSessionModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [videoCallModalOpen, setVideoCallModalOpen] = useState(false);
  
  // Form states
  const [selectedBarterSkill, setSelectedBarterSkill] = useState(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [reportText, setReportText] = useState('');

  // Load activities from API
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBarterActivity();
      console.log('📊 Loaded activities:', response);
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock activities data
  const mockActivities = [
    {
      id: 1,
      status: 'pending',
      requestedSkill: { name: 'Guitar Lessons', emoji: '🎸', category: 'Music' },
      offeredSkill: null,
      requester: mockUsers[1],
      provider: currentUser,
      dateRequested: '2024-01-15',
      scheduledDate: '2024-01-20',
      scheduledTime: '14:00',
      message: 'Hi! I would love to learn guitar from you. I can teach cooking in return!',
      isIncoming: true
    },
    {
      id: 2,
      status: 'accepted',
      requestedSkill: { name: 'Cooking Classes', emoji: '🍳', category: 'Cooking' },
      offeredSkill: { name: 'Web Development', emoji: '💻', category: 'Technology' },
      requester: currentUser,
      provider: mockUsers[2],
      dateRequested: '2024-01-14',
      scheduledDate: '2024-01-22',
      scheduledTime: '16:00',
      message: 'Looking forward to learning cooking from you!',
      isIncoming: false
    },
    {
      id: 3,
      status: 'scheduled',
      requestedSkill: { name: 'Photography', emoji: '📸', category: 'Arts' },
      offeredSkill: { name: 'Yoga Training', emoji: '🧘', category: 'Fitness' },
      requester: mockUsers[3],
      provider: currentUser,
      dateRequested: '2024-01-10',
      scheduledDate: '2024-01-18',
      scheduledTime: '10:00',
      message: 'Excited to exchange skills with you!',
      isIncoming: true
    },
    {
      id: 4,
      status: 'ongoing',
      requestedSkill: { name: 'Spanish Language', emoji: '🇪🇸', category: 'Language' },
      offeredSkill: { name: 'Graphic Design', emoji: '🎨', category: 'Design' },
      requester: currentUser,
      provider: mockUsers[0],
      dateRequested: '2024-01-12',
      scheduledDate: '2024-01-17',
      scheduledTime: '15:00',
      sessionStarted: '2024-01-17T15:05:00',
      message: '¡Hola! Ready to learn Spanish?',
      isIncoming: false
    },
    {
      id: 5,
      status: 'completed',
      requestedSkill: { name: 'Piano Lessons', emoji: '🎹', category: 'Music' },
      offeredSkill: { name: 'Meditation', emoji: '🧘‍♂️', category: 'Wellness' },
      requester: mockUsers[4],
      provider: currentUser,
      dateRequested: '2024-01-05',
      scheduledDate: '2024-01-10',
      scheduledTime: '11:00',
      completedDate: '2024-01-10',
      rating: 5,
      review: 'Amazing teacher! Very patient and knowledgeable.',
      message: 'Thank you for the wonderful session!',
      isIncoming: true
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const fromSkillName = activity.from_skill?.name || '';
    const toSkillName = activity.to_skill?.name || '';
    const fromUserName = activity.from_user?.name || '';
    const toUserName = activity.to_user?.name || '';
    
    const matchesSearch = 
      fromSkillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toSkillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toUserName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        borderColor: 'border-yellow-400',
        icon: ClockIcon
      },
      accepted: {
        label: 'Accepted',
        color: 'bg-green-100 text-green-800 border-green-200',
        borderColor: 'border-green-400',
        icon: CheckCircleIcon
      },
      scheduled: {
        label: 'Scheduled',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        borderColor: 'border-blue-400',
        icon: CalendarIcon
      },
      ongoing: {
        label: 'Ongoing',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        borderColor: 'border-indigo-400',
        icon: VideoCameraIcon
      },
      completed: {
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        borderColor: 'border-gray-400',
        icon: CheckCircleIcon
      }
    };
    return configs[status] || configs.pending;
  };

  const handleSelectSkill = (skill) => {
    setSelectedBarterSkill(skill);
  };

  const handleAcceptWithSkill = () => {
    if (!selectedBarterSkill) return;
    console.log('Accepting request with skill:', selectedBarterSkill);
    // TODO: API call to accept request
    setSelectSkillModalOpen(false);
    setSelectedBarterSkill(null);
  };

  const handleUpdateSession = async () => {
    if (!sessionDate || !sessionTime) {
      alert('Please select both date and time');
      return;
    }

    if (!selectedActivity?.id) {
      alert('Error: Activity ID is missing');
      return;
    }

    try {
      console.log('📅 Scheduling session:', {
        barter_request_id: selectedActivity.id,
        scheduled_date: sessionDate,
        scheduled_time: sessionTime
      });

      await apiService.scheduleSession({
        barter_request_id: selectedActivity.id,
        scheduled_date: sessionDate,
        scheduled_time: sessionTime,
        duration_minutes: 60,
        session_notes: ''
      });

      alert('Session scheduled successfully!');
      setUpdateSessionModalOpen(false);
      loadActivities(); // Reload activities
    } catch (error) {
      console.error('Failed to schedule session:', error);
      alert('Failed to schedule session: ' + (error.message || 'Please try again'));
    }
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', { rating, reviewText });
    // TODO: API call to submit review
    setReviewModalOpen(false);
    setRating(0);
    setReviewText('');
  };

  const handleSubmitReport = () => {
    console.log('Submitting report:', reportText);
    // TODO: API call to submit report
    setReportModalOpen(false);
    setReportText('');
    // Show success toast
    alert('Report submitted successfully. Our team will review it shortly.');
  };

  const ActivityCard = ({ activity }) => {
    const statusConfig = getStatusConfig(activity.status);
    const StatusIcon = statusConfig.icon;
    
    // Determine if this is an incoming or outgoing request
    const isIncoming = activity.to_user_id === user?.id;
    const otherUser = isIncoming ? activity.from_user : activity.to_user;
    const mySkill = isIncoming ? activity.to_skill : activity.from_skill;
    const theirSkill = isIncoming ? activity.from_skill : activity.to_skill;
    
    // Get the first session if it exists
    const nextSession = activity.sessions?.[0];

    return (
      <Card className={`p-6 hover:shadow-2xl transition-all duration-300 border-l-4 ${statusConfig.borderColor} group`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-bold text-gray-900">{theirSkill?.name || 'Skill Exchange'}</h3>
            </div>
            {mySkill && (
              <div className="flex items-center space-x-2 text-gray-600">
                <ArrowsRightLeftIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{mySkill.name}</span>
              </div>
            )}
          </div>
          <Badge className={`${statusConfig.color} border flex items-center space-x-1`}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar src={otherUser?.profile_picture} alt={otherUser?.name} size="md" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{otherUser?.name}</div>
              <div className="text-xs text-gray-500">{isIncoming ? 'Requester' : 'Provider'}</div>
            </div>
          </div>
          
          <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">You</div>
            </div>
            <Avatar src={user?.profile_picture} alt={user?.name} size="md" />
          </div>
        </div>

        {/* Session Details */}
        {nextSession && (
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-amber-500" />
              <span>{new Date(nextSession.scheduled_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-amber-500" />
              <span>{nextSession.scheduled_time}</span>
            </div>
          </div>
        )}

        {/* Message */}
        {activity.message && (
          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700 italic">"{activity.message}"</p>
          </div>
        )}

        {/* Review (for completed) */}
        {activity.status === 'completed' && activity.review && (
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid 
                  key={i} 
                  className={`h-4 w-4 ${i < activity.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <p className="text-sm text-gray-700">"{activity.review}"</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="border-2 border-blue-500 text-blue-700 font-bold hover:bg-blue-50 shadow-md transition-all duration-200"
            title="Open chat with your barter partner"
            onClick={() => navigate(`/chat/${otherUser.id}`)}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            Chat
          </Button>

          {activity.status === 'pending' && activity.isIncoming && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                onClick={() => {
                  setSelectedActivity({
                    ...activity,
                    requestId: activity.id // Add requestId field
                  });
                  setSelectSkillModalOpen(true);
                }}
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Accept Request
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => console.log('Decline request')}
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}

          {activity.status === 'pending' && !activity.isIncoming && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              Waiting for Response
            </Button>
          )}

          {activity.status === 'accepted' && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                onClick={() => {
                  setSelectedActivity({
                    ...activity,
                    requestId: activity.id // Add requestId field for the modal
                  });
                  setSessionDate(nextSession?.scheduled_date || '');
                  setSessionTime(nextSession?.scheduled_time || '');
                  setUpdateSessionModalOpen(true);
                }}
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Schedule Session
              </Button>
            </>
          )}

          {activity.status === 'scheduled' && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
                onClick={() => {
                  setSelectedActivity({
                    ...activity,
                    requestId: activity.id // Add requestId field for the modal
                  });
                  setVideoCallModalOpen(true);
                }}
              >
                <VideoCameraIcon className="h-4 w-4 mr-1" />
                Start Meeting
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedActivity({
                    ...activity,
                    requestId: activity.id // Add requestId field for the modal
                  });
                  setSessionDate(nextSession?.scheduled_date || '');
                  setSessionTime(nextSession?.scheduled_time || '');
                  setUpdateSessionModalOpen(true);
                }}
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Update
              </Button>
            </>
          )}

          {activity.status === 'ongoing' && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                onClick={() => {
                  setSelectedActivity({
                    ...activity,
                    requestId: activity.id // Add requestId field for consistency
                  });
                  setReviewModalOpen(true);
                }}
              >
                <StarIcon className="h-4 w-4 mr-1" />
                End & Review
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setSelectedActivity({
                    ...activity,
                    requestId: activity.id // Add requestId field for consistency
                  });
                  setReportModalOpen(true);
                }}
              >
                <FlagIcon className="h-4 w-4 mr-1" />
                Report
              </Button>
            </>
          )}

          {activity.status === 'completed' && !activity.review && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              onClick={() => {
                setSelectedActivity({
                  ...activity,
                  requestId: activity.id // Add requestId field for consistency
                });
                setReviewModalOpen(true);
              }}
            >
              <StarIcon className="h-4 w-4 mr-1" />
              Leave Review
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // Select Barter Skill Modal
  const SelectSkillModal = () => (
    <Modal
      isOpen={selectSkillModalOpen}
      onClose={() => setSelectSkillModalOpen(false)}
      title="Select Your Skill to Exchange"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Choose which skill you'll offer in exchange for {selectedActivity?.requestedSkill.name}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {currentUser.skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => handleSelectSkill(skill)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedBarterSkill?.id === skill.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">
                  {skill.category === 'Music' ? '🎵' : 
                   skill.category === 'Technology' ? '💻' : 
                   skill.category === 'Cooking' ? '🍳' : '📚'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{skill.name}</div>
                  <div className="text-xs text-gray-500">{skill.category}</div>
                </div>
                {selectedBarterSkill?.id === skill.id && (
                  <CheckCircleIcon className="h-6 w-6 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setSelectSkillModalOpen(false);
              setSelectedBarterSkill(null);
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            onClick={handleAcceptWithSkill}
            disabled={!selectedBarterSkill}
          >
            Accept & Exchange
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Update Session Modal
  const UpdateSessionModal = () => (
    <Modal
      isOpen={updateSessionModalOpen}
      onClose={() => setUpdateSessionModalOpen(false)}
      title="Update Session Schedule"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Time
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Both participants will be notified of the schedule change.
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setUpdateSessionModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            onClick={handleUpdateSession}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Review Modal
  const ReviewModal = () => (
    <Modal
      isOpen={reviewModalOpen}
      onClose={() => setReviewModalOpen(false)}
      title="Leave a Review"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            How was your session with {selectedActivity?.isIncoming ? selectedActivity?.requester.name : selectedActivity?.provider.name}?
          </p>
          
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <StarIconSolid 
                  className={`h-10 w-10 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this barter session..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setReviewModalOpen(false);
              setRating(0);
              setReviewText('');
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            onClick={handleSubmitReview}
            disabled={rating === 0}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Report Modal
  const ReportModal = () => (
    <Modal
      isOpen={reportModalOpen}
      onClose={() => setReportModalOpen(false)}
      title="Report an Issue"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Important:</strong> Reports are reviewed by our team. Please provide detailed information.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the Issue
          </label>
          <textarea
            rows={5}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Please describe what happened in detail..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            required
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setReportModalOpen(false);
              setReportText('');
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white"
            onClick={handleSubmitReport}
            disabled={!reportText.trim()}
          >
            Submit Report
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Video Call Modal (Placeholder)
  const VideoCallModal = () => (
    <Modal
      isOpen={videoCallModalOpen}
      onClose={() => setVideoCallModalOpen(false)}
      title="Video Call"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <VideoCameraIcon className="h-20 w-20 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Video Call Integration</p>
            <p className="text-sm text-gray-400">This will integrate with your preferred video calling platform</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setVideoCallModalOpen(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            onClick={() => {
              // In production, this would start the actual video call
              console.log('Starting video call...');
            }}
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Join Meeting
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Your Barter Activity 📅
          </h1>
          <p className="text-gray-600">
            Track your barter requests, ongoing sessions, and feedback here.
          </p>
        </div>

        {/* Help Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-blue-700">Tip: Use the <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded">Chat</span> button on any activity to message your barter partner and coordinate sessions!</span>
          </div>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-6 mb-6 shadow-lg border border-amber-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-3">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* New Barter Button */}
              <Button
                className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 whitespace-nowrap"
                onClick={() => navigate('/skill-search')}
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                New Barter
              </Button>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No matching activities found' 
                : 'No barter activity yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start exchanging skills with others in the community'}
            </p>
            <Button
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600"
              onClick={() => {
                if (searchTerm || statusFilter !== 'all') {
                  setSearchTerm('');
                  setStatusFilter('all');
                } else {
                  navigate('/skill-search');
                }
              }}
            >
              {searchTerm || statusFilter !== 'all' ? 'Clear Filters' : 'Find Skills to Learn'}
            </Button>
          </Card>
        )}

        {/* Modals */}
        <SelectSkillModal />
        <UpdateSessionModal />
        <ReviewModal />
        <ReportModal />
        <VideoCallModal />
      </div>
    </div>
  );
};

export default SkillBarterActivityPage;
