import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Avatar, Modal } from '../components/UI';
import { currentUser, mockUsers } from '../data/mockData';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  
  // Multi-session management
  const [sessions, setSessions] = useState([
    {
      id: 1,
      date: '2024-01-20',
      time: '14:00',
      status: 'completed',
      topic: 'Introduction to Guitar Basics',
      duration: '1 hour',
      notes: 'Covered basic chords and strumming patterns'
    },
    {
      id: 2,
      date: '2024-01-27',
      time: '14:00',
      status: 'completed',
      topic: 'Advanced Chord Progressions',
      duration: '1 hour',
      notes: 'Practiced barre chords and chord transitions'
    },
    {
      id: 3,
      date: '2024-02-03',
      time: '14:00',
      status: 'scheduled',
      topic: 'Learning Songs',
      duration: '1 hour',
      notes: ''
    }
  ]);

  // Schedule modal state
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    topic: '',
    duration: '1 hour',
    notes: ''
  });

  // Find the other user (in real app, fetch from API)
  const otherUser = mockUsers.find(u => u.id === parseInt(userId)) || mockUsers[1];

  // Mock barter exchange info
  const barterInfo = {
    mySkill: { name: 'Web Development', emoji: '💻' },
    theirSkill: { name: 'Guitar Lessons', emoji: '🎸' }
  };

  // Mock messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: otherUser.id,
      text: "Hey! Looking forward to our first guitar session!",
      timestamp: '2024-01-15T10:30:00',
      type: 'text'
    },
    {
      id: 2,
      senderId: currentUser.id,
      text: "Me too! I've been wanting to learn guitar for a while.",
      timestamp: '2024-01-15T10:35:00',
      type: 'text'
    },
    {
      id: 3,
      senderId: otherUser.id,
      text: "Great! I've scheduled our first session for Jan 20th at 2 PM. We'll cover the basics.",
      timestamp: '2024-01-15T10:40:00',
      type: 'text'
    },
    {
      id: 4,
      senderId: 'system',
      text: "Session 1 scheduled: Jan 20, 2024 at 2:00 PM - Introduction to Guitar Basics",
      timestamp: '2024-01-15T10:40:00',
      type: 'session-scheduled',
      sessionId: 1
    },
    {
      id: 5,
      senderId: currentUser.id,
      text: "Perfect! Should I bring anything specific?",
      timestamp: '2024-01-15T11:00:00',
      type: 'text'
    },
    {
      id: 6,
      senderId: otherUser.id,
      text: "Just make sure your guitar is tuned and you have a pick. I'll share some practice materials during the session.",
      timestamp: '2024-01-15T11:15:00',
      type: 'text'
    },
    {
      id: 7,
      senderId: 'system',
      text: "Session 1 completed! Duration: 1 hour",
      timestamp: '2024-01-20T15:00:00',
      type: 'session-completed',
      sessionId: 1
    },
    {
      id: 8,
      senderId: currentUser.id,
      text: "That was an amazing first session! The chord progressions are starting to make sense.",
      timestamp: '2024-01-20T15:10:00',
      type: 'text'
    },
    {
      id: 9,
      senderId: otherUser.id,
      text: "You're doing great! Keep practicing those chords. Ready for session 2 next week?",
      timestamp: '2024-01-20T15:20:00',
      type: 'text'
    },
    {
      id: 10,
      senderId: 'system',
      text: "Session 2 scheduled: Jan 27, 2024 at 2:00 PM - Advanced Chord Progressions",
      timestamp: '2024-01-21T09:00:00',
      type: 'session-scheduled',
      sessionId: 2
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      senderId: currentUser.id,
      text: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleScheduleSession = () => {
    if (!newSession.date || !newSession.time || !newSession.topic) {
      alert('Please fill in all required fields');
      return;
    }

    // Add new session
    const sessionToAdd = {
      id: sessions.length + 1,
      date: newSession.date,
      time: newSession.time,
      status: 'scheduled',
      topic: newSession.topic,
      duration: newSession.duration,
      notes: newSession.notes
    };

    setSessions([...sessions, sessionToAdd]);

    // Add system message
    const systemMessage = {
      id: messages.length + 1,
      senderId: 'system',
      text: `Session ${sessions.length + 1} scheduled: ${new Date(newSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${newSession.time} - ${newSession.topic}`,
      timestamp: new Date().toISOString(),
      type: 'session-scheduled',
      sessionId: sessionToAdd.id
    };

    setMessages([...messages, systemMessage]);

    // Reset form
    setNewSession({
      date: '',
      time: '',
      topic: '',
      duration: '1 hour',
      notes: ''
    });

    setShowScheduleModal(false);
  };

  const handleStartSession = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };

  const getSessionStatus = (session) => {
    const sessionDate = new Date(`${session.date}T${session.time}`);
    const now = new Date();

    if (session.status === 'completed') {
      return { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' };
    } else if (sessionDate < now) {
      return { label: 'Missed', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (sessionDate.toDateString() === now.toDateString()) {
      return { label: 'Today', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else {
      return { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
  };

  const MessageBubble = ({ msg }) => {
    const isCurrentUser = msg.senderId === currentUser.id;
    const isSystem = msg.senderId === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              {msg.type === 'session-scheduled' && <CalendarIcon className="h-4 w-4" />}
              {msg.type === 'session-completed' && <CheckCircleIcon className="h-4 w-4" />}
              <span className="text-sm font-medium">{msg.text}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {new Date(msg.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isCurrentUser && (
          <Avatar src={otherUser.profilePicture} alt={otherUser.name} size="sm" className="mr-2 mt-1" />
        )}
        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isCurrentUser
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
          <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
            {new Date(msg.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
        {isCurrentUser && (
          <Avatar src={currentUser.profilePicture} alt={currentUser.name} size="sm" className="ml-2 mt-1" />
        )}
      </div>
    );
  };

  const ScheduleSessionModal = () => (
    <Modal
      isOpen={showScheduleModal}
      onClose={() => setShowScheduleModal(false)}
      title="Schedule New Session"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold text-gray-700">Your Skill:</span>
              <span className="ml-2">{barterInfo.mySkill.emoji} {barterInfo.mySkill.name}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Learning:</span>
              <span className="ml-2">{barterInfo.theirSkill.emoji} {barterInfo.theirSkill.name}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newSession.topic}
            onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
            placeholder="e.g., Learning Your First Song"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={newSession.time}
              onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={newSession.duration}
            onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="30 minutes">30 minutes</option>
            <option value="1 hour">1 hour</option>
            <option value="1.5 hours">1.5 hours</option>
            <option value="2 hours">2 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={newSession.notes}
            onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
            placeholder="Any preparation notes or topics to cover..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowScheduleModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            onClick={handleScheduleSession}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <Avatar src={otherUser.profilePicture} alt={otherUser.name} size="md" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">{otherUser.name}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{barterInfo.mySkill.emoji} {barterInfo.mySkill.name}</span>
                  <span>↔</span>
                  <span>{barterInfo.theirSkill.emoji} {barterInfo.theirSkill.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSessionMenu(!showSessionMenu)}
                className="relative"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Sessions ({sessions.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Sidebar/Dropdown */}
      {showSessionMenu && (
        <div className="absolute top-20 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Session History</h3>
              <button
                onClick={() => setShowSessionMenu(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {sessions.map((session) => {
              const status = getSessionStatus(session);
              return (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        Session {session.id}: {session.topic}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {session.time} • {session.duration}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${status.color} border shrink-0`}>
                      {status.label}
                    </Badge>
                  </div>
                  
                  {session.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">{session.notes}</p>
                  )}
                  
                  {session.status === 'scheduled' && status.label === 'Today' && (
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      onClick={() => handleStartSession(session.id)}
                    >
                      <VideoCameraIcon className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  )}
                </div>
              );
            })}
            
            <Button
              variant="outline"
              className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                setShowSessionMenu(false);
                setShowScheduleModal(true);
              }}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Schedule New Session
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 pb-safe">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowScheduleModal(true)}
            >
              <PlusIcon className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Session</span>
            </Button>
            
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-3 rounded-xl transition-all ${
                  message.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      <ScheduleSessionModal />
    </div>
  );
};

export default ChatPage;
