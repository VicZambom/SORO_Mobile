// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Parâmetro rememberMe
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() { 
      // Ao fazer a leitura, se o usuário marcou "lembrar" anteriormente, ele loga.

      const storedUser = await AsyncStorage.getItem('@SORO:user');
      const storedToken = await AsyncStorage.getItem('@SORO:token');

      if (storedUser && storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
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

      // SÓ salva no celular se o usuário pediu para lembrar
      if (rememberMe) {
        await AsyncStorage.setItem('@SORO:user', JSON.stringify(user));
        await AsyncStorage.setItem('@SORO:token', token);
      }

      // Atualiza o estado da aplicação 
      setUser(user);
      
    } catch (error: any) {
      throw error;
    }
  }

  async function signOut() {
    await AsyncStorage.clear();
    setUser(null);
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