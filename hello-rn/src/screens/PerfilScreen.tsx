// src/screens/PerfilScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import tw from 'twrnc';
import {
  ArrowLeft,
  User,
  Mail,
  BadgeInfo,
  Moon,
  Bell,
  CloudOff,
  ChevronRight,
  LogOut,
  IdCard,
  MapPin,
} from 'lucide-react-native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export const PerfilScreen = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  // Dados fixos conforme solicitado
  const usuario = {
    nome: 'CB Operador Silva',
    local: 'Cabo',
    matricula: '200003-C',
    email: 'op.silva.qcg@bombeiros.pe.gov.br',
  };

  const statusSincronizacao = {
    pendente: true,
    ocorrencias: 3,
  };

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [temaEscuroAtivo, setTemaEscuroAtivo] = useState(false);

  const handleSincronizar = () => {
    console.log('Sincronização forçada!');
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
          Perfil e Configurações
        </Text>
      </View>

      <ScrollView style={tw`px-2 pb-10`}>

        {/* CARD DE PERFIL */}
        <View style={tw`bg-white rounded-xl p-5 mb-5 border border-slate-200`}>
          <View style={tw`flex-row items-center mb-5`}>
            <View style={tw`w-16 h-16 rounded-full bg-blue-600 items-center justify-center mr-4`}>
              <Text style={tw`text-white text-xl font-bold`}>CO</Text>
            </View>

            <View>
              <Text style={tw`text-lg font-bold text-slate-900`}>{usuario.nome}</Text>
              <View style={tw`flex-row items-center`}>
                <MapPin size={16} color="#64748b" />
                <Text style={tw`text-slate-500 ml-1`}>{usuario.local}</Text>
              </View>
            </View>
          </View>

          {/* Matrícula */}
          <View style={tw`flex-row items-center py-2`}>
            <IdCard size={20} color="#64748b" />
            <View style={tw`ml-3`}>
              <Text style={tw`text-xs text-slate-500`}>Matrícula</Text>
              <Text style={tw`text-sm text-slate-900`}>{usuario.matricula}</Text>
            </View>
          </View>

          {/* Email */}
          <View style={tw`flex-row items-center py-2`}>
            <Mail size={20} color="#64748b" />
            <View style={tw`ml-3`}>
              <Text style={tw`text-xs text-slate-500`}>Email</Text>
              <Text style={tw`text-sm text-slate-900`}>{usuario.email}</Text>
            </View>
          </View>
        </View>

        {/* STATUS DO SISTEMA */}
        <Text style={tw`text-xs font-bold text-slate-500 mb-2 px-1`}>
          STATUS DO SISTEMA
        </Text>

        <View style={tw`bg-white rounded-xl border border-slate-200 mb-6`}>
          <View style={tw`flex-row items-center p-4`}>
            <CloudOff size={30} color="#061C43" />
            <View style={tw`ml-4`}>
              <Text style={tw`text-lg font-bold text-slate-900`}>
                Sincronização Pendente
              </Text>
              <Text style={tw`text-slate-500`}>
                {statusSincronizacao.ocorrencias} ocorrências aguardando envio.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={tw`bg-blue-600 py-4 items-center rounded-b-xl`}
            onPress={handleSincronizar}
          >
            <Text style={tw`text-white font-bold`}>FORÇAR SINCRONIZAÇÃO</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERÊNCIAS */}
        <Text style={tw`text-xs font-bold text-slate-500 mb-2 px-1`}>
          PREFERÊNCIAS
        </Text>

        <View style={tw`bg-white rounded-xl border border-slate-200`}>
          {/* Notificações */}
          <View style={tw`flex-row justify-between items-center px-4 py-4 border-b border-slate-200`}>
            <View style={tw`flex-row items-center`}>
              <Bell size={22} color="#334155" />
              <Text style={tw`text-base text-slate-900 ml-3`}>Notificações</Text>
            </View>
            <Switch value={notificacoesAtivas} onValueChange={setNotificacoesAtivas} />
          </View>

          {/* Tema Escuro */}
          <View style={tw`flex-row justify-between items-center px-4 py-4 border-b border-slate-200`}>
            <View style={tw`flex-row items-center`}>
              <Moon size={22} color="#334155" />
              <Text style={tw`text-base text-slate-900 ml-3`}>Tema Escuro</Text>
            </View>
            <Switch value={temaEscuroAtivo} onValueChange={setTemaEscuroAtivo} />
          </View>

          {/* Sobre */}
          <TouchableOpacity style={tw`flex-row justify-between items-center px-4 py-4`}>
            <View style={tw`flex-row items-center`}>
              <BadgeInfo size={22} color="#334155" />
              <Text style={tw`text-base text-slate-900 ml-3`}>Sobre o S.O.R.O.</Text>
            </View>
            <ChevronRight size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* INFO DO SISTEMA */}
        <View style={tw`mt-6 mb-6 items-center px-4`}>
          <Text style={tw`text-xs text-slate-500 text-center`}>
            S.O.R.O. - Sistema Operacional para Registro de Ocorrências
          </Text>
        </View>

        {/* BOTÃO DE SAIR */}
        <TouchableOpacity
          onPress={signOut}
          style={tw`flex-row bg-red-50 px-6 py-4 rounded-xl 
          items-center border border-red-200 justify-center mb-10`}
        >
          <LogOut size={20} color="#ef4444" style={tw`mr-2`} />
          <Text style={tw`text-red-600 font-bold`}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};
