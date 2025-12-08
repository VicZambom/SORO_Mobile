import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Camera, Edit2, MoreVertical, User, CheckCircle } from 'lucide-react-native';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';
import { ActionModal } from '../components/ActionModal';
import { COLORS } from '../constants/theme';
import { useUpdateStatusOcorrencia } from '../hooks/useOcorrenciaMutations'; // <--- Importado

// --- TIPAGEM ---
interface Midia {
  id_midia: string;
  url_caminho: string;
  tipo_arquivo: string;
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

// --- COMPONENTES DAS ABAS (Mantidos iguais, apenas usando COLORS) ---
const GeralTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
  const steps = [
    { label: 'Ocorrência Gerada', time: ocorrencia.hora_acionamento, active: true },
    { label: 'Deslocamento Iniciado', time: null, active: true }, // Simplificação visual
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
    <ScrollView style={tw`flex-1 bg-white p-5`}>
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100`}>
        <Text style={[tw`text-lg font-bold mb-4`, { color: COLORS.text }]}>Informações</Text>
        <View style={tw`flex-row flex-wrap`}>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={[tw`text-xs uppercase`, { color: COLORS.textLight }]}>Natureza</Text>
            <Text style={[tw`text-sm font-bold`, { color: COLORS.text }]}>{ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'}</Text>
          </View>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={[tw`text-xs uppercase`, { color: COLORS.textLight }]}>Subgrupo</Text>
            <Text style={[tw`text-sm font-bold`, { color: COLORS.text }]}>{ocorrencia.subgrupo.descricao_subgrupo}</Text>
          </View>
          <View style={tw`w-1/2 mb-4`}>
             <Text style={[tw`text-xs uppercase`, { color: COLORS.textLight }]}>Nº do Aviso</Text>
             <Text style={[tw`text-sm font-bold`, { color: COLORS.text }]}>{ocorrencia.nr_aviso || 'S/N'}</Text>
          </View>
        </View>
      </View>
      
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-20 border border-gray-100`}>
        <Text style={[tw`text-lg font-bold mb-4`, { color: COLORS.text }]}>Linha do Tempo</Text>
        {steps.map((step, i) => (
          <View key={i} style={tw`flex-row mb-6`}>
             {i !== steps.length - 1 && (
               <View style={tw`absolute left-[9px] top-4 bottom-[-24px] w-[2px] bg-gray-200`} />
             )}
             <View style={[tw`w-5 h-5 rounded-full items-center justify-center z-10`, { backgroundColor: step.active ? COLORS.secondary : '#cbd5e1' }]} />
             <View style={tw`ml-4 flex-1`}>
               <View style={tw`flex-row justify-between`}>
                 <Text style={[tw`text-sm font-bold`, { color: COLORS.text }]}>{step.label}</Text>
                 <Text style={[tw`text-xs`, { color: COLORS.textLight }]}>{formatTime(step.time)}</Text>
               </View>
               {step.sub && <Text style={[tw`text-xs mt-1`, { color: COLORS.textLight }]}>{step.sub}</Text>}
             </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const MidiaTab = ({ ocorrencia, onAddPress }: { ocorrencia: OcorrenciaFull, onAddPress: () => void }) => {
  return (
    <ScrollView style={tw`flex-1 bg-white p-5`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={[tw`text-lg font-bold`, { color: COLORS.text }]}>
          Evidências ({ocorrencia.midias.length} itens)
        </Text>
        <TouchableOpacity>
             <Text style={[tw`font-medium`, { color: COLORS.primary }]}>Selecionar</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-row flex-wrap justify-between`}>
        <TouchableOpacity 
          style={[tw`w-[31%] aspect-square bg-white border rounded-xl items-center justify-center mb-3`, { borderColor: COLORS.primary }]}
          onPress={onAddPress}
        >
          <Camera size={24} color={COLORS.primary} />
          <Text style={[tw`text-xs font-bold mt-1`, { color: COLORS.primary }]}>Adicionar</Text>
        </TouchableOpacity>

        {ocorrencia.midias.map((midia) => (
          <TouchableOpacity key={midia.id_midia} style={tw`w-[31%] aspect-square bg-slate-200 rounded-xl mb-3 overflow-hidden relative`}>
            <Image source={{ uri: midia.url_caminho }} style={tw`w-full h-full`} resizeMode="cover" />
          </TouchableOpacity>
        ))}
        <View style={tw`w-[31%]`} />
        <View style={tw`w-[31%]`} />
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const VitimasTab = ({ ocorrencia }: { ocorrencia: OcorrenciaFull }) => {
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
      <ScrollView style={tw`flex-1 bg-white p-5`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={[tw`text-lg font-bold`, { color: COLORS.text }]}>
            Vítimas Registradas ({ocorrencia.vitimas.length})
          </Text>
        </View>
  
        {ocorrencia.vitimas.length === 0 ? (
          <View style={tw`py-10 items-center`}>
            <User size={40} color="#cbd5e1" />
            <Text style={[tw`mt-2 text-center`, { color: COLORS.textLight }]}>Nenhuma vítima registrada.</Text>
          </View>
        ) : (
          ocorrencia.vitimas.map((vitima) => {
            const style = getBadgeStyle(vitima.classificacao_vitima);
            return (
              <View key={vitima.id_vitima} style={tw`bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm flex-row relative overflow-hidden`}>
                <View style={tw`absolute left-0 top-0 bottom-0 w-1.5 ${style.border}`} />
                <View style={tw`flex-1 ml-3`}>
                  <Text style={[tw`text-base font-bold`, { color: COLORS.text }]}>{vitima.nome_vitima}</Text>
                  <Text style={[tw`text-sm mt-0.5`, { color: COLORS.textLight }]}>{vitima.idade ? `${vitima.idade} anos` : 'Idade N/I'}</Text>
                  
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

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Hook de Mutação
  const updateMutation = useUpdateStatusOcorrencia();
  const isFinalizing = updateMutation.isPending;

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
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

  const handleAction = async (action: 'FOTO' | 'VIDEO' | 'ASSINATURA' | 'VITIMA') => {
    if (!ocorrencia) return;
    if (action === 'FOTO') handleCameraUpload();
    else if (action === 'VIDEO') Alert.alert("Em breve", "Gravação de vídeo será implementada.");
    else if (action === 'ASSINATURA') navigation.navigate('ColetarAssinatura', { ocorrenciaId: ocorrencia.id_ocorrencia });
    else if (action === 'VITIMA') navigation.navigate('RegistrarVitima', { ocorrenciaId: ocorrencia.id_ocorrencia });
  };

  const handleCameraUpload = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) processUpload(result.assets[0]);
  };

  const processUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!ocorrencia) return;
    setUploading(true);
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

      Alert.alert('Sucesso', 'Foto registrada!');
      setOcorrencia(prev => prev ? { ...prev, midias: [...prev.midias, response.data.data] } : null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao enviar a foto.');
    } finally {
      setUploading(false);
    }
  };

  // --- LÓGICA DE FINALIZAÇÃO ---
  const handleFinalizar = () => {
      Alert.alert(
          "Finalizar Ocorrência",
          "Deseja encerrar este atendimento? A ocorrência será marcada como concluída.",
          [
            { text: "Cancelar", style: "cancel" }, 
            { 
              text: "Confirmar e Finalizar", 
              // Estilo 'default' para iOS ficar azul, ou 'destructive' para vermelho.
              onPress: () => {
                if (!ocorrencia) return;
                
                updateMutation.mutate({
                    id: ocorrencia.id_ocorrencia,
                    status_situacao: 'CONCLUIDO',
                    nr_aviso: ocorrencia.nr_aviso
                }, {
                    onSuccess: () => {
                        Alert.alert("Sucesso", "Ocorrência finalizada!");
                        // Volta para a lista. Como o status mudou, 
                        // ela não aparecerá mais em "Em Andamento".
                        navigation.navigate('MinhasOcorrencias');
                    }
                });
              } 
            }
          ]
      );
  }

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}>
        <ActivityIndicator size="large" color={COLORS.secondary} /> 
      </View>
    );
  }

  if (!ocorrencia) return null;

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFF7ED]`} edges={['top']}>
       {uploading && (
        <View style={tw`absolute inset-0 bg-black/50 z-50 items-center justify-center`}>
          <ActivityIndicator size="large" color="white" />
          <Text style={tw`text-white font-bold mt-4`}>Enviando...</Text>
        </View>
      )}

       <ActionModal 
         visible={isModalVisible} 
         onClose={() => setIsModalVisible(false)}
         onAction={handleAction}
       />

      <View style={tw`px-5 pb-4 pt-2 bg-[#FFF7ED]`}>
        <View style={tw`flex-row items-center mb-6`}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1 -ml-2`}>
             <ArrowLeft size={26} color={COLORS.text} />
           </TouchableOpacity>
           <View style={tw`flex-1 items-center`}>
              <Text style={[tw`text-lg font-extrabold`, { color: COLORS.text }]}>
                {ocorrencia.nr_aviso ? `#${ocorrencia.nr_aviso}` : 'SEM AVISO'}
              </Text>
           </View>
           <View style={{width: 26}} /> 
        </View>

        <View style={tw`bg-orange-400 rounded-md py-1.5 px-4 flex-row items-center justify-center mb-6 self-stretch`}>
            <Clock size={14} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>
                EM ANDAMENTO
            </Text>
        </View>

        <View style={tw`flex-row justify-between items-start mb-2`}>
            <View style={tw`flex-1 mr-4`}>
                <Text style={[tw`text-xl font-black mb-1 leading-tight`, { color: COLORS.text }]}>
                    {ocorrencia.localizacao?.logradouro || 'Logradouro não informado'}
                </Text>
                <Text style={[tw`text-sm font-medium`, { color: COLORS.textLight }]}>
                    {ocorrencia.bairro.nome_bairro}, {ocorrencia.bairro.municipio?.nome_municipio || 'PE'}
                </Text>
            </View>
            <View style={tw`w-16 h-16 bg-blue-100 rounded-xl border border-slate-200 items-center justify-center overflow-hidden shadow-sm`}>
                 <MapPin size={24} color={COLORS.primary} fill={COLORS.primary} />
            </View>
        </View>
      </View>

      <View style={tw`flex-1 bg-white rounded-t-[30px] overflow-hidden shadow-lg`}>
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
                tabBarStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: 'white' },
                tabBarIndicatorStyle: { backgroundColor: COLORS.primary, height: 3 },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
            }}
        >
            <Tab.Screen name="Geral">
                {() => <GeralTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
            <Tab.Screen name="Mídia" options={{ title: `Mídia (${ocorrencia.midias.length})` }}>
                {() => <MidiaTab ocorrencia={ocorrencia} onAddPress={() => setIsModalVisible(true)} />}
            </Tab.Screen>
            <Tab.Screen name="Vítimas" options={{ title: `Vítimas (${ocorrencia.vitimas.length})` }}>
                {() => <VitimasTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
        </Tab.Navigator>
      </View>

      <View style={tw`absolute bottom-0 left-0 right-0 px-5 pb-6 bg-transparent`}>
          <View style={tw`items-end mb-4`}>
              <TouchableOpacity 
                style={[tw`w-14 h-14 rounded-full items-center justify-center shadow-xl`, { backgroundColor: COLORS.primary }]}
                onPress={() => setIsModalVisible(true)}
              >
                <MoreVertical size={24} color="white" />
              </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
                tw`py-4 rounded-xl items-center shadow-md flex-row justify-center`,
                { backgroundColor: isFinalizing ? COLORS.textLight : COLORS.success }
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