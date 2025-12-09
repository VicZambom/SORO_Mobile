import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, Navigation as NavigationIcon, Phone, AlertTriangle } from 'lucide-react-native';
import tw from 'twrnc';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps'; // Mapa Real

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
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
  const { colors } = useTheme();

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
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
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
    <View style={[tw`flex-1`, { backgroundColor: colors.background }]}>
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
          <View style={[tw`rounded-2xl p-6 shadow-md mb-4`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }] }>
              <Text style={[tw`text-2xl font-black mb-1`, { color: colors.text }]}>
                {ocorrencia.subgrupo.descricao_subgrupo}
              </Text>
              <Text style={[tw`text-base font-semibold mb-3`, { color: colors.textLight }] }>
                {ocorrencia.bairro.nome_bairro} - {ocorrencia.bairro.municipio?.nome_municipio || 'PE'}
              </Text>
              <View style={[{ height: 1, backgroundColor: colors.border, marginVertical: 12 }]} />
              <Text style={[tw`text-sm italic leading-relaxed mb-6`, { color: colors.textLight }] }>
                "Ocorrência registrada via {ocorrencia.forma_acervo?.descricao.toLowerCase() || '...'}. 
                Verificar situação no local."
              </Text>
              <View style={tw`flex-row flex-wrap justify-between`}>
                <InfoItem label="Natureza" value={ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'} />
                <InfoItem label="Horário" value={formatarHora(ocorrencia.hora_acionamento)} />
                <InfoItem label="Forma" value={ocorrencia.forma_acervo?.descricao || '...'} />
              </View>
          </View>

          {/* CARD LOCALIZAÇÃO */}
          <View style={[tw`rounded-2xl overflow-hidden shadow-md mb-6`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }] }>
              <View style={[tw`p-4 flex-row items-center`, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <MapPin size={20} color={colors.primary} style={tw`mr-2`} />
                  <Text style={[tw`font-bold text-base`, { color: colors.text }]}>Localização</Text>
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
                         <MapPin size={40} color={colors.danger} fill={colors.danger} />
                      </View>
                    </Marker>
                  </MapView>
                  <TouchableOpacity 
                      style={[tw`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg shadow-sm`, { backgroundColor: colors.surface }]}
                      onPress={handleNavegarMapa}
                  >
                      <Text style={[tw`text-xs font-bold`, { color: colors.primary }]}>Abrir GPS</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                    style={[tw`h-40 relative items-center justify-center`, { backgroundColor: colors.background }]}
                    onPress={handleNavegarMapa}
                    activeOpacity={0.9}
                >
                    <View style={tw`items-center opacity-50`}>
                        <MapPin size={40} color={colors.textLight} />
                        <Text style={[tw`text-xs font-bold mt-2`, { color: colors.textLight }]}>Sem coordenadas de GPS</Text>
                    </View>
                </TouchableOpacity>
              )}

              <View style={[tw`p-4`, { backgroundColor: colors.surface }] }>
                  <Text style={[tw`text-base font-bold mb-1`, { color: colors.text }]}>
                      {ocorrencia.localizacao?.logradouro || 'Logradouro não informado'}
                  </Text>
                  <Text style={[tw`text-sm`, { color: colors.textLight }] }>
                          {ocorrencia.bairro.nome_bairro}, {ocorrencia.bairro.municipio?.nome_municipio}
                  </Text>
                  {ocorrencia.localizacao?.referencia_logradouro && (
                      <View style={[tw`mt-3 p-2 rounded-lg`, { backgroundColor: '#EFF6FF' }] }>
                          <Text style={[tw`text-xs`, { color: '#1E40AF' }]}>
                              <Text style={tw`font-bold`}>Ref: </Text>
                              {ocorrencia.localizacao.referencia_logradouro}
                          </Text>
                      </View>
                  )}
              </View>
          </View>
      </ScrollView>

        {/* FOOTER */}
        <View style={[tw`absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8`, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }] }>
        <TouchableOpacity 
            style={[
                tw`py-4 rounded-xl shadow-lg flex-row items-center justify-center`,
            isUpdating ? { backgroundColor: colors.border } : { backgroundColor: colors.primary }
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