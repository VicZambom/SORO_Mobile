import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Camera, MoreVertical, User, CheckCircle, FileSignature } from 'lucide-react-native';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';
import { ActionModal } from '../components/ActionModal';
import { StatusModal, StatusModalType } from '../components/StatusModal';
import { useTheme } from '../context/ThemeContext';
import { useUpdateStatusOcorrencia } from '../hooks/useOcorrenciaMutations';
import { getVitimasLocais } from '../utils/vitimaStorage';

// --- TIPAGEM ---
interface Midia {
  id_midia: string;
  url_caminho: string;
  tipo_arquivo: string;
  isTemp?: boolean; // Para identificar upload em andamento
}

interface OcorrenciaFull {
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
  forma_acervo: { descricao: string };
  
  localizacao?: {
    logradouro: string;
    referencia_logradouro: string;
    latitude?: number;
    longitude?: number;
  };

  midias: Midia[];
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

// --- ABA GERAL ---
const GeralTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
  const { colors } = useTheme();
  const assinatura = ocorrencia.midias.find(m => 
    m.url_caminho.toLowerCase().includes('assinatura') || m.id_midia === 'local_sig'
  );

  return (
    <ScrollView style={[tw`flex-1 p-5`, { backgroundColor: colors.background }]}>
      <View style={[tw`rounded-xl p-5 shadow-sm mb-5 border`, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[tw`text-lg font-bold mb-4`, { color: colors.text }]}>Informações da Ocorrência</Text>
        
        <View style={tw`flex-row flex-wrap`}>
          <View style={tw`w-1/2 mb-4 pr-2`}>
            <Text style={[tw`text-xs uppercase font-bold`, { color: colors.textLight }]}>Natureza</Text>
            <Text style={[tw`text-sm font-medium mt-1`, { color: colors.text }]}>
              {ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'}
            </Text>
          </View>
          <View style={tw`w-1/2 mb-4 pl-2`}>
            <Text style={[tw`text-xs uppercase font-bold`, { color: colors.textLight }]}>Nº Aviso</Text>
            <Text style={[tw`text-sm font-medium mt-1`, { color: colors.text }]}>
              {ocorrencia.nr_aviso || 'S/N'}
            </Text>
          </View>
          <View style={tw`w-full mb-4`}>
            <Text style={[tw`text-xs uppercase font-bold`, { color: colors.textLight }]}>Subgrupo</Text>
            <Text style={[tw`text-sm font-medium mt-1`, { color: colors.text }]}>
              {ocorrencia.subgrupo.descricao_subgrupo}
            </Text>
          </View>
           <View style={tw`w-full`}>
            <Text style={[tw`text-xs uppercase font-bold`, { color: colors.textLight }]}>Forma de Acionamento</Text>
            <Text style={[tw`text-sm font-medium mt-1`, { color: colors.text }]}>
              {ocorrencia.forma_acervo.descricao}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[tw`text-lg font-bold mb-3`, { color: colors.text }]}>Assinatura do Responsável</Text>
      
      <View style={[tw`rounded-xl overflow-hidden min-h-[150px] justify-center items-center mb-10`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }] }>
        {assinatura ? (
           <View style={[tw`w-full h-48`, { backgroundColor: colors.surface }] }>
             <Image 
                source={{ uri: assinatura.url_caminho }} 
                style={tw`w-full h-full`} 
                resizeMode="contain" 
             />
             <View style={[tw`absolute bottom-2 right-2 px-2 py-1 rounded`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.success }] }>
               <Text style={[tw`text-xs font-bold`, { color: colors.success }]}>Assinado Digitalmente</Text>
             </View>
          </View>
        ) : (
          <View style={tw`items-center py-6`}>
            <FileSignature size={32} color={colors.textLight} />
            <Text style={[tw`text-sm mt-2 text-center px-10`, { color: colors.textLight }]}>
              Nenhuma assinatura registrada ainda.
            </Text>
          </View>
        )}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- ABA MÍDIA (OTIMISTA) ---
const MidiaTab = ({ ocorrencia, onAddPress }: { ocorrencia: OcorrenciaFull, onAddPress: () => void }) => {
  const { colors } = useTheme();
  return (
    <ScrollView style={[tw`flex-1 p-5`, { backgroundColor: colors.background }]}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
          Evidências ({ocorrencia.midias.length} itens)
        </Text>
      </View>

      <View style={tw`flex-row flex-wrap justify-between`}>
        <TouchableOpacity 
          style={[tw`w-[31%] aspect-square rounded-xl items-center justify-center mb-3`, { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }]}
          onPress={onAddPress}
        >
          <Camera size={24} color={colors.primary} />
          <Text style={[tw`text-xs font-bold mt-1`, { color: colors.primary }]}>Adicionar</Text>
        </TouchableOpacity>

        {ocorrencia.midias.map((midia) => (
          <TouchableOpacity 
            key={midia.id_midia} 
            style={[
                tw`w-[31%] aspect-square rounded-xl mb-3 overflow-hidden relative`,
                midia.isTemp ? { opacity: 0.5 } : {} // Feedback visual de carregamento
            ]}
          >
            <Image source={{ uri: midia.url_caminho }} style={tw`w-full h-full`} resizeMode="cover" />
            {midia.isTemp && (
                <View style={tw`absolute inset-0 items-center justify-center`}>
                    <ActivityIndicator color="#fff" />
                </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={tw`w-[31%]`} />
        <View style={tw`w-[31%]`} />
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- ABA VÍTIMAS ---
const VitimasTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
  const { colors } = useTheme();
    const getBadgeStyle = (classificacao: string) => {
      switch(classificacao) {
        case 'VERMELHO': case 'GRAVE': return { bg: 'bg-red-100', text: 'text-red-700', border: 'bg-red-500' };
        case 'AMARELO': case 'MODERADO': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'bg-yellow-500' };
        case 'VERDE': case 'LEVE': return { bg: 'bg-green-100', text: 'text-green-700', border: 'bg-green-500' };
        case 'PRETO': case 'OBITO': return { bg: 'bg-gray-200', text: 'text-gray-800', border: 'bg-gray-600' };
        default: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'bg-slate-400' };
      }
    };
  
    return (
      <ScrollView style={[tw`flex-1 p-5`, { backgroundColor: colors.background }]}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>
            Vítimas Registradas ({ocorrencia.vitimas.length})
          </Text>
        </View>
  
        {ocorrencia.vitimas.length === 0 ? (
          <View style={tw`py-10 items-center`}>
            <User size={40} color={colors.textLight} />
            <Text style={[tw`mt-2 text-center`, { color: colors.textLight }]}>Nenhuma vítima registrada.</Text>
          </View>
        ) : (
          ocorrencia.vitimas.map((vitima) => {
            const style = getBadgeStyle(vitima.classificacao_vitima);
            return (
              <View key={vitima.id_vitima} style={[tw`rounded-xl p-4 mb-4 shadow-sm flex-row relative overflow-hidden`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }] }>
                <View style={tw`absolute left-0 top-0 bottom-0 w-1.5 ${style.border}`} />
                <View style={tw`flex-1 ml-3`}>
                  <Text style={[tw`text-base font-bold`, { color: colors.text }]}>{vitima.nome_vitima}</Text>
                  <Text style={[tw`text-sm mt-0.5`, { color: colors.textLight }]}>{vitima.idade ? `${vitima.idade} anos` : 'Idade N/I'}</Text>
                  
                  <View style={tw`flex-row mt-3 items-center`}>
                    <View style={tw`px-3 py-1 rounded-full ${style.bg}`}>
                      <Text style={tw`text-[10px] font-bold uppercase ${style.text}`}>{vitima.classificacao_vitima}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
};

// --- TELA PRINCIPAL ---
export const DetalheAndamentoScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DetalheAndamento'>>();
  const { id } = route.params;

  const { colors } = useTheme();

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'INFO' as StatusModalType,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: undefined as string | undefined,
    onConfirm: () => {},
  });

  const updateMutation = useUpdateStatusOcorrencia();
  const isFinalizing = updateMutation.isPending;

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

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
      const dadosApi = response.data;
      
      const vitimasLocais = await getVitimasLocais(id);
      const assinaturaLocalJson = await AsyncStorage.getItem(`@SORO:assinatura_${id}`);
      
      let midiasAtualizadas = [...(dadosApi.midias || [])];

      if (assinaturaLocalJson) {
        const localSig = JSON.parse(assinaturaLocalJson);
        midiasAtualizadas.push({
            id_midia: 'local_sig',
            url_caminho: localSig.uri,
            tipo_arquivo: 'image/png'
        });
      }

      setOcorrencia({
        ...dadosApi,
        vitimas: [...(dadosApi.vitimas || []), ...vitimasLocais],
        midias: midiasAtualizadas
      });
    } catch (error) {
      console.error(error);
      showStatus('ERROR', 'Erro', 'Falha ao carregar detalhes da ocorrência.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetalhes();
    }, [id])
  );

  const handleAction = async (action: 'FOTO' | 'VIDEO' | 'ASSINATURA' | 'VITIMA') => {
    if (!ocorrencia) return;
    if (action === 'FOTO') handleCameraUpload();
    else if (action === 'VIDEO') showStatus('INFO', 'Em Breve', "Gravação de vídeo será implementada.");
    else if (action === 'ASSINATURA') navigation.navigate('ColetarAssinatura', { ocorrenciaId: ocorrencia.id_ocorrencia });
    else if (action === 'VITIMA') navigation.navigate('RegistrarVitima', { ocorrenciaId: ocorrencia.id_ocorrencia });
  };

  const handleCameraUpload = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return showStatus('WARNING', 'Permissão', 'Precisamos de acesso à câmera.');
    
    const result = await ImagePicker.launchCameraAsync({
      // CORREÇÃO: Voltamos para MediaTypeOptions para evitar erro de TS
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) processUpload(result.assets[0]);
  };

  const processUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!ocorrencia) return;

    // 1. OTIMISTA: Exibe a foto imediatamente
    const tempId = `temp_${new Date().getTime()}`;
    const novaMidiaTemp: Midia = {
        id_midia: tempId,
        url_caminho: asset.uri,
        tipo_arquivo: 'image/jpeg',
        isTemp: true,
    };

    setOcorrencia(prev => {
        if (!prev) return null;
        return {
            ...prev,
            midias: [novaMidiaTemp, ...prev.midias] 
        };
    });

    // 2. Upload em Background
    try {
      const formData = new FormData();
      const filename = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('midia', { uri: asset.uri, name: filename, type } as any);

      const response = await api.post(
        `/api/v3/ocorrencias/${ocorrencia.id_ocorrencia}/midia`, 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      // 3. Sucesso: Atualiza o item (remove flag isTemp)
      setOcorrencia(prev => {
          if(!prev) return null;
          const novasMidias = prev.midias.map(m => 
              m.id_midia === tempId ? { ...response.data.data, isTemp: false } : m
          );
          return { ...prev, midias: novasMidias };
      });

    } catch (error) {
      console.error(error);
      // 4. Erro: Remove a imagem da lista
      setOcorrencia(prev => {
          if(!prev) return null;
          return { ...prev, midias: prev.midias.filter(m => m.id_midia !== tempId) };
      });
      showStatus('ERROR', 'Erro', 'Falha ao enviar a foto. Tente novamente.');
    }
  };

  const handleFinalizar = () => {
      showStatus(
        'WARNING', 
        "Finalizar Ocorrência?", 
        "Deseja encerrar este atendimento? A ocorrência será marcada como concluída.", 
        () => {
             setStatusModal(prev => ({ ...prev, visible: false }));
             if (!ocorrencia) return;

             updateMutation.mutate({
                id: ocorrencia.id_ocorrencia,
                status_situacao: 'CONCLUIDO',
                nr_aviso: ocorrencia.nr_aviso
            }, {
                onSuccess: () => {
                    showStatus('SUCCESS', "Ocorrência Finalizada!", "Bom trabalho. O registro foi encerrado.", () => {
                        setStatusModal(prev => ({ ...prev, visible: false }));
                        navigation.navigate('MinhasOcorrencias');
                    });
                },
                onError: () => {
                    showStatus('ERROR', "Erro", "Não foi possível finalizar. Tente novamente.");
                }
            });
        },
        "Cancelar",
        "Confirmar"
      );
  }

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: colors.background }] }>
        <ActivityIndicator size="large" color={colors.secondary} /> 
      </View>
    );
  }

  if (!ocorrencia) return null;

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]} edges={['top']}>
       <ActionModal 
         visible={isActionModalVisible} 
         onClose={() => setIsActionModalVisible(false)}
         onAction={handleAction}
       />

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

      <View style={[tw`px-5 pb-4 pt-2`, { backgroundColor: colors.background }]}>
        <View style={tw`flex-row items-center mb-6`}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
             <ArrowLeft size={24} color={colors.text} />
           </TouchableOpacity>
           <View style={tw`flex-1 items-center`}>
              <Text style={[tw`text-lg font-extrabold`, { color: colors.text }]}>
                {ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}
              </Text>
           </View>
           <View style={{width: 26}} /> 
        </View>

        <View style={[tw`rounded-md py-1.5 px-4 flex-row items-center justify-center mb-6 self-stretch`, { backgroundColor: colors.secondary }]}>
          <Clock size={14} color="white" style={tw`mr-2`} />
          <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>
            EM ANDAMENTO
          </Text>
        </View>

        <View style={tw`flex-row justify-between items-start mb-2`}>
            <View style={tw`flex-1 mr-4`}>
                <Text style={[tw`text-xl font-black mb-1 leading-tight`, { color: colors.text }]}>
                    {ocorrencia.localizacao?.logradouro || 'Logradouro não informado'}
                </Text>
                <Text style={[tw`text-sm font-medium`, { color: colors.textLight }]}>
                    {ocorrencia.bairro.nome_bairro}, {ocorrencia.bairro.municipio?.nome_municipio || 'PE'}
                </Text>
            </View>

            <View style={[tw`w-20 h-20 rounded-xl border overflow-hidden shadow-sm`, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 {ocorrencia.localizacao?.latitude && ocorrencia.localizacao?.longitude ? (
                   <MapView
                      provider={PROVIDER_DEFAULT}
                      style={tw`w-full h-full`}
                      initialRegion={{
                        latitude: ocorrencia.localizacao.latitude,
                        longitude: ocorrencia.localizacao.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                   />
                 ) : (
                   <View style={tw`items-center justify-center flex-1`}>
                     <MapPin size={24} color={colors.primary} fill={colors.primary} />
                   </View>
                 )}
            </View>
        </View>
      </View>

      <View style={[tw`flex-1 rounded-t-[30px] overflow-hidden shadow-lg`, { backgroundColor: colors.surface }]}>
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
            tabBarStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
            tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textLight,
            }}
        >
            <Tab.Screen name="Geral">
                {() => <GeralTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
            <Tab.Screen name="Mídia" options={{ title: `Mídia (${ocorrencia.midias.length})` }}>
                {() => <MidiaTab ocorrencia={ocorrencia} onAddPress={() => setIsActionModalVisible(true)} />}
            </Tab.Screen>
            <Tab.Screen name="Vítimas" options={{ title: `Vítimas (${ocorrencia.vitimas.length})` }}>
                {() => <VitimasTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
        </Tab.Navigator>
      </View>

      <View style={tw`absolute bottom-0 left-0 right-0 px-5 pb-6 bg-transparent`}>
          <View style={tw`items-end mb-4`}>
              <TouchableOpacity 
                style={[tw`w-14 h-14 rounded-full items-center justify-center shadow-xl`, { backgroundColor: colors.primary }]}
                onPress={() => setIsActionModalVisible(true)}
              >
                <MoreVertical size={24} color="white" />
              </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
                tw`py-4 rounded-xl items-center shadow-md flex-row justify-center`,
                { backgroundColor: isFinalizing ? colors.textLight : colors.success }
            ]}
            activeOpacity={0.9}
            onPress={handleFinalizar}
            disabled={isFinalizing}
          >
              {isFinalizing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                   <CheckCircle size={20} color="white" style={tw`mr-2`} />
                   <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>
                      FINALIZAR OCORRÊNCIA
                   </Text>
                </>
              )}
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DetalheAndamentoScreen;