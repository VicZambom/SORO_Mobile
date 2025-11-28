// src/screens/PerfilScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import tw from 'twrnc';
import { ArrowLeft, User as UserIcon, Mail, BadgeInfo, Moon, Bell, CloudOff, 
  ChevronRight, LogOut, IdCard, MapPin } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AppNavigationProp } from '../types/navigation';

export const PerfilScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user, signOut } = useAuth();
  
  // Dados de estado da UI
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [temaEscuroAtivo, setTemaEscuroAtivo] = useState(false);

  // Função de Logout com confirmação
  const handleSignOut = () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair da conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: signOut }
      ]
    );
  };

  const handleSincronizar = () => {
    console.log('Sincronização forçada!');
    Alert.alert('Info', 'Sincronização simulada com sucesso.');
  };

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={tw`flex-row items-center mb-6 mt-2 px-2`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`mr-4 p-2 bg-white rounded-full border border-slate-200`}
        >
          <ArrowLeft size={22} color="#334155" />
        </TouchableOpacity>

        <Text style={tw`text-2xl font-bold text-slate-900`}>
          Perfil
        </Text>
      </View>

      <ScrollView style={tw`px-2 pb-10`} showsVerticalScrollIndicator={false}>

        {/* CARD DE PERFIL */}
        <View style={tw`bg-white rounded-xl p-5 mb-5 border border-slate-200 shadow-sm`}>
          <View style={tw`flex-row items-center mb-5`}>
            {/* Iniciais do Nome */}
            <View style={tw`w-16 h-16 rounded-full bg-blue-600 items-center justify-center mr-4`}>
              <Text style={tw`text-white text-xl font-bold`}>
                {user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'BM'}
              </Text>
            </View>

            <View style={tw`flex-1`}>
              {/* Nome do Usuário */}
              <Text style={tw`text-lg font-bold text-slate-900`} numberOfLines={1}>
                {user?.nome || 'Usuário'}
              </Text>
              
              <View style={tw`flex-row items-center mt-1`}>
                <MapPin size={14} color="#64748b" />
                <Text style={tw`text-slate-500 ml-1 text-xs`}>
                   Unidade Operacional
                </Text>
              </View>
               
               {/* Perfil */}
               <View style={tw`bg-blue-100 self-start px-2 py-0.5 rounded mt-2`}>
                 <Text style={tw`text-blue-700 text-[10px] font-bold`}>
                   {user?.tipo_perfil || 'N/A'}
                 </Text>
               </View>
            </View>
          </View>

          {/* Matrícula */}
          <View style={tw`flex-row items-center py-3 border-t border-gray-100`}>
            <IdCard size={20} color="#64748b" />
            <View style={tw`ml-3`}>
              <Text style={tw`text-xs text-slate-400 font-medium`}>Matrícula</Text>
              <Text style={tw`text-sm text-slate-900 font-semibold`}>
                {user?.matricula || '---'}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View style={tw`flex-row items-center py-3 border-t border-gray-100`}>
            <Mail size={20} color="#64748b" />
            <View style={tw`ml-3 flex-1`}>
              <Text style={tw`text-xs text-slate-400 font-medium`}>Email Institucional</Text>
              <Text style={tw`text-sm text-slate-900 font-semibold`} numberOfLines={1}>
                {user?.email || '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* STATUS DO SISTEMA*/}
        <Text style={tw`text-xs font-bold text-slate-500 mb-2 px-1 mt-2 uppercase`}>
          Sincronização
        </Text>

        <View style={tw`bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden`}>
          <View style={tw`flex-row items-center p-4`}>
            <CloudOff size={28} color="#475569" />
            <View style={tw`ml-4 flex-1`}>
              <Text style={tw`text-base font-bold text-slate-900`}>
                Dados Offline
              </Text>
              <Text style={tw`text-slate-500 text-xs`}>
                Você tem 3 registros aguardando envio.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={tw`bg-slate-800 py-3 items-center`}
            onPress={handleSincronizar}
          >
            <Text style={tw`text-white font-bold text-sm tracking-wide`}>FORÇAR ENVIO AGORA</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERÊNCIAS */}
        <Text style={tw`text-xs font-bold text-slate-500 mb-2 px-1 uppercase`}>
          App
        </Text>

        <View style={tw`bg-white rounded-xl border border-slate-200 mb-6`}>
          <View style={tw`flex-row justify-between items-center px-4 py-3 border-b border-slate-100`}>
            <View style={tw`flex-row items-center`}>
              <Bell size={20} color="#334155" />
              <Text style={tw`text-sm text-slate-900 ml-3 font-medium`}>Notificações</Text>
            </View>
            <Switch 
              value={notificacoesAtivas} 
              onValueChange={setNotificacoesAtivas}
              trackColor={{ false: "#e2e8f0", true: "#0f172a" }} 
            />
          </View>

          <View style={tw`flex-row justify-between items-center px-4 py-3 border-b border-slate-100`}>
            <View style={tw`flex-row items-center`}>
              <Moon size={20} color="#334155" />
              <Text style={tw`text-sm text-slate-900 ml-3 font-medium`}>Modo Escuro</Text>
            </View>
            <Switch 
              value={temaEscuroAtivo} 
              onValueChange={setTemaEscuroAtivo}
              trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
            />
          </View>

          <TouchableOpacity 
             style={tw`flex-row justify-between items-center px-4 py-4`}
             onPress={() => navigation.navigate('Sobre')}
          >
            <View style={tw`flex-row items-center`}>
              <BadgeInfo size={20} color="#334155" />
              <Text style={tw`text-sm text-slate-900 ml-3 font-medium`}>Sobre o S.O.R.O.</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* BOTÃO DE SAIR */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={tw`flex-row bg-red-50 px-4 py-3 rounded-xl 
          items-center border border-red-100 justify-center mb-8`}
        >
          <LogOut size={18} color="#ef4444" style={tw`mr-2`} />
          <Text style={tw`text-red-600 font-bold text-sm`}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};
