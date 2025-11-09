import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  // Return null if context is null (not within provider) or if socket is null
  // This allows components to check if (!socket) instead of throwing errors
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // In Docker, nginx proxies /socket.io, so use relative URL
    // In local dev, use the full URL from env or default to localhost:5000
    let socketUrl;
    if (process.env.REACT_APP_API_URL) {
      // Extract base URL (remove /api if present)
      socketUrl = process.env.REACT_APP_API_URL.replace('/api', '');
    } else {
      // Use relative URL for Docker/production
      socketUrl = window.location.origin;
    }
    
    try {
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
      });
      
      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error);
      });
      
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

