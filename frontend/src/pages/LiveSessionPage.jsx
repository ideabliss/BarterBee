import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
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
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const LiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [remoteUser, setRemoteUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  
  // WebRTC refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  
  useEffect(() => {
    initializeVideoCall();
    
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      console.log('Initializing video call...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      // Initialize Socket.IO first (don't wait for camera)
      const socketUrl = import.meta.env.PROD 
        ? 'https://barterbee.onrender.com'
        : 'http://localhost:5000';
      socketRef.current = io(socketUrl);
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        // Join video room after socket connects
        socketRef.current.emit('join-video-room', {
          sessionId,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous User'
        });
      });
      
      // Socket event listeners
      socketRef.current.on('user-joined', handleUserJoined);
      socketRef.current.on('offer', handleOffer);
      socketRef.current.on('answer', handleAnswer);
      socketRef.current.on('ice-candidate', handleIceCandidate);
      socketRef.current.on('user-left', handleUserLeft);
      socketRef.current.on('video-chat-message', handleChatMessage);
      
      // Request camera access automatically
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        console.log('Got local stream:', stream);
        console.log('Video tracks:', stream.getVideoTracks());
        console.log('Audio tracks:', stream.getAudioTracks());
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.onloadedmetadata = () => {
            localVideoRef.current.play().catch(e => console.error('Local video play failed:', e));
          };
        }
        
        console.log('Camera access granted');
        
      } catch (error) {
        console.log('Camera access failed:', error);
        setIsVideoOn(false);
        setIsAudioOn(false);
      }
      
    } catch (error) {
      console.error('Failed to initialize video call:', error);
      alert('Failed to initialize video call: ' + error.message);
    }
  };

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const peerConnection = new RTCPeerConnection(configuration);
    
    console.log('Creating peer connection with local stream:', localStreamRef.current);
    
    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('Adding track:', track.kind, track.enabled);
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      console.log('Remote streams:', event.streams);
      
      if (remoteVideoRef.current && event.streams[0]) {
        console.log('Setting remote video source');
        remoteVideoRef.current.srcObject = event.streams[0];
        
        // Ensure video plays
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(e => console.error('Remote video play failed:', e));
        };
      }
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socketRef.current.emit('ice-candidate', {
          sessionId,
          candidate: event.candidate
        });
      }
    };
    
    // Connection state logging
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };
    
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };
    
    return peerConnection;
  };

  const handleUserJoined = async (data) => {
    console.log('User joined:', data);
    setRemoteUser(data);
    setIsConnected(true);
    
    // Only create offer if we don't already have a peer connection
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = createPeerConnection();
      
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        console.log('Sending offer to:', data.userName);
        socketRef.current.emit('offer', {
          sessionId,
          offer,
          targetUserId: data.userId
        });
      } catch (error) {
        console.error('Failed to create offer:', error);
      }
    }
  };

  const handleOffer = async (data) => {
    console.log('Received offer from:', data);
    
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = createPeerConnection();
    }
    
    try {
      await peerConnectionRef.current.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      console.log('Sending answer');
      socketRef.current.emit('answer', {
        sessionId,
        answer,
        targetUserId: data.fromUserId
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  };

  const handleUserLeft = () => {
    setRemoteUser(null);
    setIsConnected(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const handleChatMessage = (data) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: data.userName,
      message: data.message,
      timestamp: new Date()
    }]);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        console.log('Video toggled:', videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        console.log('Audio toggled:', audioTrack.enabled);
      }
    }
  };

  const handleEndSession = async () => {
    const confirmed = window.confirm('Are you sure you want to end this session?');
    if (confirmed) {
      try {
        // Mark session as completed
        await apiService.completeSession(sessionId);
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
      
      cleanup();
      // Navigate to review page with session data
      navigate('/session/review', { 
        state: { 
          sessionId,
          partnerName: remoteUser?.userName || 'Partner',
          sessionDuration: formatTime(sessionTime)
        }
      });
    }
  };

  const handleSettings = () => {
    // Toggle between different video qualities or show settings menu
    const qualities = ['720p', '480p', '360p'];
    const currentQuality = '720p'; // This could be state
    alert(`Current video quality: ${currentQuality}\nClick OK to cycle through qualities`);
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim() && socketRef.current) {
      const messageData = {
        sessionId,
        userId: user.id,
        userName: user.name,
        message: chatMessage.trim()
      };
      
      socketRef.current.emit('video-chat-message', messageData);
      
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
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <div>
              <div className="font-semibold">{remoteUser?.userName || 'Waiting for participant...'}</div>
              <div className="text-sm text-gray-300">
                {isConnected ? 'Video Connected' : 'In Session Room'}
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
          <div className="relative bg-gray-800">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">👤</div>
                  <div className="font-semibold">Waiting for participant...</div>
                </div>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="relative bg-gray-900 lg:border-l border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!isVideoOn ? 'hidden' : ''}`}
            />
            {(!isVideoOn || !localStreamRef.current) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <VideoCameraSlashIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <div className="font-semibold">
                    {!localStreamRef.current ? 'Camera Off' : 'Camera Off'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Audio Indicator */}
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
            {/* Microphone Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                isAudioOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isAudioOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              <MicrophoneIcon className={`h-6 w-6 ${!isAudioOn ? 'line-through' : ''}`} />
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? (
                <VideoCameraIcon className="h-6 w-6" />
              ) : (
                <VideoCameraSlashIcon className="h-6 w-6" />
              )}
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-4 rounded-full transition-colors ${
                showChat 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={showChat ? 'Hide Chat' : 'Show Chat'}
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </button>

            {/* Settings */}
            <button 
              onClick={handleSettings}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
              title="Settings"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            {/* End Call */}
            <button
              onClick={handleEndSession}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              title="End Session"
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
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                title="Close Chat"
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