// src/navigation/AppNavigator.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import tw from 'twrnc';

import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { MinhasOcorrencias } from '../screens/MinhasOcorrenciasScreen'; 
import { DetalhePendenteScreen } from '../screens/DetalhePendenteScreen';
import { NovaOcorrenciaScreen } from '../screens/NovaOcorrenciaScreen';
import { PerfilScreen } from '../screens/PerfilScreen';

// Tipos das rotas 
import { RootStackParamList } from '../types/navigation';

// --- NOVAS TELAS IMPORTADAS ---
// Caminho ajustado para onde você criou as telas:
import { OcorrenciaListaScreen } from '../screens/OcorrenciaListaScreen'; 
import { OcorrenciaDetalheScreen } from '../screens/OcorrenciaDetalheScreen'; // Assumindo pasta Ocorrencias
import { NovaOcorrenciaScreen } from '../screens/NovaOcorrenciaScreen';
import { RegistroVitimaScreen } from '../screens/RegistroVitimaScreen'; // NOVO: Tela de Registro de Vítima

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  // Estado real de autenticação
  const { signed, loading } = useAuth();

  // Enquanto verifica o token no AsyncStorage, mostra um loading
  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {signed ? (

          // --- FLUXO AUTENTICADO ---
          <>
            <Stack.Screen name="MinhasOcorrencias" component={MinhasOcorrencias} />
            <Stack.Screen name="OcorrenciaDetalhe" component={OcorrenciaDetalheScreen} /> 
            <Stack.Screen name="RegistroVitima" component={RegistroVitimaScreen} />
            <Stack.Screen name="DetalhePendente" component={DetalhePendenteScreen} />
            <Stack.Screen name="NovaOcorrencia" component={NovaOcorrenciaScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
          </>
        ) : (
          // --- FLUXO NÃO AUTENTICADO ---
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;