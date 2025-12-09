// src/screens/DetalhePendenteScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, MapPin, Navigation as NavigationIcon, CheckCircle } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import tw from 'twrnc';
import api from '../services/api';
import { RootStackParamList, AppNavigationProp } from '../types/navigation';
import { useUpdateStatusOcorrencia } from '../hooks/useOcorrenciaMutations';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

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
    latitude?: number; 
    longitude?: number; 
  };
}

export const DetalhePendenteScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<DetalhePendenteRouteProp>();
  const insets = useSafeAreaInsets();

  const { id } = route.params;

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const updateMutation = useUpdateStatusOcorrencia();
  const isUpdating = updateMutation.isPending;

  // --- BUSCAR DADOS (GET) ---
  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
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
  const handleStatusUpdate = (novoStatus: 'EM_ANDAMENTO') => {
    if (!ocorrencia) return;

    // Confirmação antes de iniciar
    Alert.alert(
      "Iniciar Ocorrência",
      "Confirmar deslocamento e início do atendimento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            updateMutation.mutate({
                id: ocorrencia.id_ocorrencia,
                status_situacao: novoStatus,
                nr_aviso: ocorrencia.nr_aviso
            }, {
                onSuccess: () => {
                    Alert.alert('Sucesso', 'Ocorrência iniciada!');
                    navigation.replace('DetalheAndamento', { id: ocorrencia.id_ocorrencia });
                }
            });
          }
        }
      ]
    );
  };

  const handleBotaoPrincipal = () => {
    if (!ocorrencia) return;
    if (ocorrencia.status_situacao === 'PENDENTE') {
      handleStatusUpdate('EM_ANDAMENTO');
    }
  };

  const handleNavegarMapa = () => {
    if (!ocorrencia) return;

    const { localizacao, bairro } = ocorrencia;
    const lat = localizacao?.latitude;
    const lng = localizacao?.longitude;
    
    // Monta um endereço aproximado caso não tenha GPS exato
    const enderecoCompleto = `${localizacao?.logradouro || ''}, ${bairro.nome_bairro}, ${bairro.municipio?.nome_municipio || ''}`;
    const label = "Local da Ocorrência";

    let url = '';

    if (lat && lng) {
      const latLng = `${lat},${lng}`;
      if (Platform.OS === 'ios') {
        url = `maps:0,0?q=${label}@${latLng}`;
      } else {
        url = `geo:${latLng}?q=${latLng}(${label})`;
      }
    } else {
      const query = encodeURIComponent(enderecoCompleto);
      if (Platform.OS === 'ios') {
        url = `maps:0,0?q=${query}`;
      } else {
        url = `geo:0,0?q=${query}`;
      }
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Se não tiver o aplicativo, abre no navegador
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat && lng ? `${lat},${lng}` : encodeURIComponent(enderecoCompleto)}`;
        Linking.openURL(browserUrl);
      }
    }).catch(err => console.error('Erro ao abrir mapa:', err));
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

  const headerColor = isPendente ? '#FECACA' : '#FFEDD5'; // Vermelho ou Laranja claro
  const pillColor = isPendente ? '#DC2626' : '#EA580C'; // Vermelho ou Laranja escuro
  const statusText = isPendente ? 'PENDENTE • AGUARDANDO EQUIPE' : 'EM DESLOCAMENTO';
  const buttonText = isPendente ? 'INICIAR OCORRÊNCIA' : 'IR PARA DETALHES';

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
        <View style={tw`bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-6`}>
          {/* Header do Card */}
          <View style={tw`p-4 border-b border-gray-100 flex-row items-center`}>
              <MapPin size={20} color={COLORS.primary} style={tw`mr-2`} />
              <Text style={tw`font-bold text-[${COLORS.text}] text-base`}>Localização</Text>
          </View>

          {/* MAPA REAL ou PLACEHOLDER */}
          {ocorrencia.localizacao?.latitude && ocorrencia.localizacao?.longitude ? (
            <View style={tw`h-48 w-full relative`}>
              <MapView
                style={tw`flex-1`}
                provider={PROVIDER_DEFAULT} // Usa Apple Maps no iOS e Google no Android
                initialRegion={{
                  latitude: ocorrencia.localizacao.latitude,
                  longitude: ocorrencia.localizacao.longitude,
                  latitudeDelta: 0.005, // Zoom level (quanto menor, mais zoom)
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false} // Deixa estático para não atrapalhar o scroll da tela
                zoomEnabled={false}
                onPress={handleNavegarMapa} // Clicar no mapa abre o GPS externo
              >
                <Marker 
                  coordinate={{
                    latitude: ocorrencia.localizacao.latitude,
                    longitude: ocorrencia.localizacao.longitude,
                  }}
                  title="Local da Ocorrência"
                >
                  {/* Custom Marker (Opcional) */}
                  <View style={tw`items-center`}>
                     <MapPin size={40} color={COLORS.danger} fill={COLORS.danger} />
                  </View>
                </Marker>
              </MapView>
              
              {/* Botão flutuante sobre o mapa */}
              <TouchableOpacity 
                  style={tw`absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200`}
                  onPress={handleNavegarMapa}
              >
                  <Text style={tw`text-xs font-bold text-[${COLORS.primary}]`}>Navegar (GPS)</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Fallback se não tiver coordenadas (mantém o visual antigo) */
            <TouchableOpacity 
                style={tw`h-40 bg-slate-100 relative items-center justify-center`}
                onPress={handleNavegarMapa}
                activeOpacity={0.9}
            >
                <View style={tw`items-center opacity-50`}>
                    <MapPin size={40} color={COLORS.textLight} />
                    <Text style={tw`text-xs font-bold text-slate-400 mt-2`}>Sem coordenadas de GPS</Text>
                </View>
            </TouchableOpacity>
          )}

          {/* Endereço em Texto (Mantido igual) */}
          <View style={tw`p-4 bg-white`}>
              <Text style={tw`text-base font-bold text-[${COLORS.text}] mb-1`}>
                  {ocorrencia.localizacao?.logradouro || 'Logradouro não informado'}
              </Text>
              <Text style={tw`text-sm text-[${COLORS.textLight}]`}>
                      {ocorrencia.bairro.nome_bairro}, {ocorrencia.bairro.municipio?.nome_municipio}
              </Text>
              {ocorrencia.localizacao?.referencia_logradouro && (
                  <View style={tw`mt-3 bg-blue-50 p-2 rounded-lg`}>
                      <Text style={tw`text-xs text-blue-700`}>
                          <Text style={tw`font-bold`}>Ref: </Text>
                          {ocorrencia.localizacao.referencia_logradouro}
                      </Text>
                  </View>
              )}
          </View>
      </View>
      
      </ScrollView>

      {/* --- FOOTER (Botão Fixo) --- */}
      <View style={[tw`absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-gray-100`, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity 
            style={[
                tw`py-4 rounded-xl shadow-lg flex-row items-center justify-center`,
                isUpdating ? tw`bg-gray-400` : tw`bg-[#061C43]`
            ]}
            onPress={() => {
                if(isPendente) handleBotaoPrincipal();
                else navigation.replace('DetalheAndamento', { id: ocorrencia.id_ocorrencia });
            }}
            activeOpacity={0.9}
            disabled={isUpdating}
        >
            {isUpdating ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <NavigationIcon size={20} color="white" style={tw`mr-2`} />
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