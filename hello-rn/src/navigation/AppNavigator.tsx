// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { useAuth } from '../context/AuthContext'; 

import { RootStackParamList } from '../types/navigation';

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
          // Se estiver logado, SÓ existe o Dashboard (e telas internas dele)
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          // Se NÃO estiver logado, SÓ existe o Login
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};