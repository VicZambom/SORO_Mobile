// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Constants from 'expo-constants';
// import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';

/*
// Configuração para o alerta aparecer mesmo com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});
*/

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

  /* Comentado para o Expo Go
  // Solicitar permissão ao montar
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de notificação negada');
      }
    }
    requestPermissions();
  }, []);
  */

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

      socketInstance.on('nova_ocorrencia', async (data) => {
        console.log(' Nova ocorrência recebida via Socket');
        
        /* await Notifications.scheduleNotificationAsync({
          content: {
            title: ' Nova Ocorrência!',
            body: `Verifique o chamado no bairro ${data.bairro?.nome_bairro || 'Desconhecido'}.`,
            data: { url: `/ocorrencia/${data.id_ocorrencia}` }, // Dados extras úteis
          },
          trigger: null, // Dispara imediatamente
        });
        */
      });

      setSocket(socketInstance);
    }

    return () => {
       if (socketInstance) socketInstance.disconnect();
    };
  }, [signed]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);