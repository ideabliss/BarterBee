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
  const [connectionStatus, setConnectionStatus] = useState('initializing'); // initializing, waiting, connecting, connected
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [micPermission, setMicPermission] = useState('prompt');
  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
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
      setIsInitializing(true);
      setPermissionError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access. Please use Chrome, Firefox, Safari, or Edge.');
      }

      // Check if page is served over HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS. Please use https:// or localhost.');
      }
      
      // Initialize Socket.IO first (don't wait for camera)
      const socketUrl = import.meta.env.PROD 
        ? 'https://barterbee.onrender.com'
        : 'http://localhost:5000';
      socketRef.current = io(socketUrl);
      
      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected');
        setConnectionStatus('waiting');
        // Join video room after socket connects
        socketRef.current.emit('join-video-room', {
          sessionId,
          userId: user?.id || 'anonymous',
          userName: user?.name || 'Anonymous User'
        });
        console.log('📡 Joined video room:', sessionId);
      });
      
      // Socket event listeners
      socketRef.current.on('user-joined', handleUserJoined);
      socketRef.current.on('offer', handleOffer);
      socketRef.current.on('answer', handleAnswer);
      socketRef.current.on('ice-candidate', handleIceCandidate);
      socketRef.current.on('user-left', handleUserLeft);
      socketRef.current.on('video-chat-message', handleChatMessage);
      
      // Request camera and microphone access with detailed error handling
      try {
        console.log('Requesting camera and microphone access...');
        
        const constraints = {
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
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('✅ Got local stream:', stream);
        console.log('Video tracks:', stream.getVideoTracks().map(t => ({
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState
        })));
        console.log('Audio tracks:', stream.getAudioTracks().map(t => ({
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState
        })));
        
        localStreamRef.current = stream;
        
        // Set permissions granted
        if (stream.getVideoTracks().length > 0) {
          setCameraPermission('granted');
          setIsVideoOn(true);
        } else {
          setCameraPermission('denied');
          setIsVideoOn(false);
        }
        
        if (stream.getAudioTracks().length > 0) {
          setMicPermission('granted');
          setIsAudioOn(true);
        } else {
          setMicPermission('denied');
          setIsAudioOn(false);
        }
        
        // Attach stream to video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          
          // Add multiple event listeners for debugging
          localVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            localVideoRef.current.play()
              .then(() => console.log('✅ Local video playing'))
              .catch(e => {
                console.error('❌ Local video play failed:', e);
                // Try to play again after user interaction
                localVideoRef.current.muted = true;
                localVideoRef.current.play().catch(err => console.error('Retry failed:', err));
              });
          };
          
          localVideoRef.current.onloadeddata = () => {
            console.log('Video data loaded');
          };
          
          localVideoRef.current.onplay = () => {
            console.log('Video started playing');
          };
        }
        
        console.log('✅ Camera and microphone access granted');
        setIsInitializing(false);
        
      } catch (error) {
        console.error('❌ Camera/Microphone access failed:', error);
        
        // Detailed error messages
        let errorMessage = 'Could not access camera/microphone. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += 'Permission denied. Please allow camera and microphone access in your browser settings.';
          setCameraPermission('denied');
          setMicPermission('denied');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage += 'No camera or microphone found. Please connect a device and refresh.';
          setCameraPermission('unavailable');
          setMicPermission('unavailable');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage += 'Camera/microphone is already in use by another application. Please close other apps and try again.';
          setCameraPermission('blocked');
          setMicPermission('blocked');
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
          errorMessage += 'Your camera does not meet the requirements. Trying with lower quality...';
          // Try again with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = basicStream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = basicStream;
              localVideoRef.current.play().catch(e => console.error('Play failed:', e));
            }
            setCameraPermission('granted');
            setMicPermission('granted');
            setIsVideoOn(true);
            setIsAudioOn(true);
            setIsInitializing(false);
            return;
          } catch (retryError) {
            errorMessage += ' Failed to initialize with basic settings.';
          }
        } else {
          errorMessage += `Error: ${error.message}`;
        }
        
        setPermissionError(errorMessage);
        setIsVideoOn(false);
        setIsAudioOn(false);
        setIsInitializing(false);
      }
      
    } catch (error) {
      console.error('Failed to initialize video call:', error);
      setPermissionError('Failed to initialize video call: ' + error.message);
      setIsInitializing(false);
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
      console.log('🔗 Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setConnectionStatus('connected');
        setIsConnected(true);
      } else if (peerConnection.connectionState === 'connecting') {
        setConnectionStatus('connecting');
      } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        setConnectionStatus('waiting');
        setIsConnected(false);
      }
    };
    
    peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
    };
    
    return peerConnection;
  };

  const handleUserJoined = async (data) => {
    console.log('👤 User joined:', data);
    setRemoteUser(data);
    setConnectionStatus('connecting');
    
    // Wait for local stream to be ready before creating offer
    const waitForStream = async () => {
      let attempts = 0;
      while (!localStreamRef.current && attempts < 50) {
        console.log('⏳ Waiting for local stream...', attempts);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return localStreamRef.current;
    };
    
    // Only create offer if we don't already have a peer connection
    if (!peerConnectionRef.current) {
      const stream = await waitForStream();
      
      if (!stream) {
        console.error('❌ Local stream not available after waiting');
        setPermissionError('Cannot start call - camera/microphone not ready');
        setConnectionStatus('waiting');
        return;
      }
      
      console.log('✅ Local stream ready, creating peer connection');
      peerConnectionRef.current = createPeerConnection();
      
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        
        console.log('📤 Sending offer to:', data.userName);
        socketRef.current.emit('offer', {
          sessionId,
          offer,
          targetUserId: data.userId
        });
      } catch (error) {
        console.error('Failed to create offer:', error);
        setConnectionStatus('waiting');
      }
    }
  };

  const handleOffer = async (data) => {
    console.log('📥 Received offer from:', data.fromUserName);
    setConnectionStatus('connecting');
    
    // Wait for local stream to be ready
    const waitForStream = async () => {
      let attempts = 0;
      while (!localStreamRef.current && attempts < 50) {
        console.log('⏳ Waiting for local stream before answering...', attempts);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      return localStreamRef.current;
    };
    
    const stream = await waitForStream();
    
    if (!stream) {
      console.error('❌ Local stream not available, cannot answer offer');
      setPermissionError('Cannot join call - camera/microphone not ready');
      setConnectionStatus('waiting');
      return;
    }
    
    if (!peerConnectionRef.current) {
      console.log('✅ Local stream ready, creating peer connection for answer');
      peerConnectionRef.current = createPeerConnection();
    }
    
    try {
      await peerConnectionRef.current.setRemoteDescription(data.offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      console.log('📤 Sending answer');
      socketRef.current.emit('answer', {
        sessionId,
        answer,
        targetUserId: data.fromUserId
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
      setConnectionStatus('waiting');
    }
  };

  const handleAnswer = async (data) => {
    console.log('📥 Received answer from:', data.fromUserName);
    try {
      if (!peerConnectionRef.current) {
        console.error('❌ No peer connection to handle answer');
        return;
      }
      await peerConnectionRef.current.setRemoteDescription(data.answer);
      console.log('✅ Answer processed successfully');
    } catch (error) {
      console.error('❌ Failed to handle answer:', error);
    }
  };

  const handleIceCandidate = async (data) => {
    console.log('🧊 Received ICE candidate');
    try {
      if (!peerConnectionRef.current) {
        console.error('❌ No peer connection to add ICE candidate');
        return;
      }
      await peerConnectionRef.current.addIceCandidate(data.candidate);
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
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
      } else {
        // Try to re-request camera access
        requestCameraAccess();
      }
    } else {
      // No stream, request access
      requestCameraAccess();
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        console.log('Audio toggled:', audioTrack.enabled);
      } else {
        // Try to re-request microphone access
        requestCameraAccess();
      }
    } else {
      // No stream, request access
      requestCameraAccess();
    }
  };

  const requestCameraAccess = async () => {
    try {
      setPermissionError(null);
      console.log('Manually requesting camera/microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop old tracks if any
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.error('Play failed:', e));
      }
      
      setCameraPermission('granted');
      setMicPermission('granted');
      setIsVideoOn(true);
      setIsAudioOn(true);
      
      console.log('✅ Camera/microphone access granted manually');
      
      // If peer connection exists, add new tracks
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        stream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
      }
      
    } catch (error) {
      console.error('Failed to get camera access:', error);
      let errorMsg = 'Failed to access camera/microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMsg += 'Please click the camera icon in your browser address bar and allow access.';
      } else if (error.name === 'NotFoundError') {
        errorMsg += 'No camera or microphone found.';
      } else {
        errorMsg += error.message;
      }
      
      setPermissionError(errorMsg);
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
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 
              connectionStatus === 'waiting' ? 'bg-gray-400' : 
              'bg-blue-400'
            }`}></div>
            <div>
              <div className="font-semibold">{remoteUser?.userName || 'Waiting for participant...'}</div>
              <div className="text-sm text-gray-300">
                {connectionStatus === 'connected' && '✅ Video Connected'}
                {connectionStatus === 'connecting' && '🔄 Connecting...'}
                {connectionStatus === 'waiting' && '⏳ Waiting for participant...'}
                {connectionStatus === 'initializing' && '🚀 Initializing...'}
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

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="bg-yellow-600 text-white px-4 py-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="font-semibold mb-1">⚠️ Camera/Microphone Access Issue</div>
            <div className="text-sm">{permissionError}</div>
            <button
              onClick={requestCameraAccess}
              className="mt-2 bg-yellow-700 hover:bg-yellow-800 px-4 py-2 rounded text-sm font-medium"
            >
              Try Again
            </button>
          </div>
          <button
            onClick={() => setPermissionError(null)}
            className="text-white hover:text-gray-200 ml-4"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Initializing Overlay */}
      {isInitializing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 text-center text-white max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-xl font-semibold mb-2">Initializing Video Call...</div>
            <div className="text-sm text-gray-300">
              Please allow camera and microphone access when prompted
            </div>
          </div>
        </div>
      )}

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
                <div className="text-center text-white max-w-md px-4">
                  <VideoCameraSlashIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <div className="font-semibold text-lg mb-2">Camera Off</div>
                  {cameraPermission === 'denied' && (
                    <div className="text-sm text-gray-300 mb-4">
                      <p>Camera access was denied.</p>
                      <p className="mt-2">To enable:</p>
                      <ol className="text-left mt-2 space-y-1">
                        <li>1. Click the 🔒 or 🎥 icon in your browser's address bar</li>
                        <li>2. Change camera permission to "Allow"</li>
                        <li>3. Refresh the page or click the camera button</li>
                      </ol>
                    </div>
                  )}
                  {cameraPermission === 'unavailable' && (
                    <div className="text-sm text-gray-300">
                      No camera detected. Please connect a camera device.
                    </div>
                  )}
                  {cameraPermission === 'granted' && !isVideoOn && (
                    <div className="text-sm text-gray-300">
                      Camera is available but turned off. Click the camera button to turn it on.
                    </div>
                  )}
                  {cameraPermission === 'prompt' && (
                    <button
                      onClick={requestCameraAccess}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Enable Camera
                    </button>
                  )}
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