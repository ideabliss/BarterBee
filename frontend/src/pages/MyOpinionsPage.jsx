import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/UI';
import { currentUser, mockPolls } from '../data/mockData';
import { PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const MyOpinionsPage = () => {
  const [activeTab, setActiveTab] = useState('polls');

  const myPolls = mockPolls.filter(poll => poll.userId === currentUser.id);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Opinions</h1>
            <p className="text-gray-600 mt-2">Create polls and track your opinion exchanges</p>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{currentUser.points}</div>
              <div className="text-sm">Opinion Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('polls')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'polls'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Polls ({myPolls.length})
          </button>
        </nav>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Your Polls</h2>
          <Button 
            className="flex items-center gap-2 w-full sm:w-auto"
            disabled={currentUser.points < 3}
          >
            <PlusIcon className="w-4 h-4" />
            Create Poll (3 points)
          </Button>
        </div>

        {currentUser.points < 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              You need at least 3 points to create a poll. Answer more polls to earn points!
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          {myPolls.map((poll) => (
            <Card key={poll.id} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                <h3 className="text-lg font-semibold">{poll.question}</h3>
                <Badge variant="outline" className="flex items-center gap-1 self-start">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  {poll.totalVotes} votes
                </Badge>
              </div>

              <div className="space-y-3">
                {poll.options.map((option, index) => {
                  const percentage = poll.totalVotes > 0 ? (poll.votes[index] / poll.totalVotes) * 100 : 0;
                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{option}</span>
                        <span className="text-sm text-gray-500">{poll.votes[index]} votes</span>
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
                  Created {new Date(poll.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
};

export default MyOpinionsPage;