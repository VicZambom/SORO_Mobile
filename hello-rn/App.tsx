// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { SyncProvider } from './src/context/SyncContext';

// Criação do cliente do React Query
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <SyncProvider> 
            <StatusBar style="light" />
            <AppNavigator />
          </SyncProvider> 
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}