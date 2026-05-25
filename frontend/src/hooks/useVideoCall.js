import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useVideoCall = ({ roomId, userId, userName, onCallEnd }) => {
  const { joinRoom, sendOffer, sendAnswer, sendIceCandidate, onEvent, offEvent } = useSocket();

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);

  const [callState, setCallState] = useState({
    isConnected: false,
    isMuted:     false,
    isCamOff:    false,
    duration:    0,
    remoteName:  '',
    error:       null,
  });

  const timerRef = useRef(null);

  // Create peer connection
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) sendIceCandidate('remote', candidate);
    };

    pc.ontrack = ({ streams: [stream] }) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
      setCallState(s => ({ ...s, isConnected: true }));
      timerRef.current = setInterval(() => setCallState(s => ({ ...s, duration: s.duration + 1 })), 1000);
    };

    pc.oniceconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) endCall();
    };

    return pc;
  }, [sendIceCandidate]);

  // Start local media
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      setCallState(s => ({ ...s, error: 'Camera/microphone access denied. Please allow permissions.' }));
      return null;
    }
  }, []);

  // Join room and initiate call
  const startCall = useCallback(async () => {
    const stream = await startMedia();
    if (!stream) return;

    pcRef.current = createPC();
    stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));

    joinRoom(roomId, userId, userName);

    // Listen for peers
    const handlePeers = async (peers) => {
      if (peers.length > 0) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        sendOffer(peers[0].socketId, offer);
        setCallState(s => ({ ...s, remoteName: peers[0].userName }));
      }
    };

    const handleOffer = async ({ from, offer }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      sendAnswer(from, answer);
    };

    const handleAnswer = async ({ answer }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleCandidate = async ({ candidate }) => {
      try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
    };

    const handleUserJoined = ({ userName: name }) => {
      setCallState(s => ({ ...s, remoteName: name }));
    };

    onEvent('room-peers',    handlePeers);
    onEvent('offer',         handleOffer);
    onEvent('answer',        handleAnswer);
    onEvent('ice-candidate', handleCandidate);
    onEvent('user-joined',   handleUserJoined);

    return () => {
      offEvent('room-peers',    handlePeers);
      offEvent('offer',         handleOffer);
      offEvent('answer',        handleAnswer);
      offEvent('ice-candidate', handleCandidate);
      offEvent('user-joined',   handleUserJoined);
    };
  }, [roomId, userId, userName, createPC, startMedia, joinRoom, sendOffer, sendAnswer, onEvent, offEvent]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setCallState(s => ({ ...s, isMuted: !s.isMuted }));
  }, []);

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCallState(s => ({ ...s, isCamOff: !s.isCamOff }));
  }, []);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
    onCallEnd?.();
  }, [onCallEnd]);

  useEffect(() => () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
  }, []);

  const formatDuration = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return { localVideoRef, remoteVideoRef, callState, startCall, toggleMute, toggleCamera, endCall, formatDuration };
};
