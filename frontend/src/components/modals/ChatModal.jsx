import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../UI';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import io from 'socket.io-client';

const ChatModal = ({ isOpen, onClose, activity }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && activity?.requestId) {
      loadMessages();
      connectSocket();
    }
    return () => {
      if (window.socket) {
        window.socket.disconnect();
      }
    };
  }, [isOpen, activity?.requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await apiService.getMessages(activity.requestId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const connectSocket = () => {
    window.socket = io('http://localhost:5000');
    
    window.socket.emit('join-chat', activity.requestId);
    
    window.socket.on('receive-message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || !activity?.requestId) return;

    setLoading(true);
    try {
      console.log('Sending message with activity:', activity);
      
      const messageData = {
        barter_request_id: activity.requestId,
        message_text: newMessage.trim(),
        sender_id: user.id,
        created_at: new Date().toISOString()
      };
      
      // Send to database
      await apiService.sendMessage({
        barter_request_id: activity.requestId,
        message: newMessage.trim(),
        receiver_id: activity.partnerId
      });
      
      // Send via socket for real-time
      if (window.socket) {
        window.socket.emit('send-message', {
          ...messageData,
          barterRequestId: activity.requestId
        });
      }
      
      // Add to local messages immediately
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 h-[80vh] max-h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chat with {activity?.partnerName || 'User'}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
          <div className="space-y-3">
            {messages.length > 0 ? messages.map((message) => {
              const isMyMessage = message.sender_id === user?.id;
              return (
                <div key={message.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg ${
                    isMyMessage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border'
                  }`}>
                    <p className="text-sm">{message.message_text}</p>
                    <span className={`text-xs ${
                      isMyMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;