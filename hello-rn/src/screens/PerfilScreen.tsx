// src/screens/PerfilScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import tw from 'twrnc';
import { ArrowLeft, User as UserIcon, Mail, BadgeInfo, Moon, Bell, CloudOff, Cloud, 
  ChevronRight, LogOut, IdCard, MapPin } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AppNavigationProp } from '../types/navigation';
import { useSync } from '../context/SyncContext';
import { useTheme } from '../context/ThemeContext';

export const PerfilScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user, signOut } = useAuth();
  const { pendingQueue, syncNow, isOnline } = useSync();

  // Dados de estado da UI
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const { colors, isDark, toggle } = useTheme();

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

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={tw`flex-row items-center mb-6 mt-2 px-2`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>
          Perfil
        </Text>
      </View>

      <ScrollView style={tw`px-2 pb-10`} showsVerticalScrollIndicator={false}>

        {/* CARD DE PERFIL */}
        <View style={[tw`rounded-xl p-5 mb-5 shadow-sm`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }] }>
          <View style={tw`flex-row items-center mb-5`}>
            {/* Iniciais do Nome */}
            <View style={tw`w-16 h-16 rounded-full bg-blue-600 items-center justify-center mr-4`}>
              <Text style={tw`text-white text-xl font-bold`}>
                {user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'BM'}
              </Text>
            </View>

            <View style={tw`flex-1`}>
              {/* Nome do Usuário */}
              <Text style={[tw`text-lg font-bold`, { color: colors.text }]} numberOfLines={1}>
                {user?.nome || 'Usuário'}
              </Text>
              
              <View style={tw`flex-row items-center mt-1`}>
                <MapPin size={14} color={colors.textLight} />
                <Text style={[tw`ml-1 text-xs`, { color: colors.textLight }]}>
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
          <View style={[tw`flex-row items-center py-3`, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <IdCard size={20} color={colors.textLight} />
            <View style={tw`ml-3`}>
              <Text style={[tw`text-xs font-medium`, { color: colors.textLight }]}>Matrícula</Text>
              <Text style={[tw`text-sm font-semibold`, { color: colors.text }]}>
                {user?.matricula || '---'}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View style={[tw`flex-row items-center py-3`, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Mail size={20} color={colors.textLight} />
            <View style={tw`ml-3 flex-1`}>
              <Text style={[tw`text-xs font-medium`, { color: colors.textLight }]}>Email Institucional</Text>
              <Text style={[tw`text-sm font-semibold`, { color: colors.text }]} numberOfLines={1}>
                {user?.email || '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* STATUS DO SISTEMA */}
        <Text style={[tw`text-xs font-bold mb-2 px-1 mt-2 uppercase`, { color: colors.textLight }]}>
          Sincronização e Rede
        </Text>

        <View style={[tw`rounded-xl mb-6 overflow-hidden`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <View style={tw`flex-row items-center p-4`}>
            {isOnline ? (
              <Cloud size={28} color={colors.success} /> // Verde se online
            ) : (
              <CloudOff size={28} color={colors.danger} /> // Vermelho se offline
            )}
            
            <View style={tw`ml-4 flex-1`}>
              <Text style={[tw`text-base font-bold`, { color: colors.text }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <Text style={[tw`text-xs`, { color: colors.textLight }]}>
                {pendingQueue.length > 0 
                  ? `Você tem ${pendingQueue.length} registro(s) aguardando envio.`
                  : 'Todos os dados estão sincronizados.'}
              </Text>
            </View>
          </View>

          {/* Botão só aparece se houver pendências */}
          {pendingQueue.length > 0 && (
            <TouchableOpacity
              style={[tw`py-3 items-center`, { backgroundColor: colors.primary }]}
              onPress={syncNow} 
            >
              <Text style={tw`text-white font-bold text-sm tracking-wide`}>
                {isOnline ? 'SINCRONIZAR AGORA' : 'AGUARDANDO CONEXÃO...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PREFERÊNCIAS */}
        <Text style={[tw`text-xs font-bold mb-2 px-1 uppercase`, { color: colors.textLight }]}>
          App
        </Text>
        <View style={[tw`rounded-xl mb-6`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }] }>
          <View style={[tw`flex-row justify-between items-center px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={tw`flex-row items-center`}>
              <Bell size={20} color={colors.text} />
              <Text style={[tw`text-sm ml-3 font-medium`, { color: colors.text }]}>Notificações</Text>
            </View>
            <Switch 
              value={notificacoesAtivas} 
              onValueChange={setNotificacoesAtivas}
              trackColor={{ false: "#e2e8f0", true: "#0f172a" }} 
            />
          </View>

          <View style={[tw`flex-row justify-between items-center px-4 py-3`, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={tw`flex-row items-center`}>
              <Moon size={20} color={colors.text} />
              <Text style={[tw`text-sm ml-3 font-medium`, { color: colors.text }]}>Modo Escuro</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <TouchableOpacity 
             style={tw`flex-row justify-between items-center px-4 py-4`}
             onPress={() => navigation.navigate('Sobre')}
          >
            <View style={tw`flex-row items-center`}>
              <BadgeInfo size={20} color={colors.text} />
              <Text style={[tw`text-sm ml-3 font-medium`, { color: colors.text }]}>Sobre o S.O.R.O.</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* BOTÃO DE SAIR */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[tw`flex-row px-4 py-3 rounded-xl items-center justify-center mb-8`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
        >
          <LogOut size={18} color={colors.danger} style={tw`mr-2`} />
          <Text style={[tw`text-sm`, { color: colors.textLight, fontWeight: '600' }]}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};
