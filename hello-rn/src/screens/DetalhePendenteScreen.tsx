// src/screens/DetalhePendenteScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, MapPin, Navigation as NavigationIcon, CheckCircle } from 'lucide-react-native';
import tw from 'twrnc';
import api from '../services/api';
import { RootStackParamList, AppNavigationProp } from '../types/navigation';

type DetalhePendenteRouteProp = RouteProp<RootStackParamList, 'DetalhePendente'>;

// --- TIPAGEM DOS DADOS DA API ---
interface OcorrenciaDetalhada {
  id_ocorrencia: string;
  nr_aviso: string | null;
  status_situacao: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  hora_acionamento: string;
  subgrupo: {
    descricao_subgrupo: string;
    grupo?: {
      natureza?: {
        descricao: string;
      }
    }
  };
  bairro: {
    nome_bairro: string;
    municipio?: {
      nome_municipio: string;
    }
  };
  forma_acervo: {
    descricao: string;
  };
  localizacao?: {
    logradouro: string;
    referencia_logradouro: string;
  };
}

export const DetalhePendenteScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<DetalhePendenteRouteProp>();
  const insets = useSafeAreaInsets();

  const { id } = route.params;

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // --- BUSCAR DADOS (GET) ---
  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v2/ocorrencias/${id}`);
      setOcorrencia(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da ocorrência.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

  // --- ATUALIZAR STATUS (PUT) ---
  const handleStatusUpdate = async (novoStatus: 'EM_ANDAMENTO' | 'CONCLUIDO') => {
    if (!ocorrencia) return;
    setUpdating(true);
    try {
      // Atualiza o status no backend
      await api.put(`/api/v2/ocorrencias/${ocorrencia.id_ocorrencia}`, {
        status_situacao: novoStatus,
      });

      // Atualiza localmente para refletir na UI imediatamente
      setOcorrencia((prev) => prev ? { ...prev, status_situacao: novoStatus } : null);

      if (novoStatus === 'EM_ANDAMENTO') {
        Alert.alert('Sucesso', 'Deslocamento iniciado!');
      } else if (novoStatus === 'CONCLUIDO') {
        Alert.alert('Sucesso', 'Chegada registrada e ocorrência concluída (simulação)!');
        navigation.replace('DetalheAndamento', { id: ocorrencia.id_ocorrencia });
      }

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Falha ao atualizar o status. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBotaoPrincipal = () => {
    if (!ocorrencia) return;

    if (ocorrencia.status_situacao === 'PENDENTE') {
      // Ação: Iniciar Deslocamento -> Muda para EM_ANDAMENTO
      handleStatusUpdate('EM_ANDAMENTO');
    } else if (ocorrencia.status_situacao === 'EM_ANDAMENTO') {
      // Ação: Registrar Chegada
      Alert.alert(
        "Registrar Chegada",
        "Deseja confirmar a chegada ao local?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Confirmar", onPress: () => console.log("Chegada registrada (Lógica a implementar)") }
        ]
      );
    }
  };

  const handleNavegarMapa = () => {
    // Integração com Maps/Waze virá aqui
    Alert.alert('Mapa', `Abrindo rota para ${ocorrencia?.bairro.nome_bairro}...`);
  };

  // Formatação de hora
  const formatarHora = (dataIso: string) => {
    if (!dataIso) return '--:--';
    return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // --- RENDERIZAÇÃO DE LOADING ---
  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#061C43" />
        <Text style={tw`mt-4 text-slate-500`}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!ocorrencia) return null;

  // --- COMPONENTES INTERNOS ---
  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={tw`w-[48%] mb-4`}>
      <Text style={tw`text-xs text-gray-400 mb-0.5`}>{label}</Text>
      <Text style={tw`text-base font-bold text-slate-800`}>{value}</Text>
    </View>
  );

  // Define cores e textos baseados no status REAL da API
  const isPendente = ocorrencia.status_situacao === 'PENDENTE';
  const isEmDeslocamento = ocorrencia.status_situacao === 'EM_ANDAMENTO';

  const headerColor = isPendente ? '#FECACA' : '#FFEDD5'; // Vermelho ou Laranja claro
  const pillColor = isPendente ? '#DC2626' : '#EA580C'; // Vermelho ou Laranja escuro
  const statusText = isPendente ? 'PENDENTE • AGUARDANDO EQUIPE' : 'EM DESLOCAMENTO';
  const buttonText = isPendente ? 'INICIAR DESLOCAMENTO' : 'REGISTRAR CHEGADA';

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      
      {/* --- HEADER --- */}
      <View 
        style={[
          tw`pb-6 rounded-b-3xl shadow-sm`,
          { backgroundColor: headerColor, paddingTop: insets.top }
        ]}
      >
        {/* Top Bar */}
        <View style={tw`flex-row items-center justify-between px-6 py-3`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1`}>
            <ArrowLeft color="#1F2937" size={28} />
          </TouchableOpacity>
          
          <Text style={tw`text-lg font-extrabold text-slate-900 tracking-wider`}>
            {ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}
          </Text>
          
          <View style={{ width: 28 }} /> 
        </View>

        {/* Status Pill */}
        <View style={tw`items-center mt-1`}>
            <View style={[
                tw`px-5 py-2 rounded-full flex-row items-center shadow-sm`,
                { backgroundColor: pillColor }
            ]}>
                <View style={tw`w-2 h-2 rounded-full bg-white mr-2`} />
                <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>
                    {statusText}
                </Text>
            </View>
        </View>
      </View>

      <ScrollView style={tw`flex-1 -mt-4`} contentContainerStyle={tw`px-5 pb-32`}>
        
        {/* --- CARD DETALHES --- */}
        <View style={tw`bg-white rounded-2xl p-6 shadow-md mb-4 border border-gray-100`}>
          <Text style={tw`text-2xl font-black text-slate-900 mb-1`}>
            {ocorrencia.subgrupo.descricao_subgrupo}
          </Text>
          <Text style={tw`text-base font-semibold text-slate-600 mb-3`}>
            {ocorrencia.bairro.nome_bairro} - {ocorrencia.bairro.municipio?.nome_municipio || 'PE'}
          </Text>
          
          <View style={tw`h-px bg-gray-100 my-3`} />
          
          {/* Descrição genérica se não houver detalhes específicos */}
          <Text style={tw`text-sm text-slate-500 italic leading-relaxed mb-6`}>
             "Ocorrência registrada via {ocorrencia.forma_acervo.descricao.toLowerCase()}. 
             Verificar situação no local."
          </Text>

          <View style={tw`flex-row flex-wrap justify-between`}>
            <InfoItem 
                label="Natureza" 
                value={ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'} 
            />
            <InfoItem label="Prioridade" value="Média" /> 
            <InfoItem label="Horário" value={formatarHora(ocorrencia.hora_acionamento)} />
            <InfoItem label="Forma" value={ocorrencia.forma_acervo.descricao} />
          </View>
        </View>

        {/* --- CARD LOCALIZAÇÃO --- */}
        <View style={tw`bg-white rounded-2xl p-5 shadow-md border border-gray-100`}>
            <View style={tw`flex-row items-start mb-4`}>
                <View style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}>
                    <MapPin color="#EF4444" size={20} />
                </View>
                <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-bold text-slate-900`}>
                        {ocorrencia.localizacao?.logradouro || 'Endereço não informado'}
                    </Text>
                    <Text style={tw`text-sm text-slate-500`}>
                         {ocorrencia.bairro.nome_bairro}
                    </Text>
                    <Text style={tw`text-xs text-slate-400 mt-1`}>
                        {ocorrencia.localizacao?.referencia_logradouro || 'Sem ponto de referência'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={tw`bg-blue-50 py-3 rounded-xl border border-blue-100 flex-row items-center justify-center`}
                onPress={handleNavegarMapa}
            >
                <MapPin size={18} color="#3B82F6" style={tw`mr-2`} />
                <Text style={tw`text-blue-500 font-bold text-sm`}>Ir para o mapa</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- FOOTER (Botão Fixo) --- */}
      <View style={[tw`absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-gray-100`, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity 
            style={[
                tw`py-4 rounded-xl shadow-lg flex-row items-center justify-center`,
                updating ? tw`bg-gray-400` : tw`bg-[#061C43]`
            ]}
            onPress={handleBotaoPrincipal}
            activeOpacity={0.9}
            disabled={updating}
        >
            {updating ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    {isPendente ? (
                        <NavigationIcon size={20} color="white" style={tw`mr-2`} />
                    ) : (
                        <CheckCircle size={20} color="white" style={tw`mr-2`} />
                    )}
                    
                    <Text style={tw`text-white font-bold text-base tracking-wider uppercase`}>
                        {buttonText}
                    </Text>
                </>
            )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default DetalhePendenteScreen;