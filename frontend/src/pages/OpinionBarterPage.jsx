import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { PlusIcon, ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/react/24/outline';
import CreatePollModal from '../components/modals/CreatePollModal';

const OpinionBarterPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('answer');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polls, setPolls] = useState([]);
  const [userPolls, setUserPolls] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadPolls();
    loadUserPolls();
    loadActivities();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPolls();
      setPolls(response.polls || []);
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPolls = async () => {
    try {
      const response = await apiService.getUserPolls();
      setUserPolls(response.polls || []);
    } catch (error) {
      console.error('Failed to load user polls:', error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await apiService.getActivity();
      setActivities(response.activities?.filter(act => act.type === 'poll') || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    try {
      await apiService.voteOnPoll(pollId, optionIndex);
      loadPolls();
      loadActivities();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      await apiService.createPoll(pollData);
      loadUserPolls();
      loadActivities();
    } catch (error) {
      console.error('Failed to create poll:', error);
      throw error;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opinion Barter</h1>
            <p className="text-gray-600 mt-2">Answer polls to earn points, create your own polls</p>
          </div>
          <div className="text-center md:text-right">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{user?.points || 0}</div>
              <div className="text-sm">Opinion Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('answer')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'answer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Answer Polls
          </button>
          <button
            onClick={() => setActiveTab('my-polls')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-polls'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Polls ({userPolls.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Activity
          </button>
        </nav>
      </div>

      {activeTab === 'answer' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Community Polls</h2>
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading polls...</div>
            ) : polls.length > 0 ? (
              polls.map((poll) => (
                <Card key={poll.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                    <h3 className="text-lg font-semibold">{poll.question}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        {poll.total_votes || 0} votes
                      </Badge>
                      {!poll.user_voted && (
                        <Badge variant="success">+1 Point</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {poll.options && poll.options.map((option, index) => {
                      const votes = poll.votes?.[index] || 0;
                      const percentage = poll.total_votes > 0 ? (votes / poll.total_votes) * 100 : 0;
                      return (
                        <div key={index}>
                          {poll.user_voted ? (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{option}</span>
                                <span className="text-sm text-gray-500">{votes} votes</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleVote(poll.id, index)}
                              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            >
                              {option}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      Created {new Date(poll.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    {poll.user_voted && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4" />
                        +1 Point Earned
                      </Badge>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No polls available</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-polls' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Your Polls</h2>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={(user?.points || 0) < 3}
            >
              <PlusIcon className="w-4 h-4" />
              Create Poll (3 points)
            </Button>
          </div>

          {(user?.points || 0) < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                You need at least 3 points to create a poll. Answer more polls to earn points!
              </p>
            </div>
          )}
          
          {userPolls.length > 0 ? (
            <div className="space-y-6">
              {userPolls.map((poll) => (
                <Card key={poll.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                    <h3 className="text-lg font-semibold">{poll.question}</h3>
                    <Badge variant="outline" className="flex items-center gap-1 self-start">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      {poll.total_votes || 0} votes
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {poll.options && poll.options.map((option, index) => {
                      const votes = poll.votes?.[index] || 0;
                      const percentage = poll.total_votes > 0 ? (votes / poll.total_votes) * 100 : 0;
                      return (
                        <div key={index} className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{option}</span>
                            <span className="text-sm text-gray-500">{votes} votes</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 pt-4 border-t gap-4">
                    <span className="text-sm text-gray-500">
                      Created {new Date(poll.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button size="sm" variant="outline" className="w-full md:w-auto">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="w-full md:w-auto">
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Polls Created Yet</h3>
              <p className="text-gray-600 mb-4">Create polls to get help making decisions. You need at least 3 points to create your first poll.</p>
              {(user?.points || 0) >= 3 ? (
                <Button onClick={() => setShowCreateModal(true)}>Create Your First Poll</Button>
              ) : (
                <Button variant="outline" onClick={() => setActiveTab('answer')}>Answer Polls to Earn Points</Button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Opinion Activity</h2>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {activity.type === 'poll' ? 'Poll Activity' : 'Opinion Activity'}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {activity.message || 'Poll activity'}
                      </p>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <Badge className="bg-green-100 text-green-800">+1 Point</Badge>
                      <Button size="sm" variant="outline" className="w-full md:w-auto">View Poll</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">Your opinion activities will appear here once you start participating in polls.</p>
            </div>
          )}
        </div>
      )}

      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePoll}
      />
    </div>
  );
};

export default OpinionBarterPage;