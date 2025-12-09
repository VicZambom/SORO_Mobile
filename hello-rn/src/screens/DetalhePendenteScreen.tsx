import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, Navigation as NavigationIcon, Phone, AlertTriangle } from 'lucide-react-native';
import tw from 'twrnc';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'; // Mapa Real

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';
import { useUpdateStatusOcorrencia } from '../hooks/useOcorrenciaMutations';
import { StatusModal, StatusModalType } from '../components/StatusModal'; // Modal Bonito

type DetalhePendenteRouteProp = RouteProp<RootStackParamList, 'DetalhePendente'>;

// Tipagem completa dos dados
interface OcorrenciaData {
  id_ocorrencia: string;
  nr_aviso: string | null;
  status_situacao: string;
  data_acionamento: string;
  hora_acionamento: string;
  subgrupo: {
    descricao_subgrupo: string;
    grupo?: { 
      natureza?: { descricao: string }; 
    };
  };
  bairro: {
    nome_bairro: string;
    municipio?: { nome_municipio: string };
  };
  forma_acervo?: { descricao: string }; // Opcional para evitar crash
  localizacao?: {
    logradouro: string;
    referencia_logradouro?: string;
    latitude?: number;
    longitude?: number;
  };
  solicitante?: {
    nome_solicitante?: string;
    telefone_solicitante?: string;
  };
}

export const DetalhePendenteScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<DetalhePendenteRouteProp>();
  const insets = useSafeAreaInsets();
  
  // 1. Recebe o ID corretamente
  const { id } = route.params;

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateMutation = useUpdateStatusOcorrencia();
  const isUpdating = updateMutation.isPending;

  // Estado do Modal
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'INFO' as StatusModalType,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: undefined as string | undefined,
    onConfirm: () => {},
  });

  // 2. Busca os dados completos na API
  const fetchOcorrencia = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
      setOcorrencia(response.data);
    } catch (error) {
      console.error("Erro ao buscar ocorrência:", error);
      Alert.alert("Erro", "Não foi possível carregar a ocorrência.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOcorrencia();
    }, [id])
  );

  const showStatus = (type: StatusModalType, title: string, msg: string, onConfirm?: () => void, cancelText?: string, confirmText: string = 'OK') => {
    setStatusModal({
      visible: true,
      type,
      title,
      message: msg,
      confirmText,
      cancelText,
      onConfirm: onConfirm || (() => setStatusModal(prev => ({ ...prev, visible: false }))),
    });
  };

  const handleNavegarMapa = () => {
     if (ocorrencia?.localizacao?.latitude && ocorrencia?.localizacao?.longitude) {
         const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
         const latLng = `${ocorrencia.localizacao.latitude},${ocorrencia.localizacao.longitude}`;
         const label = 'Ocorrência';
         const url = Platform.select({
             ios: `${scheme}${label}@${latLng}`,
             android: `${scheme}${latLng}(${label})`
         });
         if(url) Linking.openURL(url);
     } else {
        showStatus('WARNING', 'Sem Coordenadas', 'Esta ocorrência não possui GPS registrado para navegação.');
     }
  };

  const handleBotaoPrincipal = () => {
    if (!ocorrencia) return;
    showStatus(
        'WARNING',
        "Iniciar Ocorrência",
        "Confirmar deslocamento e início do atendimento?",
        () => {
             setStatusModal(prev => ({ ...prev, visible: false }));
             updateMutation.mutate({
                id: ocorrencia.id_ocorrencia,
                status_situacao: 'EM_ANDAMENTO',
                nr_aviso: ocorrencia.nr_aviso
            }, {
                onSuccess: () => {
                    showStatus('SUCCESS', 'Ocorrência Iniciada', 'Bom trabalho! Redirecionando...', () => {
                         setStatusModal(prev => ({ ...prev, visible: false }));
                         navigation.replace('DetalheAndamento', { id: ocorrencia.id_ocorrencia });
                    });
                },
                onError: () => {
                    showStatus('ERROR', 'Erro', 'Não foi possível iniciar a ocorrência.');
                }
            });
        },
        "Cancelar",
        "Confirmar"
    );
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-50`}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ocorrencia) return null;

  // ESTILIZAÇÃO ORIGINAL (Vermelho/Laranja)
  const isPendente = ocorrencia.status_situacao === 'PENDENTE';
  const headerColor = isPendente ? '#FECACA' : '#FFEDD5';
  const pillColor = isPendente ? '#DC2626' : '#EA580C';
  const statusText = isPendente ? 'PENDENTE • AGUARDANDO EQUIPE' : 'EM DESLOCAMENTO';
  const buttonText = isPendente ? 'INICIAR OCORRÊNCIA' : 'IR PARA DETALHES';
  
  const formatarHora = (dataIso: string) => {
    if (!dataIso) return '--:--';
    return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={tw`w-[48%] mb-4`}>
      <Text style={tw`text-xs text-gray-400 mb-0.5`}>{label}</Text>
      <Text style={tw`text-base font-bold text-slate-800`}>{value}</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusModal 
         visible={statusModal.visible}
         type={statusModal.type}
         title={statusModal.title}
         message={statusModal.message}
         confirmText={statusModal.confirmText}
         cancelText={statusModal.cancelText}
         onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
         onConfirm={statusModal.onConfirm}
       />
      
      {/* HEADER ORIGINAL COLORIDO */}
      <View 
        style={[
          tw`pb-6 rounded-b-3xl shadow-sm`,
          { backgroundColor: headerColor, paddingTop: insets.top }
        ]}
      >
        <View style={tw`flex-row items-center justify-between px-6 py-3`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1`}>
            <ArrowLeft color="#1F2937" size={28} />
          </TouchableOpacity>
          <Text style={tw`text-lg font-extrabold text-slate-900 tracking-wider`}>
            {ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}
          </Text>
          <View style={{ width: 28 }} /> 
        </View>

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

      <ScrollView contentContainerStyle={tw`p-5 pb-32`} showsVerticalScrollIndicator={false}>
          
          {/* CARD DETALHES ORIGINAL */}
          <View style={tw`bg-white rounded-2xl p-6 shadow-md mb-4 border border-gray-100`}>
              <Text style={tw`text-2xl font-black text-slate-900 mb-1`}>
                {ocorrencia.subgrupo.descricao_subgrupo}
              </Text>
              <Text style={tw`text-base font-semibold text-slate-600 mb-3`}>
                {ocorrencia.bairro.nome_bairro} - {ocorrencia.bairro.municipio?.nome_municipio || 'PE'}
              </Text>
              <View style={tw`h-px bg-gray-100 my-3`} />
              <Text style={tw`text-sm text-slate-500 italic leading-relaxed mb-6`}>
                "Ocorrência registrada via {ocorrencia.forma_acervo?.descricao.toLowerCase() || '...'}. 
                Verificar situação no local."
              </Text>
              <View style={tw`flex-row flex-wrap justify-between`}>
                <InfoItem label="Natureza" value={ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'} />
                <InfoItem label="Prioridade" value="Média" /> 
                <InfoItem label="Horário" value={formatarHora(ocorrencia.hora_acionamento)} />
                <InfoItem label="Forma" value={ocorrencia.forma_acervo?.descricao || '...'} />
              </View>
          </View>

          {/* CARD LOCALIZAÇÃO (Com Mapa) */}
          <View style={tw`bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-6`}>
              <View style={tw`p-4 border-b border-gray-100 flex-row items-center`}>
                  <MapPin size={20} color={COLORS.primary} style={tw`mr-2`} />
                  <Text style={tw`font-bold text-[${COLORS.text}] text-base`}>Localização</Text>
              </View>

              {ocorrencia.localizacao?.latitude && ocorrencia.localizacao?.longitude ? (
                <View style={tw`h-48 w-full relative`}>
                  <MapView
                    style={tw`flex-1`}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={{
                      latitude: ocorrencia.localizacao.latitude,
                      longitude: ocorrencia.localizacao.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    onPress={handleNavegarMapa}
                  >
                    <Marker 
                      coordinate={{
                        latitude: ocorrencia.localizacao.latitude,
                        longitude: ocorrencia.localizacao.longitude,
                      }}
                    >
                       <View style={tw`items-center`}>
                         <MapPin size={40} color={COLORS.danger} fill={COLORS.danger} />
                      </View>
                    </Marker>
                  </MapView>
                  <TouchableOpacity 
                      style={tw`absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200`}
                      onPress={handleNavegarMapa}
                  >
                      <Text style={tw`text-xs font-bold text-[${COLORS.primary}]`}>Abrir GPS</Text>
                  </TouchableOpacity>
                </View>
              ) : (
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

      {/* FOOTER */}
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