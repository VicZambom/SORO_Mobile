// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../context/AuthContext'; 
import { Input } from '../components/Input';
import { Square, CheckSquare } from 'lucide-react-native'; 

export const LoginScreen = () => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn } = useAuth(); 
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha todos os campos.');

    try {
      setLoading(true);
      await signIn(email, password, rememberMe); 
    } catch (error: any) {
      Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRememberMe = () => setRememberMe(!rememberMe);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={tw`flex-1 bg-white`}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8 py-10`}>
        
        {/* --- CABEÇALHO / LOGO --- */}
        <View style={tw`items-center mb-12`}>
          <View style={tw`mb-4`}>
            <Image 
              source={require('../../assets/Logo.png')} 
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
          
          <Text style={tw`text-slate-900 text-4xl font-bold tracking-wider mb-2`}>S.O.R.O</Text>
          
          <Text style={tw`text-slate-600 text-center text-base px-4`}>
            Sistema Organizacional{'\n'}para Registros de Ocorrências
          </Text>
        </View>

        {/* --- FORMULÁRIO --- */}
        <View>
          <Input 
            label="Email"
            placeholder="seuemail@bombeiros.pe.gov.br" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />

          <Input 
            label="Senha"
            placeholder="Digite sua senha" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />

          {/* --- CHECKBOX "LEMBRAR DE MIM" --- */}
          <TouchableOpacity 
            style={tw`flex-row items-center mt-2 mb-2`} 
            onPress={toggleRememberMe}
            activeOpacity={0.8}
          >
            {rememberMe ? (
              <CheckSquare size={24} color="#0F172A" /> // Ícone marcado
            ) : (
              <Square size={24} color="#94a3b8" /> // Ícone desmarcado
            )}
            <Text style={tw`ml-2 text-slate-700 text-base`}>Lembrar de mim</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={tw`bg-slate-900 rounded-lg py-4 items-center mt-4 shadow-sm ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={tw`text-white font-bold text-lg`}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={tw`mt-6 items-center`} onPress={() => Alert.alert('Info', 'Contate o administrador.')}>
            <Text style={tw`text-slate-900 font-medium`}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};