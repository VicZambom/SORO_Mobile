// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import api from '../services/api'; // Importamos nossa API

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    try {
      setLoading(true); // Ativa o spinner
      
      // Rota baseada nos arquivos do backend que você enviou (authRoutes.ts)
      const response = await api.post('/login', {
        email: email,
        password: password
      });

      // Se chegou aqui, o login foi sucesso (Status 200)
      console.log('Login realizado:', response.data);
      
      // DICA DO SORO: Em um app real, salvaríamos o token aqui com AsyncStorage
      // Mas por enquanto, vamos apenas navegar.
      
      setLoading(false);
      navigation.replace('Dashboard');

    } catch (error: any) {
      setLoading(false);
      // Tratamento de erro robusto
      const mensagem = error.response?.data?.message || 'Falha ao conectar com o servidor.';
      Alert.alert('Erro no Login', mensagem);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-slate-900 justify-center px-6`}
    >
      {/* Cabeçalho */}
      <View style={tw`items-center mb-10`}>
        <View style={tw`bg-blue-600 p-4 rounded-full mb-4`}>
          <LogIn color="white" size={32} />
        </View>
        <Text style={tw`text-white text-3xl font-bold`}>S.O.R.O.</Text>
        <Text style={tw`text-slate-400 text-base mt-2`}>Ambiente Móvel</Text>
      </View>

      {/* Formulário */}
      <View style={tw`gap-4`}>
        <View style={tw`flex-row items-center bg-slate-800 rounded-lg px-4 border border-slate-700`}>
          <Mail color="#94a3b8" size={20} />
          <TextInput
            placeholder="Seu e-mail"
            placeholderTextColor="#94a3b8"
            style={tw`flex-1 text-white py-4 ml-3`}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={tw`flex-row items-center bg-slate-800 rounded-lg px-4 border border-slate-700`}>
          <Lock color="#94a3b8" size={20} />
          <TextInput
            placeholder="Sua senha"
            placeholderTextColor="#94a3b8"
            style={tw`flex-1 text-white py-4 ml-3`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={tw`bg-blue-600 rounded-lg py-4 items-center mt-4 ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={tw`text-white font-bold text-lg`}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};