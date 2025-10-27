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
import { Button } from '../components/UI';
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
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('initializing');
  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // WebRTC refs
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const socketRef = useRef(null);
  
  // WebRTC Configuration with multiple STUN servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

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
      console.log('🚀 Initializing video call for session:', sessionId);
      setIsInitializing(true);
      setPermissionError(null);
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access.');
      }

      // Get local media stream first
      await getLocalStream();
      
      // Initialize Socket.IO connection
      await initializeSocket();
      
      setIsInitializing(false);
      setConnectionStatus('waiting');
      
    } catch (error) {
      console.error('❌ Failed to initialize:', error);
      setPermissionError(error.message);
      setIsInitializing(false);
    }
  };

  const getLocalStream = async () => {
    try {
      console.log('🎥 Requesting media access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Got local stream');
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }
      
      setIsVideoOn(true);
      setIsAudioOn(true);
      
    } catch (error) {
      console.error('❌ Media access failed:', error);
      let errorMessage = 'Could not access camera/microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else {
        errorMessage += error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const initializeSocket = () => {
    return new Promise((resolve, reject) => {
      const socketUrl = import.meta.env.PROD 
        ? 'https://barterbee.onrender.com'
        : 'http://localhost:5000';
      
      console.log('🔌 Connecting to socket:', socketUrl);
      
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
      
      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected:', socketRef.current.id);
        
        socketRef.current.emit('join-video-room', {
          sessionId,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous User'
        });
        
        resolve();
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket error:', error);
        reject(error);
      });
      
      // Handle existing users
      socketRef.current.on('existing-users', (users) => {
        console.log('👥 Existing users:', users);
        users.forEach(remoteUser => {
          createPeerConnection(remoteUser, true);
        });
      });
      
      // Handle new user
      socketRef.current.on('user-joined', (remoteUser) => {
        console.log('👤 User joined:', remoteUser);
        createPeerConnection(remoteUser, false);
      });
      
      // WebRTC signaling
      socketRef.current.on('webrtc-offer', handleOffer);
      socketRef.current.on('webrtc-answer', handleAnswer);
      socketRef.current.on('webrtc-ice-candidate', handleIceCandidate);
      socketRef.current.on('user-left', handleUserLeft);
      socketRef.current.on('video-chat-message', handleChatMessage);
    });
  };

  const createPeerConnection = async (remoteUser, isInitiator) => {
    const { socketId, userName } = remoteUser;
    
    console.log(`🤝 Creating peer with ${userName} (initiator: ${isInitiator})`);
    
    if (peerConnectionsRef.current.has(socketId)) {
      console.log('⚠️ Connection exists');
      return;
    }
    
    const pc = new RTCPeerConnection(rtcConfig);
    
    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
        console.log(`➕ Added ${track.kind} track`);
      });
    }
    
    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log(`📥 Received ${event.track.kind} track`);
      
      const [remoteStream] = event.streams;
      const videoId = `remote-${socketId}`;
      let videoElement = document.getElementById(videoId);
      
      if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.id = videoId;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.className = 'w-full h-full object-cover';
        
        const container = document.getElementById('remote-videos-container');
        if (container) {
          const wrapper = document.createElement('div');
          wrapper.id = `wrapper-${socketId}`;
          wrapper.className = 'relative bg-gray-800 rounded-lg overflow-hidden';
          
          const nameLabel = document.createElement('div');
          nameLabel.className = 'absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm';
          nameLabel.textContent = userName;
          
          wrapper.appendChild(videoElement);
          wrapper.appendChild(nameLabel);
          container.appendChild(wrapper);
        }
      }
      
      videoElement.srcObject = remoteStream;
      remoteVideosRef.current.set(socketId, videoElement);
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate');
        socketRef.current.emit('webrtc-ice-candidate', {
          targetSocketId: socketId,
          candidate: event.candidate,
          sessionId
        });
      }
    };
    
    // Connection state
    pc.onconnectionstatechange = () => {
      console.log(`🔗 Connection state: ${pc.connectionState}`);
      
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.connectionState === 'failed') {
        console.log('❌ Connection failed');
      }
    };
    
    peerConnectionsRef.current.set(socketId, pc);
    setRemoteUsers(prev => new Map(prev).set(socketId, remoteUser));
    
    // Create offer if initiator
    if (isInitiator) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await pc.setLocalDescription(offer);
        
        console.log('📤 Sending offer');
        socketRef.current.emit('webrtc-offer', {
          targetSocketId: socketId,
          offer,
          sessionId
        });
        
        setConnectionStatus('connecting');
      } catch (error) {
        console.error('❌ Failed to create offer:', error);
      }
    }
  };

  const handleOffer = async ({ offer, fromSocketId, fromUserName }) => {
    console.log(`📥 Received offer from ${fromUserName}`);
    
    let pc = peerConnectionsRef.current.get(fromSocketId);
    
    if (!pc) {
      // Create connection if doesn't exist
      await createPeerConnection({ socketId: fromSocketId, userName: fromUserName }, false);
      pc = peerConnectionsRef.current.get(fromSocketId);
    }
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('📤 Sending answer');
      socketRef.current.emit('webrtc-answer', {
        targetSocketId: fromSocketId,
        answer,
        sessionId
      });
      
      setConnectionStatus('connecting');
    } catch (error) {
      console.error('❌ Failed to handle offer:', error);
    }
  };

  const handleAnswer = async ({ answer, fromSocketId }) => {
    console.log('📥 Received answer');
    
    const pc = peerConnectionsRef.current.get(fromSocketId);
    
    if (!pc) {
      console.error('❌ No peer connection found');
      return;
    }
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Set remote description');
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
    }
  };

  const handleIceCandidate = async ({ candidate, fromSocketId }) => {
    console.log('🧊 Received ICE candidate');
    
    const pc = peerConnectionsRef.current.get(fromSocketId);
    
    if (!pc) {
      console.error('❌ No peer connection found');
      return;
    }
    
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ Added ICE candidate');
    } catch (error) {
      console.error('❌ Failed to add ICE candidate:', error);
    }
  };

  const handleUserLeft = ({ socketId, userName }) => {
    console.log(`👋 User left: ${userName}`);
    
    const pc = peerConnectionsRef.current.get(socketId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(socketId);
    }
    
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      newMap.delete(socketId);
      return newMap;
    });
    
    const wrapper = document.getElementById(`wrapper-${socketId}`);
    if (wrapper) wrapper.remove();
    
    remoteVideosRef.current.delete(socketId);
    
    if (remoteUsers.size === 0) {
      setConnectionStatus('waiting');
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
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleEndSession = async () => {
    if (window.confirm('End this session?')) {
      try {
        await apiService.completeSession(sessionId);
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
      
      cleanup();
      navigate('/session/review', { 
        state: { 
          sessionId,
          sessionDuration: formatTime(sessionTime)
        }
      });
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up...');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    
    if (socketRef.current) {
      socketRef.current.emit('leave-video-room', sessionId);
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
        userId: user?.id,
        userName: user?.name,
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

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400';
      case 'waiting': return 'bg-gray-400';
      default: return 'bg-blue-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected';
      case 'connecting': return '🔄 Connecting...';
      case 'waiting': return '⏳ Waiting...';
      default: return '🚀 Initializing...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`relative w-3 h-3 rounded-full ${getStatusColor()}`}>
              <div className={`absolute inset-0 rounded-full ${getStatusColor()} animate-ping opacity-75`}></div>
            </div>
            <div>
              <div className="font-semibold text-lg">
                {remoteUsers.size > 0 
                  ? `${Array.from(remoteUsers.values()).map(u => u.userName).join(', ')}`
                  : 'Waiting for participants...'}
              </div>
              <div className="text-sm text-gray-300 flex items-center gap-2">
                {getStatusText()}
                {remoteUsers.size > 0 && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    {remoteUsers.size} connected
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700/50 px-4 py-2 rounded-lg">
              <div className="text-green-400 font-mono text-xl font-bold">
                {formatTime(sessionTime)}
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndSession}
              className="hover:scale-105 transition-transform"
            >
              <PhoneXMarkIcon className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {permissionError && (
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-4 flex items-start justify-between shadow-lg animate-slideDown">
          <div className="flex-1 flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="font-semibold text-lg mb-1">Camera/Microphone Access Required</div>
              <div className="text-sm text-yellow-50">{permissionError}</div>
              <button
                onClick={getLocalStream}
                className="mt-3 bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                Grant Access
              </button>
            </div>
          </div>
          <button 
            onClick={() => setPermissionError(null)} 
            className="ml-4 hover:bg-white/20 p-1 rounded transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Initializing Overlay */}
      {isInitializing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-10 text-center text-white shadow-2xl border border-gray-700 max-w-md">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
              <VideoCameraIcon className="absolute inset-0 m-auto h-10 w-10 text-blue-400" />
            </div>
            <div className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Setting Up Your Call
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Please allow camera and microphone access</p>
              <p className="text-xs text-gray-400">This enables video and audio communication</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Remote Videos Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4" id="remote-videos-container">
            {remoteUsers.size === 0 && (
              <div className="col-span-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 animate-fadeIn">
                <div className="text-center text-white p-12">
                  <div className="relative mb-6">
                    <div className="text-7xl animate-bounce">👥</div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-500 rounded-full opacity-50"></div>
                  </div>
                  <div className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Waiting for participants to join
                  </div>
                  <div className="text-sm text-gray-400 mb-4">Share this session link with others</div>
                  <div className="inline-flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
                    <span className="text-xs text-gray-500">Session:</span>
                    <span className="font-mono text-blue-400">{sessionId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute bottom-28 right-6 w-72 h-52 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300 hover:scale-105 group">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center text-white">
                  <VideoCameraSlashIcon className="h-14 w-14 text-gray-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">Camera Off</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              You {!isAudioOn && '🔇'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-8">
          <div className="max-w-2xl mx-auto flex items-center justify-center space-x-4">
            <button
              onClick={toggleAudio}
              className={`group relative p-5 rounded-2xl transition-all transform hover:scale-110 shadow-lg ${
                isAudioOn 
                  ? 'bg-gray-700/90 hover:bg-gray-600 backdrop-blur-sm' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white border border-gray-600`}
              title={isAudioOn ? 'Mute' : 'Unmute'}
            >
              <MicrophoneIcon className={`h-7 w-7 ${!isAudioOn ? 'opacity-50' : ''}`} />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isAudioOn ? 'Mute' : 'Unmute'}
              </span>
            </button>

            <button
              onClick={toggleVideo}
              className={`group relative p-5 rounded-2xl transition-all transform hover:scale-110 shadow-lg ${
                isVideoOn 
                  ? 'bg-gray-700/90 hover:bg-gray-600 backdrop-blur-sm' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white border border-gray-600`}
              title={isVideoOn ? 'Camera Off' : 'Camera On'}
            >
              {isVideoOn ? <VideoCameraIcon className="h-7 w-7" /> : <VideoCameraSlashIcon className="h-7 w-7" />}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isVideoOn ? 'Turn Off' : 'Turn On'}
              </span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`group relative p-5 rounded-2xl transition-all transform hover:scale-110 shadow-lg ${
                showChat 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-700/90 hover:bg-gray-600 backdrop-blur-sm'
              } text-white border border-gray-600`}
              title="Chat"
            >
              <ChatBubbleLeftRightIcon className="h-7 w-7" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse border-2 border-black">
                  {chatMessages.length}
                </span>
              )}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat
              </span>
            </button>

            <button
              onClick={handleEndSession}
              className="group relative p-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all transform hover:scale-110 shadow-lg border border-red-700"
              title="End Call"
            >
              <PhoneXMarkIcon className="h-7 w-7" />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                End Call
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 border-b border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-lg">Session Chat</h3>
                <p className="text-blue-100 text-xs mt-1">
                  {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                onClick={() => setShowChat(false)} 
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-sm font-medium text-gray-700">No messages yet</div>
                <div className="text-xs text-gray-500 mt-1">Start a conversation!</div>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-xs rounded-2xl p-3 shadow-md ${
                    msg.sender === 'You' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}>
                    <div className={`text-xs font-semibold mb-1 ${
                      msg.sender === 'You' ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {msg.sender}
                    </div>
                    <div className="text-sm leading-relaxed">{msg.message}</div>
                    <div className={`text-xs mt-1 ${
                      msg.sender === 'You' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionPage;
