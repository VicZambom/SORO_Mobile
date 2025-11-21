// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Tipagem do que vamos guardar do usuário
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean; // Loading da verificação inicial
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se já tem token salvo
  useEffect(() => {
    async function loadStorageData() {
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

  // Função de Login 
  async function signIn(email: string, password: string) {
    const response = await api.post('/login', {
      email,
      password,
    });

    const { token, user } = response.data; 

    // Configura o token no Axios para as próximas requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Salva no celular
    await AsyncStorage.setItem('@SORO:user', JSON.stringify(user));
    await AsyncStorage.setItem('@SORO:token', token);

    setUser(user);
  }

  // Função de Logout
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