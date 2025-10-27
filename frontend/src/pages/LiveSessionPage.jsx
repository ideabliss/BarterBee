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
  Cog6ToothIcon,
  ClockIcon
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
          wrapper.className = 'relative bg-gray-900 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 group aspect-video';
          
          const nameLabel = document.createElement('div');
          nameLabel.className = 'absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/80 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold border border-white/20 z-10 flex items-center gap-1.5 sm:gap-2';
          nameLabel.innerHTML = `<span class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></span>${userName}`;
          
          const overlay = document.createElement('div');
          overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10';
          
          wrapper.appendChild(videoElement);
          wrapper.appendChild(nameLabel);
          wrapper.appendChild(overlay);
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
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-b from-gray-900/95 to-transparent backdrop-blur-xl border-b border-white/5 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            {/* Status Indicator */}
            <div className="relative flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} relative z-10`}></div>
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} animate-ping`}></div>
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} blur-md opacity-70`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg sm:text-xl text-white truncate">
                {remoteUsers.size > 0 
                  ? Array.from(remoteUsers.values()).map(u => u.userName).join(', ')
                  : 'Waiting for participants...'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm text-gray-400">{getStatusText()}</span>
                {remoteUsers.size > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    {remoteUsers.size} online
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-md px-4 sm:px-5 py-2.5 rounded-xl border border-white/10">
              <ClockIcon className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-base sm:text-lg font-bold tabular-nums">
                {formatTime(sessionTime)}
              </span>
            </div>
            
            {/* End Button */}
            <button
              onClick={handleEndSession}
              className="group relative bg-red-600/90 hover:bg-red-600 backdrop-blur-md text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border border-red-500/50 hover:border-red-400 shadow-lg hover:shadow-red-500/50"
            >
              <PhoneXMarkIcon className="h-5 w-5 inline group-hover:rotate-12 transition-transform" />
              <span className="ml-2 hidden sm:inline">End</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {permissionError && (
        <div className="relative z-10 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 sm:px-6 py-4 flex items-start justify-between shadow-xl animate-slideDown border-b border-white/10">
          <div className="flex-1 flex items-start gap-3">
            <div className="flex-shrink-0 bg-white/20 rounded-full p-2 backdrop-blur-sm">
              <div className="text-2xl">⚠️</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base sm:text-lg mb-1">Camera/Microphone Access Required</div>
              <div className="text-sm text-orange-50 mb-3 leading-relaxed">{permissionError}</div>
              <button
                onClick={getLocalStream}
                className="bg-white text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
              >
                <VideoCameraIcon className="h-4 w-4" />
                Grant Access
              </button>
            </div>
          </div>
          <button 
            onClick={() => setPermissionError(null)} 
            className="flex-shrink-0 ml-3 hover:bg-white/20 p-2 rounded-full transition-all duration-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Initializing Overlay */}
      {isInitializing && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-10 sm:p-12 text-center text-white shadow-2xl border border-white/10 max-w-md mx-4">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              <VideoCameraIcon className="absolute inset-0 m-auto h-12 w-12 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Setting Up Your Call
            </h3>
            <p className="text-base text-gray-300 mb-2">Please allow camera and microphone access</p>
            <p className="text-sm text-gray-500">Required for video and audio communication</p>
          </div>
        </div>
      )}

      {/* Video Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        <div className="h-full flex flex-col relative z-10">
          {/* Remote Videos Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-6" id="remote-videos-container">
            {remoteUsers.size === 0 && (
              <div className="col-span-full flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/5 animate-fadeIn">
                <div className="text-center text-white p-8 sm:p-16">
                  <div className="relative mb-6 sm:mb-8 inline-block">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-gray-800 rounded-full p-6 sm:p-8 border border-white/10">
                      <div className="text-5xl sm:text-7xl animate-bounce">👥</div>
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Waiting for participants
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">Share this session with others</p>
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-gray-800/70 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10">
                    <span className="text-xs sm:text-sm text-gray-500 font-semibold">Session:</span>
                    <span className="font-mono text-sm sm:text-lg text-blue-400 font-bold">{sessionId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute bottom-24 sm:bottom-28 right-3 sm:right-6 w-32 sm:w-48 md:w-64 lg:w-80 aspect-video bg-gray-900 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 group">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <div className="bg-gray-800 rounded-full p-3 sm:p-4 mb-2 mx-auto w-fit">
                    <VideoCameraSlashIcon className="h-8 sm:h-12 w-8 sm:w-12 text-gray-500" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-400">Camera Off</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/80 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border border-white/20">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>You</span>
              {!isAudioOn && <span className="text-base sm:text-lg">🔇</span>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
            {/* Microphone */}
            <button
              onClick={toggleAudio}
              className={`group relative p-3 sm:p-4 md:p-5 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                isAudioOn 
                  ? 'bg-gray-800/90 hover:bg-gray-700/90 border border-white/20' 
                  : 'bg-red-600/90 hover:bg-red-600 border border-red-500/50'
              } backdrop-blur-md`}
            >
              <MicrophoneIcon className={`h-5 w-5 sm:h-6 sm:w-6 text-white ${!isAudioOn ? 'animate-pulse' : ''}`} />
              <span className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium border border-white/20">
                {isAudioOn ? 'Mute' : 'Unmute'}
              </span>
            </button>

            {/* Camera */}
            <button
              onClick={toggleVideo}
              className={`group relative p-3 sm:p-4 md:p-5 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                isVideoOn 
                  ? 'bg-gray-800/90 hover:bg-gray-700/90 border border-white/20' 
                  : 'bg-red-600/90 hover:bg-red-600 border border-red-500/50'
              } backdrop-blur-md`}
            >
              {isVideoOn ? <VideoCameraIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" /> : <VideoCameraSlashIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-pulse" />}
              <span className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium border border-white/20">
                {isVideoOn ? 'Turn Off' : 'Turn On'}
              </span>
            </button>

            {/* Chat */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`group relative p-3 sm:p-4 md:p-5 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
                showChat 
                  ? 'bg-blue-600/90 hover:bg-blue-600 border border-blue-500/50' 
                  : 'bg-gray-800/90 hover:bg-gray-700/90 border border-white/20'
              } backdrop-blur-md`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-black animate-pulse">
                  {chatMessages.length}
                </span>
              )}
              <span className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium border border-white/20">
                Chat
              </span>
            </button>

            {/* End Call */}
            <button
              onClick={handleEndSession}
              className="group relative p-3 sm:p-4 md:p-5 bg-red-600/90 hover:bg-red-600 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg border border-red-500/50 backdrop-blur-md"
            >
              <PhoneXMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium border border-white/20">
                End Call
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-5 flex items-center justify-between border-b border-blue-700/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg truncate">Chat</h3>
                <p className="text-blue-100 text-xs">{chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowChat(false)} 
              className="flex-shrink-0 text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-12 animate-fadeIn">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">No messages yet</div>
                <div className="text-xs text-gray-500">Start a conversation!</div>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                    msg.sender === 'You' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                  }`}>
                    <div className={`text-xs font-bold mb-1 ${msg.sender === 'You' ? 'text-blue-100' : 'text-gray-600'}`}>
                      {msg.sender}
                    </div>
                    <div className="text-sm leading-relaxed break-words">{msg.message}</div>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${msg.sender === 'You' ? 'text-blue-200' : 'text-gray-500'}`}>
                      <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
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
