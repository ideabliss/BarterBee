import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  ArrowsRightLeftIcon,
  StarIcon,
  PlusIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, Input, Button, Badge, Avatar, Modal } from '../components/UI';
import { currentUser, mockUsers } from '../data/mockData';

const ThingBarterActivityPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Modal states
  const [updateExchangeModalOpen, setUpdateExchangeModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [acceptRequestModalOpen, setAcceptRequestModalOpen] = useState(false);
  
  // Form states
  const [exchangeDate, setExchangeDate] = useState('');
  const [exchangeTime, setExchangeTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [reportText, setReportText] = useState('');
  const [selectedMyItem, setSelectedMyItem] = useState('');

  // Mock activities data
  const mockActivities = [
    {
      id: 1,
      status: 'pending',
      requestedThing: { 
        name: 'White Nights Book',
        emoji: '📚',
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
        condition: 'Good'
      },
      offeredThing: null,
      requester: mockUsers[1],
      provider: currentUser,
      dateRequested: '2024-01-15',
      exchangeDate: '2024-01-25',
      exchangeTime: '15:00',
      location: 'City Library',
      duration: 'Borrow for 2 weeks',
      message: 'Hi! I would love to borrow this book. I can lend you my Harry Potter collection!',
      isIncoming: true
    },
    {
      id: 2,
      status: 'accepted',
      requestedThing: {
        name: 'Camping Tent',
        emoji: '⛺',
        category: 'Outdoor',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop',
        condition: 'Excellent'
      },
      offeredThing: {
        name: 'Bicycle',
        emoji: '🚲',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop',
        condition: 'Good'
      },
      requester: currentUser,
      provider: mockUsers[2],
      dateRequested: '2024-01-14',
      exchangeDate: '2024-01-28',
      exchangeTime: '10:00',
      location: 'Central Park Entrance',
      duration: 'Exchange for weekend',
      message: 'Need it for weekend camping trip!',
      isIncoming: false
    },
    {
      id: 3,
      status: 'scheduled',
      requestedThing: {
        name: 'DSLR Camera',
        emoji: '📷',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop',
        condition: 'Excellent'
      },
      offeredThing: {
        name: 'Gaming Console',
        emoji: '🎮',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop',
        condition: 'Good'
      },
      requester: mockUsers[3],
      provider: currentUser,
      dateRequested: '2024-01-10',
      exchangeDate: '2024-01-20',
      exchangeTime: '14:00',
      location: 'Mall Food Court',
      duration: 'Borrow for 1 week',
      message: 'Need camera for event photography',
      isIncoming: true
    },
    {
      id: 4,
      status: 'ongoing',
      requestedThing: {
        name: 'Power Drill',
        emoji: '🔧',
        category: 'Tools',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop',
        condition: 'Good'
      },
      offeredThing: {
        name: 'Ladder',
        emoji: '🪜',
        category: 'Tools',
        image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=400&fit=crop',
        condition: 'Good'
      },
      requester: currentUser,
      provider: mockUsers[0],
      dateRequested: '2024-01-12',
      exchangeDate: '2024-01-18',
      exchangeTime: '09:00',
      exchangedDate: '2024-01-18',
      location: 'Home Depot Parking',
      duration: 'Exchange for 3 days',
      message: 'Home renovation project',
      isIncoming: false
    },
    {
      id: 5,
      status: 'completed',
      requestedThing: {
        name: 'Guitar',
        emoji: '🎸',
        category: 'Musical Instruments',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
        condition: 'Excellent'
      },
      offeredThing: {
        name: 'Keyboard',
        emoji: '🎹',
        category: 'Musical Instruments',
        image: 'https://images.unsplash.com/photo-1563330232-57114bb0823c?w=400&h=400&fit=crop',
        condition: 'Good'
      },
      requester: mockUsers[4],
      provider: currentUser,
      dateRequested: '2024-01-05',
      exchangeDate: '2024-01-12',
      exchangeTime: '16:00',
      completedDate: '2024-01-15',
      location: 'Music Store',
      duration: 'Exchange for 3 days',
      rating: 5,
      review: 'Great condition! Very smooth exchange process.',
      message: 'Want to try learning guitar',
      isIncoming: true
    }
  ];

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = 
      activity.requestedThing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.offeredThing?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        borderColor: 'border-purple-400',
        icon: TruckIcon
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

  const handleUpdateExchange = () => {
    console.log('Updating exchange:', { exchangeDate, exchangeTime, meetingLocation });
    setUpdateExchangeModalOpen(false);
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', { rating, reviewText });
    setReviewModalOpen(false);
    setRating(0);
    setReviewText('');
  };

  const handleSubmitReport = () => {
    console.log('Submitting report:', reportText);
    setReportModalOpen(false);
    setReportText('');
    alert('Report submitted successfully. Our team will review it shortly.');
  };

  const ActivityCard = ({ activity }) => {
    const statusConfig = getStatusConfig(activity.status);
    const StatusIcon = statusConfig.icon;
    const otherUser = activity.isIncoming ? activity.requester : activity.provider;

    return (
      <Card className={`p-6 hover:shadow-2xl transition-all duration-300 border-l-4 ${statusConfig.borderColor} group`}>
        {/* Header with Images */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={activity.requestedThing.image} 
                alt={activity.requestedThing.name}
                className="w-16 h-16 rounded-lg object-cover shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{activity.requestedThing.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Badge variant="secondary" className="text-xs">{activity.requestedThing.category}</Badge>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{activity.requestedThing.condition} condition</span>
                </div>
              </div>
            </div>
            {activity.offeredThing && (
              <div className="flex items-center space-x-3 text-gray-600 pl-2">
                <ArrowsRightLeftIcon className="h-4 w-4" />
                <img 
                  src={activity.offeredThing.image} 
                  alt={activity.offeredThing.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                />
                <div>
                  <span className="text-sm font-medium">{activity.offeredThing.name}</span>
                  <span className="text-xs text-gray-500 block">{activity.offeredThing.condition} condition</span>
                </div>
              </div>
            )}
          </div>
          <Badge className={`${statusConfig.color} border flex items-center space-x-1 shrink-0`}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar src={activity.requester.profilePicture} alt={activity.requester.name} size="md" />
            <div>
              <div className="text-sm font-semibold text-gray-900">{activity.requester.name}</div>
              <div className="text-xs text-gray-500">Requester</div>
            </div>
          </div>
          
          <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{activity.provider.name}</div>
              <div className="text-xs text-gray-500">Provider</div>
            </div>
            <Avatar src={activity.provider.profilePicture} alt={activity.provider.name} size="md" />
          </div>
        </div>

        {/* Exchange Details */}
        {activity.exchangeDate && (
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <CalendarIcon className="h-4 w-4 text-green-600" />
                <span>{new Date(activity.exchangeDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <ClockIcon className="h-4 w-4 text-green-600" />
                <span>{activity.exchangeTime}</span>
              </div>
              {activity.location && (
                <div className="flex items-center space-x-2 text-gray-700 col-span-2">
                  <TruckIcon className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{activity.location}</span>
                </div>
              )}
              {activity.duration && (
                <div className="flex items-center space-x-2 text-gray-700 col-span-2">
                  <CubeIcon className="h-4 w-4 text-green-600" />
                  <span className="italic">{activity.duration}</span>
                </div>
              )}
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
        <div className="flex flex-wrap gap-2">
          {/* Chat button - Always available for accepted/scheduled/ongoing/completed */}
          {(activity.status === 'accepted' || activity.status === 'scheduled' || activity.status === 'ongoing' || activity.status === 'completed') && (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => navigate(`/chat/${otherUser.id}`)}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              Chat
            </Button>
          )}

          {activity.status === 'pending' && activity.isIncoming && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                onClick={() => {
                  setSelectedActivity(activity);
                  setAcceptRequestModalOpen(true);
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
                  setSelectedActivity(activity);
                  setExchangeDate(activity.exchangeDate);
                  setExchangeTime(activity.exchangeTime);
                  setMeetingLocation(activity.location);
                  setUpdateExchangeModalOpen(true);
                }}
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Schedule Exchange
              </Button>
            </>
          )}

          {activity.status === 'scheduled' && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                onClick={() => console.log('Confirm exchange')}
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Confirm Exchange
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedActivity(activity);
                  setExchangeDate(activity.exchangeDate);
                  setExchangeTime(activity.exchangeTime);
                  setMeetingLocation(activity.location);
                  setUpdateExchangeModalOpen(true);
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
                  setSelectedActivity(activity);
                  setReviewModalOpen(true);
                }}
              >
                <StarIcon className="h-4 w-4 mr-1" />
                Complete & Review
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setSelectedActivity(activity);
                  setReportModalOpen(true);
                }}
              >
                <FlagIcon className="h-4 w-4 mr-1" />
                Report Issue
              </Button>
            </>
          )}

          {activity.status === 'completed' && !activity.review && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              onClick={() => {
                setSelectedActivity(activity);
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

  // Update Exchange Modal
  const UpdateExchangeModal = () => (
    <Modal
      isOpen={updateExchangeModalOpen}
      onClose={() => setUpdateExchangeModalOpen(false)}
      title="Update Exchange Details"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exchange Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={exchangeDate}
              onChange={(e) => setExchangeDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exchange Time
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="time"
              value={exchangeTime}
              onChange={(e) => setExchangeTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Location
          </label>
          <div className="relative">
            <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              placeholder="e.g., City Library Main Entrance"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Both participants will be notified of the schedule change.
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setUpdateExchangeModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            onClick={handleUpdateExchange}
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
            How was your exchange with {selectedActivity?.isIncoming ? selectedActivity?.requester.name : selectedActivity?.provider.name}?
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
            placeholder="Share your experience with this exchange..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
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
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            onClick={handleSubmitReview}
            disabled={rating === 0}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Accept Request Modal
  const AcceptRequestModal = () => {
    const handleAcceptRequest = () => {
      console.log('Accepting request with item:', selectedMyItem);
      setAcceptRequestModalOpen(false);
      setSelectedMyItem('');
    };

    return (
      <Modal
        isOpen={acceptRequestModalOpen}
        onClose={() => setAcceptRequestModalOpen(false)}
        title="Accept Barter Request"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={selectedActivity?.requestedThing?.image}
                alt={selectedActivity?.requestedThing?.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium">{selectedActivity?.requester?.name} wants to borrow:</p>
                <p className="text-sm text-gray-600">{selectedActivity?.requestedThing?.name}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Item to Exchange
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {currentUser.things.filter(thing => thing.available).map(thing => (
                <label key={thing.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="myItem"
                    value={thing.id}
                    checked={selectedMyItem === thing.id}
                    onChange={(e) => setSelectedMyItem(e.target.value)}
                    className="text-blue-600"
                  />
                  <img
                    src={thing.image}
                    alt={thing.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{thing.name}</p>
                    <p className="text-sm text-gray-600">{thing.category} • {thing.condition || 'Good'} condition</p>
                  </div>
                </label>
              ))}
            </div>
            {currentUser.things.filter(thing => thing.available).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                You don't have any available items. <Link to="/profile?tab=things" className="text-blue-600 hover:underline">Add items to your profile</Link>
              </p>
            )}
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> Both items will be exchanged temporarily. Make sure to return items in the same condition.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setAcceptRequestModalOpen(false);
                setSelectedMyItem('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              onClick={handleAcceptRequest}
              disabled={!selectedMyItem || currentUser.things.filter(thing => thing.available).length === 0}
            >
              Accept Request
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Your Thing Exchanges 📦
          </h1>
          <p className="text-gray-600">
            Track your item borrow and exchange requests here.
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-6 mb-6 shadow-lg border border-green-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-3">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Browse Things Button */}
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 whitespace-nowrap"
                onClick={() => navigate('/thing-search')}
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Browse Things
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
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No matching exchanges found' 
                : 'No thing exchanges yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start borrowing or lending items with others in the community'}
            </p>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
              onClick={() => {
                if (searchTerm || statusFilter !== 'all') {
                  setSearchTerm('');
                  setStatusFilter('all');
                } else {
                  navigate('/thing-search');
                }
              }}
            >
              {searchTerm || statusFilter !== 'all' ? 'Clear Filters' : 'Browse Things'}
            </Button>
          </Card>
        )}

        {/* Modals */}
        <UpdateExchangeModal />
        <ReviewModal />
        <ReportModal />
        <AcceptRequestModal />
      </div>
    </div>
  );
};

export default ThingBarterActivityPage;
