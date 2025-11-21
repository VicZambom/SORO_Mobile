// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { useAuth } from '../context/AuthContext'; 

import { RootStackParamList } from '../types/navigation';

// --- NOVAS TELAS IMPORTADAS ---
// Caminho ajustado para onde você criou as telas:
import { OcorrenciaListaScreen } from '../screens/OcorrenciaListaScreen'; 
import { OcorrenciaDetalheScreen } from '../screens/OcorrenciaDetalheScreen'; // Assumindo pasta Ocorrencias
import { NovaOcorrenciaScreen } from '../screens/NovaOcorrenciaScreen';
import { RegistroVitimaScreen } from '../screens/RegistroVitimaScreen'; // NOVO: Tela de Registro de Vítima

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8FAFC' }
        }}
      >
        {/* Renderização Condicional */}
        {signed ? (
          // Se estiver logado, renderizamos o Dashboard E TODAS as telas da aplicação
          <React.Fragment>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            
            {/* ROTAS DA APLICAÇÃO (Matheus e Maíra) */}
            <Stack.Screen name="OcorrenciaLista" component={OcorrenciaListaScreen} />
            <Stack.Screen name="OcorrenciaDetalhe" component={OcorrenciaDetalheScreen} /> 
            <Stack.Screen name="NovaOcorrencia" component={NovaOcorrenciaScreen} />
            
            {/* ROTA DA NOVA VÍTIMA */}
            <Stack.Screen name="RegistroVitima" component={RegistroVitimaScreen} />
            
          </React.Fragment>
        ) : (
          // Se NÃO estiver logado, SÓ existe o Login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};