import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected,     setConnected]     = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: sessionStorage.getItem('mc_token') },
      transports: ['websocket','polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect',    () => { setConnected(true);  socket.emit('join-user-room', user._id); });
    socket.on('disconnect', () =>   setConnected(false));
    socket.on('connect_error', (e) => console.warn('Socket error:', e.message));
    socket.on('new-notification', (n) => {
      setNotifications(prev => [n, ...prev]);
      toast(`🔔 ${n.title}`, { duration:4000 });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [isAuthenticated, user]);

  const joinRoom          = (roomId, userId, userName) => socketRef.current?.emit('join-room',    { roomId, userId, userName });
  const sendOffer         = (to, offer)                => socketRef.current?.emit('offer',         { to, offer });
  const sendAnswer        = (to, answer)               => socketRef.current?.emit('answer',        { to, answer });
  const sendIceCandidate  = (to, candidate)            => socketRef.current?.emit('ice-candidate', { to, candidate });
  const sendChatMessage   = (roomId, message, sender)  => socketRef.current?.emit('chat-message',  { roomId, message, sender });
  const onEvent           = (event, cb) => socketRef.current?.on(event,  cb);
  const offEvent          = (event, cb) => socketRef.current?.off(event, cb);

  return (
    <SocketContext.Provider value={{ socket:socketRef.current, connected, notifications, setNotifications, joinRoom, sendOffer, sendAnswer, sendIceCandidate, sendChatMessage, onEvent, offEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
