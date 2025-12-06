// src/screens/DetalhePendenteScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, MapPin, Navigation as NavigationIcon } from 'lucide-react-native';
import tw from 'twrnc';
import api from '../services/api';
import { RootStackParamList, AppNavigationProp } from '../types/navigation';
import { useQueryClient } from '@tanstack/react-query';

type DetalhePendenteRouteProp = RouteProp<RootStackParamList, 'DetalhePendente'>;

// Tipagem 
interface OcorrenciaDetalhada {
  id_ocorrencia: string;
  nr_aviso: string | null;
  status_situacao: string;
  hora_acionamento: string;
  subgrupo: { descricao_subgrupo: string; grupo?: { natureza?: { descricao: string } } };
  bairro: { nome_bairro: string; municipio?: { nome_municipio: string } };
  forma_acervo: { descricao: string };
  localizacao?: { logradouro: string; referencia_logradouro: string; latitude?: number; longitude?: number; };
}

export const DetalhePendenteScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<DetalhePendenteRouteProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { id } = route.params;

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
      setOcorrencia(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetalhes(); }, [id]);

  const handleIniciarDeslocamento = async () => {
    if (!ocorrencia) return;
    setUpdating(true);
    try {
      // 1. Atualiza status para EM_ANDAMENTO e registra data_saida 
      await api.put(`/api/v3/ocorrencias/${ocorrencia.id_ocorrencia}`, {
        status_situacao: 'EM_ANDAMENTO',
        relacionado_eleicao: false, 
        nr_aviso: ocorrencia.nr_aviso,
        data_execucao_servico: null, 
      });

      // 2. Invalida cache para atualizar a lista "Minhas Ocorrências"
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });

      Alert.alert('Deslocamento Iniciado', 'Boa sorte na missão!', [
        { 
          text: 'Ir para Mapa e Detalhes', 
          onPress: () => {
            // 3. Substitui a tela atual pela tela de andamento
            navigation.replace('DetalheAndamento', { id: ocorrencia.id_ocorrencia });
          }
        }
      ]);

    } catch (error: any) {
       console.error(error);
       Alert.alert('Erro', 'Falha ao iniciar deslocamento.');
    } finally {
      setUpdating(false);
    }
  };

  const handleNavegarMapa = () => {
    if (!ocorrencia) return;
    const { localizacao, bairro } = ocorrencia;
    const query = encodeURIComponent(`${localizacao?.logradouro || ''}, ${bairro.nome_bairro}`);
    const url = Platform.OS === 'ios' ? `maps:0,0?q=${query}` : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(err => console.error(err));
  };

  if (loading) return <View style={tw`flex-1 justify-center items-center`}><ActivityIndicator size="large" color="#061C43" /></View>;
  if (!ocorrencia) return null;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={[tw`pb-6 bg-red-100 rounded-b-3xl shadow-sm`, { paddingTop: insets.top }]}>
        <View style={tw`flex-row items-center justify-between px-6 py-3`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1`}>
            <ArrowLeft color="#1F2937" size={28} />
          </TouchableOpacity>
          <Text style={tw`text-lg font-extrabold text-slate-900`}>{ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}</Text>
          <View style={{ width: 28 }} /> 
        </View>
        <View style={tw`items-center mt-1`}>
            <View style={tw`px-5 py-2 rounded-full bg-red-600 flex-row items-center shadow-sm`}>
                <Text style={tw`text-white font-bold text-xs uppercase`}>AGUARDANDO EQUIPE</Text>
            </View>
        </View>
      </View>

      <ScrollView style={tw`flex-1 -mt-4`} contentContainerStyle={tw`px-5 pb-32`}>
        <View style={tw`bg-white rounded-2xl p-6 shadow-md mb-4 border border-gray-100`}>
          <Text style={tw`text-2xl font-black text-slate-900 mb-1`}>{ocorrencia.subgrupo.descricao_subgrupo}</Text>
          <Text style={tw`text-base font-semibold text-slate-600 mb-3`}>{ocorrencia.bairro.nome_bairro}</Text>
          
          <View style={tw`flex-row flex-wrap justify-between mt-4`}>
            <View style={tw`w-[48%] mb-4`}>
                <Text style={tw`text-xs text-gray-400`}>Natureza</Text>
                <Text style={tw`text-base font-bold text-slate-800`}>{ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'}</Text>
            </View>
            <View style={tw`w-[48%] mb-4`}>
                <Text style={tw`text-xs text-gray-400`}>Horário</Text>
                <Text style={tw`text-base font-bold text-slate-800`}>{new Date(ocorrencia.hora_acionamento).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</Text>
            </View>
          </View>
        </View>

        <View style={tw`bg-white rounded-2xl p-5 shadow-md border border-gray-100`}>
            <View style={tw`flex-row items-start mb-4`}>
                <View style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}>
                    <MapPin color="#EF4444" size={20} />
                </View>
                <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-bold text-slate-900`}>{ocorrencia.localizacao?.logradouro || 'Endereço não informado'}</Text>
                    <Text style={tw`text-xs text-slate-400 mt-1`}>{ocorrencia.localizacao?.referencia_logradouro}</Text>
                </View>
            </View>
            <TouchableOpacity style={tw`bg-blue-50 py-3 rounded-xl border border-blue-100 items-center`} onPress={handleNavegarMapa}>
                <Text style={tw`text-blue-500 font-bold text-sm`}>Ver no Mapa</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Botão Fixo: Iniciar Deslocamento */}
      <View style={[tw`absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-gray-100`, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity 
            style={[tw`py-4 rounded-xl shadow-lg flex-row items-center justify-center`, updating ? tw`bg-gray-400` : tw`bg-[#061C43]`]}
            onPress={handleIniciarDeslocamento}
            disabled={updating}
        >
            {updating ? <ActivityIndicator color="white" /> : (
                <>
                    <NavigationIcon size={20} color="white" style={tw`mr-2`} />
                    <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>INICIAR DESLOCAMENTO</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
};