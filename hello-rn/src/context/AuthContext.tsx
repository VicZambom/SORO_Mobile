// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; 
import api from '../services/api';

interface User {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  tipo_perfil: string;
  id_unidade_operacional_fk?: string | null; 
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() { 
      try {
        const [storedUser, token] = await Promise.all([
          AsyncStorage.getItem('@SORO:user'),
          SecureStore.getItemAsync('token')
        ]);

        if (storedUser && token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados de armazenamento:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string, rememberMe: boolean) {
    try {
      const response = await api.post('/api/v3/auth/login', { 
        email,
        password,
      });

      const { token, user } = response.data; 

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Persistência condicional 
      if (rememberMe) {
        await AsyncStorage.setItem('@SORO:user', JSON.stringify(user));
        await SecureStore.setItemAsync('token', token); 
      }

      setUser(user);
      
    } catch (error) {
      // Repassa o erro para a tela tratar 
      throw error; 
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem('@SORO:user');
      await SecureStore.deleteItemAsync('token'); // Destrói o token seguro
      
      // Limpa o estado e o header
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}