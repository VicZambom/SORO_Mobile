// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext'; 
import { Input } from '../components/Input'; 

export const LoginScreen = () => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth(); 
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha tudo.');

    try {
      setLoading(true);
      await signIn(email, password); 
      
    } catch (error: any) {
      Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 bg-slate-900 justify-center px-6`}>
      
      <View style={tw`items-center mb-10`}>
        <View style={tw`bg-blue-600 p-4 rounded-full mb-4`}><LogIn color="white" size={32} /></View>
        <Text style={tw`text-white text-3xl font-bold`}>S.O.R.O.</Text>
        <Text style={tw`text-slate-400 text-base mt-2`}>Ambiente Móvel</Text>
      </View>

      <View>
        <Input 
          icon={Mail} 
          placeholder="Seu e-mail" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />

        <Input 
          icon={Lock} 
          placeholder="Sua senha" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        <TouchableOpacity 
          style={tw`bg-blue-600 rounded-lg py-4 items-center mt-4 ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={tw`text-white font-bold text-lg`}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};