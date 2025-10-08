import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../components/UI';
import { CalendarIcon, ClockIcon, PlayCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const SessionHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const sessions = {
    upcoming: [
      {
        id: 1,
        skill: 'Guitar Playing',
        partner: {
          name: 'Rudra Patel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
        },
        date: '2024-03-20',
        time: '18:00',
        duration: 60,
        type: 'learning'
      }
    ],
    completed: [
      {
        id: 2,
        skill: 'Cooking',
        partner: {
          name: 'Rudra Patel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
        },
        date: '2024-03-18',
        time: '17:00',
        duration: 75,
        type: 'teaching',
        rating: 5
      }
    ]
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTypeColor = (type) => {
    return type === 'teaching' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Session History</h1>
        <p className="text-gray-600 mt-2">Track your learning and teaching sessions</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming ({sessions.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed ({sessions.completed.length})
          </button>
        </nav>
      </div>

      <div className="space-y-4">
        {sessions[activeTab].map((session) => (
          <Card key={session.id} className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <img 
                  src={session.partner.avatar} 
                  alt={session.partner.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{session.skill}</h3>
                    <Badge className={getTypeColor(session.type)}>
                      {session.type === 'teaching' ? 'Teaching' : 'Learning'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Session with {session.partner.name}
                  </p>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(session.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {session.time} ({session.duration} min)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {activeTab === 'upcoming' ? (
                  <Link to={`/session/${session.id}`} className="w-full md:w-auto">
                    <Button size="sm" className="flex items-center gap-1 w-full md:w-auto">
                      <PlayCircleIcon className="w-4 h-4" />
                      Join Session
                    </Button>
                  </Link>
                ) : (
                  <Badge className="bg-green-100 text-green-800 self-start">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SessionHistoryPage;