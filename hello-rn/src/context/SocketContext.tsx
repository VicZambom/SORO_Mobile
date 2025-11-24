// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextData {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

// URL da sua API 
const SOCKET_URL = 'https://api-bombeiros-s-o-r-o.onrender.com';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { signed } = useAuth(); // Só conectamos se o usuário estiver logado

  useEffect(() => {
    let socketInstance: Socket | null = null;

    if (signed) {
      // Inicializa a conexão
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket'], // Força websocket para melhor performance
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
      // Se deslogar, desconecta o socket existente
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }

    // Cleanup ao desmontar
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