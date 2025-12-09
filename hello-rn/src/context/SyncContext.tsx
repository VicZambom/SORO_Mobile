import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ToastAndroid, Platform } from 'react-native';
import api from '../services/api';
import { AxiosError } from 'axios';
import { useAuth } from './AuthContext'; 

interface PendingOcorrencia {
  id_temp: string;
  payload: any;
  timestamp: number;
}

interface SyncContextData {
  isOnline: boolean;
  isSyncing: boolean;
  pendingQueue: PendingOcorrencia[];
  addToQueue: (data: any) => Promise<void>;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingQueue, setPendingQueue] = useState<PendingOcorrencia[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  //Pegar estado de autenticação para garantir token
  const { user } = useAuth(); 

  // Monitorar conexão em tempo real
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!state.isConnected;
      setIsOnline(online);
      
      // Se voltar a ficar online e tiver fila, sincroniza.
      if (online && pendingQueue.length > 0) {
        console.log("Conexão restabelecida. Tentando sincronizar...");
        syncNow();
      }
    });
    return () => unsubscribe();
  }, [pendingQueue]); // Dependência adicionada para monitorar a fila também

  // Carregar fila salva ao iniciar
  useEffect(() => {
    async function loadQueue() {
      try {
        const stored = await AsyncStorage.getItem('@SORO:queue');
        if (stored) {
          setPendingQueue(JSON.parse(stored));
        }
      } catch (error) {
        console.log('Erro ao carregar fila offline:', error);
      }
    }
    loadQueue();
  }, []);

  const persistQueue = async (queue: PendingOcorrencia[]) => {
    setPendingQueue(queue);
    await AsyncStorage.setItem('@SORO:queue', JSON.stringify(queue));
  };

  const addToQueue = async (payload: any) => {
    const newItem: PendingOcorrencia = {
      id_temp: new Date().getTime().toString(),
      payload, 
      timestamp: Date.now(),
    };

    const newQueue = [...pendingQueue, newItem];
    await persistQueue(newQueue);
    
  };

  const syncNow = async () => {
    // Verificações de segurança
    const state = await NetInfo.fetch();
    if (!state.isConnected) {

       return;
    }

    if (pendingQueue.length === 0) return;
    if (isSyncing) return; // Evita duplicidade

    setIsSyncing(true);
    const queueCopy = [...pendingQueue];
    const failedItems: PendingOcorrencia[] = [];
    let successCount = 0;
    
    console.log(`Iniciando sincronização de ${queueCopy.length} itens...`);

    for (const item of queueCopy) {
      try {
        // A payload agora é o objeto puro da ocorrência (
        await api.post('/api/v3/ocorrencias', item.payload);
        successCount++;
        console.log(`Item ${item.id_temp} sincronizado.`);
      } catch (error: unknown) {
        const err = error as AxiosError;
        console.error(`Erro ao sincronizar item ${item.id_temp}:`, err.message);
        
        // Se for erro de validação (400) ou Auth (401), talvez devamos descartar ou alertar
        // Se for erro de servidor (500) ou rede, mantemos na fila
        const status = err.response?.status;
        
        if (status === 401) {
             Alert.alert('Sessão Expirada', 'Faça login novamente para sincronizar os dados.');
             setIsSyncing(false);
             return; // Para tudo se a autenticação falhar
        }

        // Mantém na fila para tentar depois
        failedItems.push(item); 
      }
    }

    await persistQueue(failedItems);
    setIsSyncing(false);

    if (successCount > 0) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(`${successCount} ocorrências sincronizadas!`, ToastAndroid.LONG);
      } else {
        Alert.alert('Sincronização', `${successCount} ocorrências enviadas.`);
      }
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingQueue, addToQueue, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);