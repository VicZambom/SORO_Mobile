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
import { DetalheAndamentoScreen } from '../screens/DetalheAndamentoScreen';
import { RegistrarVitimaScreen } from '../screens/RegistrarVitimaScreen';
import { ColetarAssinaturaScreen } from '../screens/ColetarAssinaturaScreen';
import { NovaOcorrenciaScreen } from '../screens/NovaOcorrenciaScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { SobreScreen } from '../screens/SobreScreen';

// Tipos das rotas 
import { RootStackParamList } from '../types/navigation';

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
            <Stack.Screen name="DetalhePendente" component={DetalhePendenteScreen} />
            <Stack.Screen name="DetalheAndamento" component={DetalheAndamentoScreen} />
            <Stack.Screen name="RegistrarVitima" component={RegistrarVitimaScreen} />
            <Stack.Screen name="ColetarAssinatura" component={ColetarAssinaturaScreen} />
            <Stack.Screen name="NovaOcorrencia" component={NovaOcorrenciaScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
            <Stack.Screen name="Sobre" component= {SobreScreen} />
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