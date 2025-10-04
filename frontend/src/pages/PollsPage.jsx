import React, { useState } from 'react';
import {
  PlusIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Avatar, Modal, Input, FloatingActionButton } from '../components/UI';
import { mockPolls, currentUser } from '../data/mockData';

const PollsPage = () => {
  const [filter, setFilter] = useState('all'); // all, unanswered, answered
  const [createPollModal, setCreatePollModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [votedPolls, setVotedPolls] = useState(new Set());

  const filteredPolls = mockPolls.filter(poll => {
    switch (filter) {
      case 'unanswered':
        return !poll.userVoted && !votedPolls.has(poll.id);
      case 'answered':
        return poll.userVoted || votedPolls.has(poll.id);
      default:
        return true;
    }
  });

  const handleVote = (pollId, optionIndex) => {
    setVotedPolls(prev => new Set([...prev, pollId]));
    // TODO: Replace with actual API call to backend
    // Example: await pollsAPI.vote(pollId, optionIndex);
    console.log(`Vote (needs backend implementation): option ${optionIndex} in poll ${pollId}`);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const PollCard = ({ poll }) => {
    const hasVoted = poll.userVoted || votedPolls.has(poll.id);
    const canVote = !hasVoted;

    return (
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar src={poll.user.profilePicture} alt={poll.user.name} size="sm" />
            <div>
              <div className="text-sm font-medium text-gray-900">{poll.user.name}</div>
              <div className="text-xs text-gray-500">@{poll.user.username}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>{getTimeAgo(poll.createdAt)}</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">{poll.question}</h3>

        <div className="space-y-3 mb-4">
          {poll.type === 'text' ? (
            // Text-based poll
            poll.options.map((option, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => canVote && handleVote(poll.id, index)}
                  disabled={!canVote}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    canVote 
                      ? 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer' 
                      : 'border-gray-200 bg-gray-50'
                  } ${hasVoted && poll.userVote === index ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{option}</span>
                    {hasVoted && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                          {poll.votes[index]} votes
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                            style={{ width: `${(poll.votes[index] / poll.totalVotes) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))
          ) : (
            // Image-based poll
            <div className="grid grid-cols-2 gap-4">
              {poll.options.map((option, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => canVote && handleVote(poll.id, index)}
                    disabled={!canVote}
                    className={`w-full text-left border rounded-lg overflow-hidden transition-colors ${
                      canVote 
                        ? 'border-gray-300 hover:border-blue-500 cursor-pointer' 
                        : 'border-gray-200'
                    } ${hasVoted && poll.userVote === index ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
                  >
                    <img 
                      src={option.image} 
                      alt={option.text}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <div className="text-sm font-medium text-gray-900 mb-2">{option.text}</div>
                      {hasVoted && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{poll.votes[index]} votes</span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                              style={{ width: `${(poll.votes[index] / poll.totalVotes) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>{poll.totalVotes} votes</span>
            </div>
            <Badge variant={hasVoted ? 'success' : 'default'}>
              {hasVoted ? 'Answered' : 'Answer for +1 point'}
            </Badge>
          </div>
          {hasVoted && (
            <Button size="sm" variant="outline">
              View Results
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const CreatePollModal = () => {
    const [pollType, setPollType] = useState('text');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [imageOptions, setImageOptions] = useState([{text: '', image: ''}, {text: '', image: ''}]);

    const addOption = () => {
      if (pollType === 'text') {
        setOptions([...options, '']);
      } else {
        setImageOptions([...imageOptions, {text: '', image: ''}]);
      }
    };

    const removeOption = (index) => {
      if (pollType === 'text') {
        setOptions(options.filter((_, i) => i !== index));
      } else {
        setImageOptions(imageOptions.filter((_, i) => i !== index));
      }
    };

    const updateOption = (index, value) => {
      if (pollType === 'text') {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
      }
    };

    const updateImageOption = (index, field, value) => {
      const newOptions = [...imageOptions];
      newOptions[index][field] = value;
      setImageOptions(newOptions);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // TODO: Replace with actual API call to backend
      // Example: await pollsAPI.createPoll({ pollType, question, options: pollType === 'text' ? options : imageOptions });
      console.log('Poll creation (needs backend implementation):', { pollType, question, options: pollType === 'text' ? options : imageOptions });
      setCreatePollModal(false);
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setImageOptions([{text: '', image: ''}, {text: '', image: ''}]);
    };

    return (
      <Modal
        isOpen={createPollModal}
        onClose={() => setCreatePollModal(false)}
        title="Create New Poll"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poll Type
            </label>
            <select
              value={pollType}
              onChange={(e) => setPollType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">Text Options</option>
              <option value="image">Image Options</option>
            </select>
          </div>

          <Input
            label="Question"
            placeholder="What would you like to ask?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addOption}
                disabled={(pollType === 'text' ? options.length : imageOptions.length) >= 5}
              >
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {pollType === 'text' ? (
                options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => removeOption(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                imageOptions.map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateImageOption(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1} name`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="url"
                        value={option.image}
                        onChange={(e) => updateImageOption(index, 'image', e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    {imageOptions.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        className="mt-2"
                        onClick={() => removeOption(index)}
                      >
                        Remove Option
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> Creating a poll costs 3 points. You currently have {currentUser.points} points.
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setCreatePollModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1"
              disabled={currentUser.points < 3}
            >
              Create Poll
            </Button>
          </div>
        </form>
      </Modal>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Opinion Polls</h1>
        <p className="text-gray-600">
          Help others make decisions and earn points to create your own polls.
        </p>
      </div>

      {/* Stats */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{currentUser.points}</div>
            <div className="text-sm text-gray-600">Your Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mockPolls.filter(p => p.userVoted || votedPolls.has(p.id)).length}
            </div>
            <div className="text-sm text-gray-600">Polls Answered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentUser.opinions.length}</div>
            <div className="text-sm text-gray-600">Polls Created</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Polls
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unanswered' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unanswered
          </button>
          <button
            onClick={() => setFilter('answered')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'answered' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Answered
          </button>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setCreatePollModal(true)}
          disabled={currentUser.points < 3}
          className="hidden md:flex"
        >
          Create Poll
        </Button>
      </div>

      {/* Polls List */}
      <div className="space-y-6">
        {filteredPolls.length > 0 ? (
          filteredPolls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unanswered' ? 'No Unanswered Polls' : 
               filter === 'answered' ? 'No Answered Polls' : 'No Polls Available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'unanswered' 
                ? 'You\'ve answered all available polls! Check back later for new ones.'
                : filter === 'answered'
                ? 'Start answering polls to see your responses here.'
                : 'Be the first to create a poll and get opinions from the community.'
              }
            </p>
            {filter !== 'answered' && (
              <Button onClick={() => setFilter('all')}>
                View All Polls
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Mobile Create Poll Button */}
      <FloatingActionButton
        onClick={() => setCreatePollModal(true)}
        icon={<PlusIcon className="h-6 w-6" />}
        className="md:hidden"
      />

      {/* Create Poll Modal */}
      <CreatePollModal />
    </div>
  );
};

export default PollsPage;