// src/screens/PerfilScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { LogOut, ArrowLeft, User as UserIcon } from 'lucide-react-native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';

export const PerfilScreen = () => {
  const { signOut, user } = useAuth();
  const navigation = useNavigation();

  return (
    <ScreenWrapper>
       {/* Header Simples com Voltar */}
      <View style={tw`flex-row items-center mb-8 mt-2`}>
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={tw`mr-4 p-2 bg-white rounded-full shadow-sm`}
        >
           <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={tw`text-2xl font-bold text-slate-900`}>Meu Perfil</Text>
      </View>

      <View style={tw`flex-1 px-2`}>
        
        {/* Avatar e Dados */}
        <View style={tw`items-center mb-10`}>
            <View style={tw`w-24 h-24 bg-slate-200 rounded-full items-center justify-center mb-4`}>
                <UserIcon size={48} color="#64748b" />
            </View>
            <Text style={tw`text-xl font-bold text-slate-900`}>{user?.name || 'Usuário'}</Text>
            <Text style={tw`text-slate-500`}>{user?.email || 'email@exemplo.com'}</Text>
        </View>

        {/* Placeholder solicitado */}
        <View style={tw`bg-blue-50 p-6 rounded-xl border border-blue-100 mb-auto`}>
            <Text style={tw`text-blue-800 text-center font-medium`}>
                Aqui vai ser a tela de perfil e configurações...
            </Text>
        </View>

        {/* Botão de Sair (Agora fica aqui) */}
        <TouchableOpacity 
          style={tw`flex-row bg-red-50 px-6 py-4 rounded-xl items-center border border-red-100 justify-center mb-6`}
          onPress={signOut}
        >
          <LogOut color="#ef4444" size={20} style={tw`mr-2`} />
          <Text style={tw`text-red-600 font-bold`}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};