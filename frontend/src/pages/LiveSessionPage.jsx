import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  XMarkIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button, Card, Avatar } from '../components/UI';
import { mockSessions, mockUsers } from '../data/mockData';

const LiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  
  // Mock session data
  const session = mockSessions.find(s => s.id === parseInt(sessionId)) || mockSessions[0];
  const otherParticipant = session.participants.find(p => p.id !== 1); // Assuming current user is ID 1
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleEndSession = () => {
    const confirmed = window.confirm('Are you sure you want to end this session?');
    if (confirmed) {
      navigate('/session/review', { state: { session } });
    }
  };
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'You',
        message: chatMessage.trim(),
        timestamp: new Date()
      }]);
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar src={otherParticipant.profilePicture} alt={otherParticipant.name} />
            <div>
              <div className="font-semibold">{otherParticipant.name}</div>
              <div className="text-sm text-gray-300">
                {session.skill || 'Skill Exchange Session'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-green-400 font-mono">
              {formatTime(sessionTime)}
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndSession}
              icon={<PhoneXMarkIcon className="h-4 w-4" />}
            >
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Remote Video */}
          <div className="relative bg-gray-800 flex items-center justify-center">
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Avatar src={otherParticipant.profilePicture} alt={otherParticipant.name} size="xl" />
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-white">
                <VideoCameraSlashIcon className="h-16 w-16 text-gray-400" />
                <div className="text-center">
                  <div className="font-semibold">{otherParticipant.name}</div>
                  <div className="text-sm text-gray-400">Camera is off</div>
                </div>
              </div>
            )}
            
            {/* Remote Audio Indicator */}
            {!isAudioOn && (
              <div className="absolute top-4 left-4 bg-red-500 rounded-full p-2">
                <MicrophoneIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="relative bg-gray-900 flex items-center justify-center lg:border-l border-gray-700">
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <div className="text-sm">Your Camera</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 text-white">
                <VideoCameraSlashIcon className="h-16 w-16 text-gray-400" />
                <div className="text-center">
                  <div className="font-semibold">You</div>
                  <div className="text-sm text-gray-400">Camera is off</div>
                </div>
              </div>
            )}
            
            {/* Local Audio Indicator */}
            {!isAudioOn && (
              <div className="absolute top-4 right-4 bg-red-500 rounded-full p-2">
                <XMarkIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`p-4 rounded-full transition-colors ${
                isAudioOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoOn ? (
                <VideoCameraIcon className="h-6 w-6" />
              ) : (
                <VideoCameraSlashIcon className="h-6 w-6" />
              )}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </button>

            <button className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            <button
              onClick={handleEndSession}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneXMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 flex flex-col">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Session Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">No messages yet</div>
                <div className="text-xs">Send a message to start chatting</div>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">{msg.sender}</div>
                  <div className="text-sm text-gray-700 mt-1">{msg.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" size="sm">Send</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionPage;