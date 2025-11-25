// App.tsx
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider> 
        <StatusBar style="light" />
        <AppNavigator />
      </SocketProvider>
    </AuthProvider>
  );
}