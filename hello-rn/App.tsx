// App.tsx
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { SyncProvider } from './src/context/SyncContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SyncProvider> 
          <StatusBar style="light" />
          <AppNavigator />
        </SyncProvider> 
      </SocketProvider>
    </AuthProvider>
  );
}