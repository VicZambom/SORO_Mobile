// src/screens/DetalheAndamentoScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Camera, Edit2, MoreVertical, User, CheckCircle2 } from 'lucide-react-native';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';
import { ActionModal } from '../components/ActionModal';

// --- TIPAGEM ---
interface OcorrenciaFull {
  id_ocorrencia: string;
  nr_aviso: string | null;
  status_situacao: string;
  hora_acionamento: string;
  subgrupo: { descricao_subgrupo: string; grupo?: { natureza?: { descricao: string }; }; };
  bairro: { nome_bairro: string; municipio?: { nome_municipio: string }; };
  forma_acervo: { descricao: string };
  localizacao?: { logradouro: string; referencia_logradouro: string; };
  midias: any[];
  vitimas: any[];
  viaturas_usadas: Array<{ horario_chegada_local: string | null; viatura: { numero_viatura: string }; }>;
}

const Tab = createMaterialTopTabNavigator();

// Aba Geral (Conteúdo)
const GeralTab = ({ ocorrencia, chegou }: { ocorrencia: OcorrenciaFull, chegou: boolean }) => {
  const formatTime = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const horaChegada = ocorrencia.viaturas_usadas[0]?.horario_chegada_local;

  return (
    <ScrollView style={tw`flex-1 bg-white p-5`}>
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100`}>
        <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Linha do Tempo</Text>
        
        {/* Passo 1: Acionamento */}
        <View style={tw`flex-row mb-6`}>
           <View style={tw`absolute left-[9px] top-4 bottom-[-24px] w-[2px] bg-gray-200`} />
           <View style={tw`w-5 h-5 rounded-full bg-green-500 z-10 items-center justify-center`}><View style={tw`w-2 h-2 bg-white rounded-full`} /></View>
           <View style={tw`ml-4 flex-1`}>
             <View style={tw`flex-row justify-between`}>
               <Text style={tw`text-sm font-bold text-slate-800`}>Acionamento</Text>
               <Text style={tw`text-xs text-slate-500`}>{formatTime(ocorrencia.hora_acionamento)}</Text>
             </View>
           </View>
        </View>

        {/* Passo 2: Deslocamento (Sempre ativo se está nesta tela) */}
        <View style={tw`flex-row mb-6`}>
           <View style={tw`absolute left-[9px] top-4 bottom-[-24px] w-[2px] bg-gray-200`} />
           <View style={tw`w-5 h-5 rounded-full bg-blue-500 z-10 items-center justify-center`}><View style={tw`w-2 h-2 bg-white rounded-full`} /></View>
           <View style={tw`ml-4 flex-1`}>
              <Text style={tw`text-sm font-bold text-slate-800`}>Deslocamento Iniciado</Text>
           </View>
        </View>

        {/* Passo 3: Chegada */}
        <View style={tw`flex-row`}>
           <View style={[tw`w-5 h-5 rounded-full z-10 items-center justify-center`, chegou ? tw`bg-orange-500` : tw`bg-gray-300`]} />
           <View style={tw`ml-4 flex-1`}>
             <View style={tw`flex-row justify-between`}>
               <Text style={[tw`text-sm font-bold`, chegou ? tw`text-slate-800` : tw`text-gray-400`]}>
                 {chegou ? 'Chegada ao Local' : 'Aguardando Chegada...'}
               </Text>
               {chegou && horaChegada && <Text style={tw`text-xs text-slate-500`}>{formatTime(horaChegada)}</Text>}
             </View>
           </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Aba Mídia e Vítimas (Simplificadas para focar no fluxo)
const MidiaTab = () => <View style={tw`flex-1 bg-white`}><Text style={tw`text-center mt-10 text-gray-400`}>Funcionalidade de Mídia</Text></View>;
const VitimasTab = () => <View style={tw`flex-1 bg-white`}><Text style={tw`text-center mt-10 text-gray-400`}>Funcionalidade de Vítimas</Text></View>;

export const DetalheAndamentoScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DetalheAndamento'>>();
  const { id } = route.params;
  const queryClient = useQueryClient();

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Estado local para controle imediato de chegada
  const [chegouLocal, setChegouLocal] = useState(false);

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
      const dados = response.data;
      setOcorrencia(dados);
      
      // Verifica se alguma viatura já tem data de chegada
      const jaChegou = dados.viaturas_usadas?.some((v: any) => v.horario_chegada_local !== null);
      if (jaChegou) setChegouLocal(true);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDetalhes(); }, [id]));

  // AÇÃO 1: REGISTRAR CHEGADA
  const handleRegistrarChegada = async () => {
    setUpdating(true);
    try {
      await api.put(`/api/v3/ocorrencias/${id}`, {
        status_situacao: 'EM_ANDAMENTO',
        nr_aviso: ocorrencia?.nr_aviso,
        relacionado_eleicao: false, 
        data_execucao_servico: null 
      });

      setChegouLocal(true);
      
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });

      Alert.alert('Sucesso', 'Chegada registrada! Agora você pode gerenciar a cena.');

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : 'Não foi possível registrar a chegada.';
      Alert.alert('Erro', 'Falha ao registrar chegada. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  // AÇÃO 2: FINALIZAR
  const handleFinalizar = async () => {
    Alert.alert("Finalizar", "Confirma o encerramento da ocorrência?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Finalizar", style: 'destructive', onPress: confirmFinalizar }
    ]);
  };

  const confirmFinalizar = async () => {
    setUpdating(true);
    try {
      await api.put(`/api/v3/ocorrencias/${id}`, {
        status_situacao: 'CONCLUIDO',
        data_execucao_servico: new Date().toISOString(),
        relacionado_eleicao: false,
        nr_aviso: ocorrencia?.nr_aviso
      });

      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
      
      Alert.alert('Finalizado', 'Ocorrência encerrada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao finalizar.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <View style={tw`flex-1 justify-center items-center`}><ActivityIndicator size="large" color="#F97316" /></View>;
  if (!ocorrencia) return null;

  return (
    <SafeAreaView style={tw`flex-1 bg-orange-50`} edges={['top']}>
      {/* HEADER */}
      <View style={tw`px-5 pb-4 pt-2`}>
        <View style={tw`flex-row items-center mb-4`}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1 -ml-2`}>
             <ArrowLeft size={26} color="#1F2937" />
           </TouchableOpacity>
           <Text style={tw`text-lg font-extrabold text-slate-900 ml-2`}>
             {ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}
           </Text>
        </View>

        <View style={tw`bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex-row items-center`}>
            <MapPin size={24} color="#F97316" />
            <View style={tw`ml-3 flex-1`}>
                <Text style={tw`text-base font-bold text-slate-900 leading-tight`}>
                    {ocorrencia.localizacao?.logradouro || 'Local não informado'}
                </Text>
                <Text style={tw`text-xs text-slate-500 mt-1`}>
                    {ocorrencia.bairro.nome_bairro}
                </Text>
            </View>
        </View>
      </View>

      {/* ABAS */}
      <View style={tw`flex-1 bg-white rounded-t-[30px] overflow-hidden shadow-lg`}>
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
                tabBarIndicatorStyle: { backgroundColor: '#F97316' },
                tabBarActiveTintColor: '#F97316',
            }}
        >
            <Tab.Screen name="Status">{() => <GeralTab ocorrencia={ocorrencia} chegou={chegouLocal} />}</Tab.Screen>
            <Tab.Screen name="Mídia" component={MidiaTab} />
            <Tab.Screen name="Vítimas" component={VitimasTab} />
        </Tab.Navigator>
      </View>

      {/* BARRA DE AÇÃO INFERIOR */}
      <View style={tw`absolute bottom-0 left-0 right-0 px-5 pb-6 bg-white border-t border-gray-100 pt-4`}>
          {!chegouLocal ? (
              // ESTADO 1: A caminho -> Mostrar Botão de Chegada
              <TouchableOpacity 
                style={[tw`py-4 rounded-xl items-center shadow-lg flex-row justify-center`, updating ? tw`bg-gray-400` : tw`bg-blue-600`]}
                onPress={handleRegistrarChegada}
                disabled={updating}
              >
                  {updating ? <ActivityIndicator color="white" /> : (
                      <>
                        <CheckCircle2 color="white" size={20} style={tw`mr-2`} />
                        <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>REGISTRAR CHEGADA</Text>
                      </>
                  )}
              </TouchableOpacity>
          ) : (
              // ESTADO 2: No local -> Mostrar Botão de Finalizar
              <TouchableOpacity 
                style={[tw`py-4 rounded-xl items-center shadow-lg`, updating ? tw`bg-gray-400` : tw`bg-[#10B981]`]}
                onPress={handleFinalizar}
                disabled={updating}
              >
                  {updating ? <ActivityIndicator color="white" /> : (
                      <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>FINALIZAR OCORRÊNCIA</Text>
                  )}
              </TouchableOpacity>
          )}
      </View>

    </SafeAreaView>
  );
};