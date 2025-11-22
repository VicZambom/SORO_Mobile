import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Importando as TELAS reais do diretório `src/screens`
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/MinhasOcorrenciasScreen';
import { useAuth } from '../context/AuthContext'; 

import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Inicializa o Native Stack Navigator
const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  // Simulação de lógica de autenticação
  const userIsAuthenticated = true; 

  return (
    <NavigationContainer>
      <Stack.Navigator 
        // Define a tela de Minhas Ocorrências como a rota inicial para testes
        initialRouteName="ListaOcorrencias" 
        screenOptions={{ headerShown: false }}
      >
        
        {/* --- Rotas Principais --- */}
        
        {/* Tela de Login (Ainda não é a inicial) */}
        <Stack.Screen name="Login" component={LoginScreen} /> 

        {/* 1. Tela de Lista de Ocorrências (Componente que você fez primeiro) */}
        <Stack.Screen 
          name="ListaOcorrencias" 
          component={MyOccurrencesScreen}
        />

        {/* 2. NOVA TELA DE DETALHES DA OCORRÊNCIA */}
        <Stack.Screen 
          name="DetalhesOcorrencia" 
          component={TelaDetalhesOcorrencia} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;