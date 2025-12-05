// src/context/SyncContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../services/api';

interface PendingOcorrencia {
  id_temp: string;
  payload: any;
  timestamp: number;
}

interface SyncContextData {
  isOnline: boolean;
  pendingQueue: PendingOcorrencia[];
  addToQueue: (data: any) => Promise<void>;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingQueue, setPendingQueue] = useState<PendingOcorrencia[]>([]);

  // Monitorar conexão em tempo real
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Carregar fila salva ao iniciar o app
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

  // Função para salvar na fila (Offline)
  const addToQueue = async (payload: any) => {
    const newItem: PendingOcorrencia = {
      id_temp: new Date().getTime().toString(),
      payload,
      timestamp: Date.now(),
    };

    const newQueue = [...pendingQueue, newItem];
    setPendingQueue(newQueue);
    await AsyncStorage.setItem('@SORO:queue', JSON.stringify(newQueue));
    
    Alert.alert('Modo Offline', 'Sem conexão no momento. A ocorrência foi salva e será enviada assim que possível.');
  };

  // Função de Sincronização (Tentar enviar tudo)
  const syncNow = async () => {
    if (!isOnline) {
      Alert.alert('Sem conexão', 'Conecte-se à internet para sincronizar.');
      return;
    }

    if (pendingQueue.length === 0) {
      Alert.alert('Tudo certo', 'Não há registros pendentes.');
      return;
    }

    const queueCopy = [...pendingQueue];
    const failedItems: PendingOcorrencia[] = [];
    let successCount = 0;

    // Feedback visual 
    console.log('Iniciando sincronização...');

    for (const item of queueCopy) {
      try {
        // Tenta enviar para a API
        await api.post('/api/v2/ocorrencias', item.payload);
        successCount++;
      } catch (error) {
        console.error('Erro ao sincronizar item:', error);
        failedItems.push(item); 
      }
    }

    // Atualiza a fila apenas com os que falharam
    setPendingQueue(failedItems);
    await AsyncStorage.setItem('@SORO:queue', JSON.stringify(failedItems));

    if (successCount > 0) {
      Alert.alert('Sincronização Concluída', `${successCount} ocorrências foram enviadas ao servidor!`);
    }
    
    if (failedItems.length > 0) {
      Alert.alert('Atenção', `${failedItems.length} itens não puderam ser enviados e continuam salvos no celular.`);
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, pendingQueue, addToQueue, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);