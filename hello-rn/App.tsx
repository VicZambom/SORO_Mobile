// App.tsx
import { StatusBar } from 'expo-status-bar';
// Se você ver '<LoginScreen />' aqui em baixo, ESTÁ ERRADO.
// O correto é importar o AppNavigator:
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      {/* O AppNavigator gerencia as telas */}
      <AppNavigator />
    </>
  );
}