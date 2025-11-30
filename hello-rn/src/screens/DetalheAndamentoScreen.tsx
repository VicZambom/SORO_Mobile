import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, FileText, Image as ImageIcon, Users, MoreVertical, Edit2 } from 'lucide-react-native';
import tw from 'twrnc';

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';

// --- TIPAGEM ---
interface OcorrenciaFull {
  id_ocorrencia: string;
  nr_aviso: string | null;
  status_situacao: string;
  data_acionamento: string;
  hora_acionamento: string;
  subgrupo: {
    descricao_subgrupo: string;
    grupo: {
      natureza: { descricao: string };
    };
  };
  bairro: {
    nome_bairro: string;
    municipio: { nome_municipio: string };
  };
  forma_acervo: { descricao: string };
  localizacao?: {
    logradouro: string;
    referencia_logradouro: string;
  };
  // Arrays relacionais 
  midias: Array<{
    id_midia: string;
    url_caminho: string;
    tipo_arquivo: string;
  }>;
  vitimas: Array<{
    id_vitima: string;
    nome_vitima: string;
    idade: number;
    classificacao_vitima: string;
    destino_vitima: string;
  }>;
  viaturas_usadas: Array<{
    horario_chegada_local: string | null;
    viatura: { numero_viatura: string };
  }>;
}

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

// --- COMPONENTES DAS ABAS ---

// GERAL
const GeralTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
  const steps = [
    { label: 'Ocorrência Gerada', time: ocorrencia.hora_acionamento, active: true },
    { label: 'Deslocamento Iniciado', time: null, active: true }, // Timestamp não disponível no modelo atual, assumimos true se está em andamento
    { 
      label: 'Chegada ao Local', 
      time: ocorrencia.viaturas_usadas[0]?.horario_chegada_local, 
      active: !!ocorrencia.viaturas_usadas[0]?.horario_chegada_local,
      sub: ocorrencia.viaturas_usadas[0] ? `Viatura ${ocorrencia.viaturas_usadas[0].viatura.numero_viatura}` : null
    },
  ];

  const formatTime = (iso: string | null) => 
    iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 p-5`}>
      {/* Card Informações */}
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100`}>
        <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Informações</Text>
        
        <View style={tw`flex-row flex-wrap`}>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Natureza</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>
              {ocorrencia.subgrupo.grupo.natureza.descricao}
            </Text>
          </View>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Subgrupo</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>
              {ocorrencia.subgrupo.descricao_subgrupo}
            </Text>
          </View>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Forma</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>
              {ocorrencia.forma_acervo.descricao}
            </Text>
          </View>
           <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Nº do Aviso</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>
              {ocorrencia.nr_aviso || 'S/N'}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Linha do Tempo */}
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-20 border border-gray-100`}>
        <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Linha do Tempo</Text>
        
        {steps.map((step, i) => (
          <View key={i} style={tw`flex-row mb-6`}>
             {/* Linha Vertical */}
             {i !== steps.length - 1 && (
               <View style={tw`absolute left-[9px] top-4 bottom-[-24px] w-[2px] bg-gray-200`} />
             )}
             
             <View style={[
               tw`w-5 h-5 rounded-full items-center justify-center z-10`,
               step.active ? tw`bg-orange-500` : tw`bg-gray-300`
             ]} />
             
             <View style={tw`ml-4 flex-1`}>
               <View style={tw`flex-row justify-between`}>
                 <Text style={tw`text-sm font-bold text-slate-800`}>{step.label}</Text>
                 <Text style={tw`text-xs text-slate-500`}>{formatTime(step.time)}</Text>
               </View>
               {step.sub && <Text style={tw`text-xs text-slate-400 mt-1`}>{step.sub}</Text>}
             </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// 2. ABA MÍDIA
const MidiaTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
  return (
    <ScrollView style={tw`flex-1 bg-gray-50 p-5`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-lg font-bold text-slate-900`}>
          Evidências ({ocorrencia.midias.length} itens)
        </Text>
        <TouchableOpacity>
          <Text style={tw`text-blue-600 font-bold`}>Selecionar</Text>
        </TouchableOpacity>
      </View>

      {/* Grid de Mídias */}
      <View style={tw`flex-row flex-wrap justify-between`}>
        
        {/* Botão Adicionar */}
        <TouchableOpacity style={tw`w-[31%] aspect-square bg-white border border-slate-300 rounded-xl items-center justify-center mb-3 border-dashed`}>
          <ImageIcon size={28} color="#334155" />
          <Text style={tw`text-xs font-bold text-slate-600 mt-2`}>Adicionar</Text>
        </TouchableOpacity>

        {/* Lista Real */}
        {ocorrencia.midias.map((midia) => (
          <TouchableOpacity key={midia.id_midia} style={tw`w-[31%] aspect-square bg-slate-200 rounded-xl mb-3 overflow-hidden relative`}>
            <Image 
              source={{ uri: midia.url_caminho }} 
              style={tw`w-full h-full`} 
              resizeMode="cover"
            />
            {midia.tipo_arquivo.includes('video') && (
               <View style={tw`absolute inset-0 items-center justify-center bg-black/30`}>
                  <View style={tw`w-8 h-8 bg-white/80 rounded-full items-center justify-center`}>
                    <View style={tw`w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-slate-900 border-b-[6px] border-b-transparent ml-1`} />
                  </View>
               </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// 3. ABA VÍTIMAS
const VitimasTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
  const navigation = useNavigation<AppNavigationProp>();

  const getBadgeColor = (classificacao: string) => {
    switch(classificacao) {
      case 'VERMELHO': case 'GRAVE': return 'bg-red-100 text-red-700';
      case 'AMARELO': case 'MODERADO': return 'bg-yellow-100 text-yellow-700';
      case 'VERDE': case 'LEVE': return 'bg-green-100 text-green-700';
      case 'PRETO': case 'OBITO': return 'bg-gray-200 text-gray-800';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 p-5`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-lg font-bold text-slate-900`}>
          Vítimas Registradas ({ocorrencia.vitimas.length})
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegistrarVitima', { ocorrenciaId: ocorrencia.id_ocorrencia })}>
            <Text style={tw`text-blue-600 font-bold`}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {ocorrencia.vitimas.length === 0 ? (
        <View style={tw`py-10 items-center`}>
          <Users size={40} color="#cbd5e1" />
          <Text style={tw`text-slate-400 mt-2`}>Nenhuma vítima registrada.</Text>
        </View>
      ) : (
        ocorrencia.vitimas.map((vitima) => (
          <View key={vitima.id_vitima} style={tw`bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm flex-row relative`}>
            <View style={tw`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${getBadgeColor(vitima.classificacao_vitima).split(' ')[0].replace('bg-', 'bg-')}`} />
            
            <View style={tw`flex-1 ml-2`}>
              <View style={tw`flex-row justify-between items-start`}>
                <View>
                  <Text style={tw`text-base font-bold text-slate-900`}>{vitima.nome_vitima}</Text>
                  <Text style={tw`text-xs text-slate-500`}>
                    {vitima.idade ? `${vitima.idade} anos` : 'Idade não informada'}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Edit2 size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={tw`flex-row mt-3 items-center`}>
                <View style={tw`px-2 py-1 rounded-md ${getBadgeColor(vitima.classificacao_vitima).split(' ')[0]}`}>
                  <Text style={tw`text-[10px] font-bold uppercase ${getBadgeColor(vitima.classificacao_vitima).split(' ')[1]}`}>
                    {vitima.classificacao_vitima}
                  </Text>
                </View>
              </View>

              <View style={tw`mt-3 border-t border-gray-50 pt-2`}>
                <Text style={tw`text-[10px] text-slate-400 uppercase`}>Destino</Text>
                <Text style={tw`text-sm font-medium text-slate-700`}>
                  {vitima.destino_vitima || 'No local'}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- TELA PRINCIPAL ---

export const DetalheAndamentoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DetalheAndamento'>>();
  const { id } = route.params;

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaFull | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v2/ocorrencias/${id}`);
      setOcorrencia(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar detalhes.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetalhes();
    }, [id])
  );

  const handleFinalizar = () => {
      Alert.alert(
          "Finalizar Ocorrência",
          "Tem certeza que deseja encerrar este atendimento?",
          [
              { text: "Cancelar", style: "cancel" },
              { text: "Confirmar", style: 'destructive', onPress: () => console.log("Finalizar...") }
          ]
      );
  }

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#F97316" /> 
      </View>
    );
  }

  if (!ocorrencia) return null;

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFF7ED]`}> 
       {/* Header Fixo */}
      <View style={tw`bg-[#FFF7ED] px-5 pb-4 pt-2`}>
        {/* Top Bar */}
        <View style={tw`flex-row items-center justify-between mb-6`}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1`}>
             <ArrowLeft size={24} color="#1F2937" />
           </TouchableOpacity>
           <Text style={tw`text-lg font-bold text-slate-900`}>
             {ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}
           </Text>
           <View style={{width: 24}} />
        </View>

        {/* Banner Status */}
        <View style={tw`bg-orange-500 rounded-lg py-1.5 px-4 flex-row items-center justify-center mb-5 self-center w-full`}>
            <Clock size={14} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-bold text-xs uppercase`}>
                EM ANDAMENTO • {new Date(ocorrencia.hora_acionamento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
        </View>

        {/* Card Localização + Mapa */}
        <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-1 mr-4`}>
                <Text style={tw`text-xl font-bold text-slate-900 mb-1 leading-6`}>
                    {ocorrencia.localizacao?.logradouro || 'Logradouro não informado'}
                </Text>
                <Text style={tw`text-sm text-slate-600`}>
                    {ocorrencia.bairro.nome_bairro}, {ocorrencia.bairro.municipio.nome_municipio}
                </Text>
            </View>

            {/* Mini Mapa Fake */}
            <View style={tw`w-20 h-20 bg-blue-100 rounded-xl border-2 border-orange-200 items-center justify-center overflow-hidden`}>
                 <View style={tw`absolute w-full h-[1px] bg-blue-200 top-10`} />
                 <View style={tw`absolute h-full w-[1px] bg-blue-200 left-10`} />
                 <MapPin size={24} color="#1e293b" fill="#1e293b" />
            </View>
        </View>
      </View>

      {/* Navegação de Abas */}
      <View style={tw`flex-1 bg-white rounded-t-3xl overflow-hidden shadow-lg`}>
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
                tabBarStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
                tabBarIndicatorStyle: { backgroundColor: '#0F172A', height: 3, borderRadius: 3 },
                tabBarActiveTintColor: '#0F172A',
                tabBarInactiveTintColor: '#94a3b8',
            }}
        >
            <Tab.Screen name="Geral">
                {() => <GeralTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
            <Tab.Screen name="Mídia" options={{ title: `Mídia (${ocorrencia.midias.length})` }}>
                {() => <MidiaTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
            <Tab.Screen name="Vítimas" options={{ title: `Vítimas (${ocorrencia.vitimas.length})` }}>
                {() => <VitimasTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
        </Tab.Navigator>
      </View>

      {/* Botão Flutuante de Finalização */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-gray-100`}>
          <TouchableOpacity 
            style={tw`bg-[#10B981] py-4 rounded-xl items-center shadow-lg`}
            activeOpacity={0.9}
            onPress={handleFinalizar}
          >
              <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>
                  FINALIZAR OCORRÊNCIA
              </Text>
          </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};