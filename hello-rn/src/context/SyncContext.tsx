// src/context/SyncContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ToastAndroid, Platform } from 'react-native';
import api from '../services/api';
import { AxiosError } from 'axios';

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

  // Helper para atualizar estado e disco simultaneamente
  const persistQueue = async (queue: PendingOcorrencia[]) => {
    setPendingQueue(queue);
    await AsyncStorage.setItem('@SORO:queue', JSON.stringify(queue));
  };

  // Função para salvar na fila (Offline)
  const addToQueue = async (payload: any) => {
    const newItem: PendingOcorrencia = {
      id_temp: new Date().getTime().toString(),
      payload,
      timestamp: Date.now(),
    };

    const newQueue = [...pendingQueue, newItem];
    await persistQueue(newQueue);
    
    Alert.alert('Modo Offline', 'Sem conexão no momento. A ocorrência foi salva e será enviada assim que possível.');
  };

  // Função de Sincronização 
  const syncNow = async () => {
    if (!isOnline) {
      Alert.alert('Sem conexão', 'Conecte-se à internet para sincronizar.');
      return;
    }

    if (pendingQueue.length === 0) {
      if (Platform.OS === 'android') {
          ToastAndroid.show('Tudo sincronizado!', ToastAndroid.SHORT);
      } else {
          Alert.alert('Tudo certo', 'Não há registros pendentes.');
      }
      return;
    }

    setIsSyncing(true);
    const queueCopy = [...pendingQueue];
    const failedItems: PendingOcorrencia[] = [];
    let successCount = 0;
    let authError = false;

    console.log(`Iniciando sincronização de ${queueCopy.length} itens...`);

    for (const item of queueCopy) {
      // Se detectou erro de auth, não tenta os próximos para evitar spam/bloqueio
      if (authError) {
        failedItems.push(item);
        continue;
      }

      try {
        // Tenta enviar para a API
        await api.post('/api/v2/ocorrencias', item.payload);
        successCount++;
        console.log(`Item ${item.id_temp} sincronizado.`);
      } catch (error: unknown) {
        const err = error as AxiosError;
        console.error(`Erro ao sincronizar item ${item.id_temp}:`, err.message);
        
        // Verificação de Erro 401 (Token Expirado/Inválido)
        if (err.response && err.response.status === 401) {
            authError = true;
            Alert.alert(
                'Sessão Expirada', 
                'Não foi possível sincronizar pois sua sessão expirou. Por favor, faça login novamente para não perder os dados.'
            );
        }
        
        // Mantém na fila para tentar depois
        failedItems.push(item); 
      }
    }

    // Atualiza a fila apenas com os que falharam (ou não foram tentados)
    await persistQueue(failedItems);
    setIsSyncing(false);

    if (successCount > 0) {
      Alert.alert('Sincronização', `${successCount} ocorrências foram enviadas com sucesso!`);
    }
    
    if (failedItems.length > 0 && !authError) {
      // Se sobrou item e NÃO foi erro de auth (erro 500 ou oscilação de net)
      Alert.alert('Atenção', `${failedItems.length} itens não puderam ser enviados. Tente novamente mais tarde.`);
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingQueue, addToQueue, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);