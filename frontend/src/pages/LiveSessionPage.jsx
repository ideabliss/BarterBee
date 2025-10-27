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
          wrapper.className = 'relative bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 hover:border-purple-400 transition-all duration-500 hover:scale-105 transform group';
          
          const nameLabel = document.createElement('div');
          nameLabel.className = 'absolute top-4 left-4 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-bold border border-white/20 shadow-xl z-10 flex items-center gap-2';
          nameLabel.innerHTML = `<span class="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>${userName}`;
          
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 backdrop-blur-xl text-white p-6 shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className={`relative w-4 h-4 rounded-full ${getStatusColor()} shadow-lg`}>
              <div className={`absolute inset-0 rounded-full ${getStatusColor()} animate-ping opacity-75`}></div>
              <div className={`absolute inset-0 rounded-full ${getStatusColor()} blur-sm`}></div>
            </div>
            <div className="flex-1 sm:flex-none">
              <div className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {remoteUsers.size > 0 
                  ? `${Array.from(remoteUsers.values()).map(u => u.userName).join(', ')}`
                  : 'Waiting for participants...'}
              </div>
              <div className="text-sm text-gray-300 flex items-center gap-2 mt-1">
                {getStatusText()}
                {remoteUsers.size > 0 && (
                  <span className="text-xs bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 px-3 py-1 rounded-full border border-green-500/30 shadow-lg">
                    <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                    {remoteUsers.size} connected
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-green-400 font-mono text-2xl font-bold tracking-wider">
                {formatTime(sessionTime)}
              </div>
            </div>
            <button
              onClick={handleEndSession}
              className="group bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              <PhoneXMarkIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">End Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {permissionError && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-6 py-5 flex items-start justify-between shadow-2xl animate-slideDown border-b border-white/20">
          <div className="flex-1 flex items-start space-x-4">
            <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
              <div className="text-3xl">⚠️</div>
            </div>
            <div className="flex-1">
              <div className="font-bold text-xl mb-2 flex items-center gap-2">
                Camera/Microphone Access Required
                <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
              </div>
              <div className="text-sm text-orange-50 leading-relaxed mb-3">{permissionError}</div>
              <button
                onClick={getLocalStream}
                className="bg-white text-orange-700 hover:bg-orange-50 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
              >
                <VideoCameraIcon className="h-5 w-5" />
                Grant Access Now
              </button>
            </div>
          </div>
          <button 
            onClick={() => setPermissionError(null)} 
            className="ml-4 hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Initializing Overlay */}
      {isInitializing && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-gray-950/95 backdrop-blur-lg flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-3xl p-12 text-center text-white shadow-2xl border border-white/20 max-w-md transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-border" style={{WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '4px'}}></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-400 animate-spin"></div>
              <VideoCameraIcon className="absolute inset-0 m-auto h-14 w-14 text-blue-300 animate-pulse" />
            </div>
            <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
              Setting Up Your Call
            </div>
            <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
              <p className="text-base font-medium">Please allow camera and microphone access</p>
              <p className="text-xs text-gray-400 px-4">This enables high-quality video and audio communication with other participants</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Area */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-950 via-indigo-950/50 to-purple-950/50 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Remote Videos Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6" id="remote-videos-container">
            {remoteUsers.size === 0 && (
              <div className="col-span-full flex items-center justify-center bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 animate-fadeIn">
                <div className="text-center text-white p-16">
                  <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-8 shadow-2xl">
                      <div className="text-7xl animate-bounce">👥</div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm"></div>
                  </div>
                  <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Waiting for participants to join
                  </div>
                  <div className="text-base text-gray-300 mb-6 font-medium">Share this session link with others</div>
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                    <span className="text-sm text-gray-400 font-semibold">Session ID:</span>
                    <span className="font-mono text-lg text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold">{sessionId}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute bottom-32 right-6 w-80 h-56 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 hover:border-purple-400 transition-all duration-500 hover:scale-110 group transform hover:rotate-1">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!isVideoOn ? 'hidden' : ''}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                <div className="text-center text-white">
                  <div className="bg-white/10 rounded-full p-5 mb-3 mx-auto w-fit backdrop-blur-sm">
                    <VideoCameraSlashIcon className="h-16 w-16 text-gray-300" />
                  </div>
                  <div className="text-base font-semibold">Camera Off</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2.5 border border-white/20 shadow-xl">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></div>
              <span>You</span>
              {!isAudioOn && <span className="text-lg">🔇</span>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-indigo-950/80 to-transparent p-10">
          <div className="max-w-3xl mx-auto flex items-center justify-center space-x-3 sm:space-x-5">
            <button
              onClick={toggleAudio}
              className={`group relative p-6 rounded-full transition-all duration-300 transform hover:scale-125 shadow-2xl hover:shadow-3xl ${
                isAudioOn 
                  ? 'bg-gradient-to-br from-gray-700/90 to-gray-800/90 hover:from-gray-600 hover:to-gray-700 backdrop-blur-md border-2 border-white/20' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-400'
              } text-white active:scale-110`}
              title={isAudioOn ? 'Mute' : 'Unmute'}
            >
              <MicrophoneIcon className={`h-8 w-8 ${!isAudioOn ? 'animate-pulse' : ''}`} />
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-black backdrop-blur-md text-white text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-semibold border border-white/20 shadow-xl">
                {isAudioOn ? 'Mute' : 'Unmute'}
              </span>
            </button>

            <button
              onClick={toggleVideo}
              className={`group relative p-6 rounded-full transition-all duration-300 transform hover:scale-125 shadow-2xl hover:shadow-3xl ${
                isVideoOn 
                  ? 'bg-gradient-to-br from-gray-700/90 to-gray-800/90 hover:from-gray-600 hover:to-gray-700 backdrop-blur-md border-2 border-white/20' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-400'
              } text-white active:scale-110`}
              title={isVideoOn ? 'Camera Off' : 'Camera On'}
            >
              {isVideoOn ? <VideoCameraIcon className="h-8 w-8" /> : <VideoCameraSlashIcon className="h-8 w-8 animate-pulse" />}
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-black backdrop-blur-md text-white text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-semibold border border-white/20 shadow-xl">
                {isVideoOn ? 'Turn Off' : 'Turn On'}
              </span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`group relative p-6 rounded-full transition-all duration-300 transform hover:scale-125 shadow-2xl hover:shadow-3xl ${
                showChat 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-2 border-blue-400' 
                  : 'bg-gradient-to-br from-gray-700/90 to-gray-800/90 hover:from-gray-600 hover:to-gray-700 backdrop-blur-md border-2 border-white/20'
              } text-white active:scale-110`}
              title="Chat"
            >
              <ChatBubbleLeftRightIcon className="h-8 w-8" />
              {chatMessages.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-xl animate-pulse border-2 border-white">
                  {chatMessages.length}
                </span>
              )}
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-black backdrop-blur-md text-white text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-semibold border border-white/20 shadow-xl">
                Chat
              </span>
            </button>

            <button
              onClick={handleEndSession}
              className="group relative p-6 bg-gradient-to-r from-red-600 via-red-700 to-pink-600 hover:from-red-500 hover:via-red-600 hover:to-pink-500 text-white rounded-full transition-all duration-300 transform hover:scale-125 shadow-2xl hover:shadow-3xl border-2 border-red-400 active:scale-110"
              title="End Call"
            >
              <PhoneXMarkIcon className="h-8 w-8 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-900 to-black backdrop-blur-md text-white text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap font-semibold border border-white/20 shadow-xl">
                End Call
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-gradient-to-br from-white via-gray-50 to-blue-50 shadow-2xl z-50 flex flex-col animate-slideInRight border-l border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 border-b border-white/20 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-white text-xl flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  Session Chat
                </h3>
                <p className="text-purple-100 text-sm mt-1.5 font-medium">
                  {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button 
                onClick={() => setShowChat(false)} 
                className="text-white hover:bg-white/20 p-2.5 rounded-full transition-all duration-300 hover:rotate-90 backdrop-blur-sm"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-16 animate-fadeIn">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <ChatBubbleLeftRightIcon className="h-10 w-10 text-purple-600" />
                </div>
                <div className="text-base font-semibold text-gray-700 mb-2">No messages yet</div>
                <div className="text-sm text-gray-500">Start a conversation!</div>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`max-w-[75%] rounded-3xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                    msg.sender === 'You' 
                      ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md border-2 border-gray-200'
                  }`}>
                    <div className={`text-xs font-bold mb-2 ${
                      msg.sender === 'You' ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {msg.sender}
                    </div>
                    <div className="text-sm leading-relaxed font-medium">{msg.message}</div>
                    <div className={`text-xs mt-2 flex items-center gap-1 ${
                      msg.sender === 'You' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-5 border-t border-gray-200 bg-white/80 backdrop-blur-xl">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-5 py-3.5 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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
