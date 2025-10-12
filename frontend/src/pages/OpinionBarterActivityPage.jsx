import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon,
  ChartBarIcon,
  StarIcon,
  PlusIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Card, Input, Button, Badge, Avatar, Modal } from '../components/UI';
import { currentUser, mockUsers } from '../data/mockData';

const OpinionBarterActivityPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  
  // Form states
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [reportText, setReportText] = useState('');

  // Mock activities data
  const mockActivities = [
    {
      id: 1,
      status: 'pending',
      poll: {
        question: 'Which programming language should I learn first?',
        emoji: '💻',
        category: 'Technology',
        options: ['Python', 'JavaScript', 'Java', 'C++'],
        pointsOffered: 50
      },
      creator: currentUser,
      responseCount: 0,
      targetResponses: 20,
      dateCreated: '2024-01-16',
      expiresAt: '2024-01-23',
      message: 'Starting my coding journey, need advice!',
      isMyPoll: true
    },
    {
      id: 2,
      status: 'active',
      poll: {
        question: 'Best budget smartphone under $500?',
        emoji: '📱',
        category: 'Technology',
        options: ['Samsung Galaxy', 'Google Pixel', 'OnePlus', 'Motorola'],
        pointsOffered: 30
      },
      creator: mockUsers[1],
      responseCount: 12,
      targetResponses: 20,
      dateCreated: '2024-01-14',
      expiresAt: '2024-01-21',
      message: 'Need recommendations for my next phone',
      myResponse: 'Google Pixel',
      myResponseDate: '2024-01-15',
      isMyPoll: false,
      pointsEarned: 30
    },
    {
      id: 3,
      status: 'active',
      poll: {
        question: 'Best city for digital nomads in 2024?',
        emoji: '✈️',
        category: 'Travel',
        options: ['Bali, Indonesia', 'Lisbon, Portugal', 'Chiang Mai, Thailand', 'Medellín, Colombia'],
        pointsOffered: 40
      },
      creator: currentUser,
      responseCount: 18,
      targetResponses: 25,
      dateCreated: '2024-01-10',
      expiresAt: '2024-01-20',
      message: 'Planning my next remote work destination',
      isMyPoll: true
    },
    {
      id: 4,
      status: 'completed',
      poll: {
        question: 'Should I switch to electric vehicle?',
        emoji: '🚗',
        category: 'Lifestyle',
        options: ['Yes, go electric', 'No, stick to gas', 'Wait for better tech', 'Get a hybrid'],
        pointsOffered: 35
      },
      creator: mockUsers[2],
      responseCount: 25,
      targetResponses: 25,
      dateCreated: '2024-01-05',
      expiresAt: '2024-01-12',
      completedDate: '2024-01-12',
      message: 'Considering environmental impact',
      myResponse: 'Yes, go electric',
      myResponseDate: '2024-01-08',
      results: {
        'Yes, go electric': 45,
        'No, stick to gas': 20,
        'Wait for better tech': 25,
        'Get a hybrid': 10
      },
      topChoice: 'Yes, go electric',
      isMyPoll: false,
      pointsEarned: 35,
      rated: true,
      rating: 5
    },
    {
      id: 5,
      status: 'completed',
      poll: {
        question: 'Best project management tool for small teams?',
        emoji: '📊',
        category: 'Business',
        options: ['Trello', 'Asana', 'Monday.com', 'ClickUp'],
        pointsOffered: 45
      },
      creator: currentUser,
      responseCount: 30,
      targetResponses: 30,
      dateCreated: '2024-01-01',
      expiresAt: '2024-01-08',
      completedDate: '2024-01-08',
      message: 'Team productivity research',
      results: {
        'Trello': 30,
        'Asana': 25,
        'Monday.com': 20,
        'ClickUp': 25
      },
      topChoice: 'Trello',
      isMyPoll: true,
      averageRating: 4.8
    }
  ];

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = 
      activity.poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.poll.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      active: {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        borderColor: 'border-blue-400',
        icon: ChartBarIcon
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
    const progressPercentage = (activity.responseCount / activity.targetResponses) * 100;

    return (
      <Card className={`p-6 hover:shadow-2xl transition-all duration-300 border-l-4 ${statusConfig.borderColor} group`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-3xl">{activity.poll.emoji}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{activity.poll.question}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{activity.poll.category}</Badge>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-amber-600 font-semibold">{activity.poll.pointsOffered} points</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className={`${statusConfig.color} border flex items-center space-x-1 shrink-0`}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Creator Info */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
          <Avatar src={activity.creator.profilePicture} alt={activity.creator.name} size="sm" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">
              {activity.isMyPoll ? 'Your Poll' : activity.creator.name}
            </div>
            <div className="text-xs text-gray-500">
              Created {new Date(activity.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          {activity.pointsEarned && (
            <div className="bg-amber-100 rounded-lg px-3 py-1">
              <span className="text-sm font-bold text-amber-700">+{activity.pointsEarned} pts</span>
            </div>
          )}
        </div>

        {/* Progress Bar (for active polls) */}
        {activity.status === 'active' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Response Progress</span>
              <span className="font-semibold text-gray-900">
                {activity.responseCount}/{activity.targetResponses}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* My Response */}
        {activity.myResponse && (
          <div className="bg-purple-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-purple-600 font-semibold mb-1">Your Response</div>
            <div className="text-sm font-medium text-gray-900">✓ {activity.myResponse}</div>
            <div className="text-xs text-gray-500 mt-1">
              Responded on {new Date(activity.myResponseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}

        {/* Poll Options Preview */}
        {!activity.myResponse && activity.status === 'active' && !activity.isMyPoll && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-600 font-semibold mb-2">Options:</div>
            <div className="space-y-1">
              {activity.poll.options.slice(0, 2).map((option, idx) => (
                <div key={idx} className="text-sm text-gray-700">• {option}</div>
              ))}
              {activity.poll.options.length > 2 && (
                <div className="text-xs text-gray-500 italic">+{activity.poll.options.length - 2} more</div>
              )}
            </div>
          </div>
        )}

        {/* Results (for completed polls) */}
        {activity.status === 'completed' && activity.results && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-900">Poll Results</div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
                onClick={() => {
                  setSelectedActivity(activity);
                  setResultsModalOpen(true);
                }}
              >
                <ChartBarIcon className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
            <div className="text-lg font-bold text-purple-700">
              🏆 {activity.topChoice}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {activity.responseCount} total responses
            </div>
            {activity.averageRating && (
              <div className="flex items-center space-x-1 mt-2">
                <StarIconSolid className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">{activity.averageRating}</span>
                <span className="text-xs text-gray-500">avg rating</span>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {activity.message && (
          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700 italic">"{activity.message}"</p>
          </div>
        )}

        {/* Expiry Info */}
        {activity.status !== 'completed' && activity.expiresAt && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Expires on {new Date(activity.expiresAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Chat button - Always available for active/completed polls where user participated */}
          {(activity.myResponse || activity.isMyPoll) && activity.status !== 'pending' && (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => navigate(`/chat/${activity.creator.id}`)}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              {activity.isMyPoll ? 'View Responses' : 'Chat'}
            </Button>
          )}

          {activity.status === 'active' && !activity.myResponse && !activity.isMyPoll && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
              onClick={() => navigate(`/polls/${activity.id}`)}
            >
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1" />
              Respond to Poll
            </Button>
          )}

          {activity.status === 'active' && activity.isMyPoll && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                onClick={() => {
                  setSelectedActivity(activity);
                  setResultsModalOpen(true);
                }}
              >
                <ChartBarIcon className="h-4 w-4 mr-1" />
                View Results ({activity.responseCount})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/polls/${activity.id}/edit`)}
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </>
          )}

          {activity.status === 'completed' && !activity.isMyPoll && !activity.rated && activity.myResponse && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              onClick={() => {
                setSelectedActivity(activity);
                setReviewModalOpen(true);
              }}
            >
              <StarIcon className="h-4 w-4 mr-1" />
              Rate Poll Quality
            </Button>
          )}

          {activity.status === 'completed' && activity.isMyPoll && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
              onClick={() => {
                setSelectedActivity(activity);
                setResultsModalOpen(true);
              }}
            >
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Final Results
            </Button>
          )}

          {/* Report button for inappropriate polls */}
          {!activity.isMyPoll && activity.status === 'active' && (
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
              Report
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // Results Modal
  const ResultsModal = () => (
    <Modal
      isOpen={resultsModalOpen}
      onClose={() => setResultsModalOpen(false)}
      title="Poll Results"
      maxWidth="max-w-lg"
    >
      {selectedActivity && (
        <div className="space-y-4">
          <div className="text-center pb-4 border-b">
            <div className="text-2xl mb-2">{selectedActivity.poll.emoji}</div>
            <h3 className="text-lg font-bold text-gray-900">{selectedActivity.poll.question}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedActivity.responseCount} total responses
            </p>
          </div>

          {selectedActivity.results && (
            <div className="space-y-3">
              {Object.entries(selectedActivity.results)
                .sort(([, a], [, b]) => b - a)
                .map(([option, percentage], idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {idx === 0 && '🏆 '}
                        {option}
                      </span>
                      <span className="font-bold text-gray-700">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          idx === 0 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => setResultsModalOpen(false)}
          >
            Close
          </Button>
        </div>
      )}
    </Modal>
  );

  // Review Modal
  const ReviewModal = () => (
    <Modal
      isOpen={reviewModalOpen}
      onClose={() => setReviewModalOpen(false)}
      title="Rate Poll Quality"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            How helpful was this poll?
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
            Feedback (Optional)
          </label>
          <textarea
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this poll..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
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
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white"
            onClick={handleSubmitReview}
            disabled={rating === 0}
          >
            Submit Rating
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
      title="Report Poll"
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
            Reason for Report
          </label>
          <textarea
            rows={5}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Please describe why this poll should be reviewed..."
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Your Opinion Exchanges 💭
          </h1>
          <p className="text-gray-600">
            Track your polls and community opinion requests here.
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 sm:p-6 mb-6 shadow-lg border border-purple-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by question or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-3">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Create Poll Button */}
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 whitespace-nowrap"
                onClick={() => navigate('/polls/create')}
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create Poll
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
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No matching polls found' 
                : 'No opinion exchanges yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start creating polls or responding to community questions'}
            </p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              onClick={() => {
                if (searchTerm || statusFilter !== 'all') {
                  setSearchTerm('');
                  setStatusFilter('all');
                } else {
                  navigate('/polls');
                }
              }}
            >
              {searchTerm || statusFilter !== 'all' ? 'Clear Filters' : 'Browse Polls'}
            </Button>
          </Card>
        )}

        {/* Modals */}
        <ResultsModal />
        <ReviewModal />
        <ReportModal />
      </div>
    </div>
  );
};

export default OpinionBarterActivityPage;
