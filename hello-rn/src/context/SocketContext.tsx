// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

interface SocketContextData {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

const socketUrl = Constants.expoConfig?.extra?.apiUrl || '';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { signed } = useAuth();

  useEffect(() => {
    let socketInstance: Socket | null = null;

    if (signed && socketUrl) {
      socketInstance = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
      });

      socketInstance.on('connect', () => {
        console.log('Socket conectado:', socketInstance?.id);
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket desconectado');
        setConnected(false);
      });

      setSocket(socketInstance);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
    
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [signed]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);