import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Camera, Edit2, MoreVertical, User, CheckCircle2 } from 'lucide-react-native';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importante para persistir o horário localmente
import { useQueryClient } from '@tanstack/react-query';

import api from '../services/api';
import { AppNavigationProp, RootStackParamList } from '../types/navigation';
import { ActionModal } from '../components/ActionModal';

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
  hora_acionamento: string;
  subgrupo: { 
    descricao_subgrupo: string; 
    grupo?: { natureza?: { descricao: string }; }; 
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

// --- ABA GERAL ---
const GeralTab = ({ ocorrencia, chegou, horarioChegadaLocal }: { ocorrencia: OcorrenciaFull, chegou: boolean, horarioChegadaLocal: string | null }) => {
  const formatTime = (iso: string | null) => 
    iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  // Prioriza o horário salvo localmente (AsyncStorage) ou o do backend
  const displayChegada = horarioChegadaLocal || ocorrencia.viaturas_usadas[0]?.horario_chegada_local;
  const viatura = ocorrencia.viaturas_usadas[0]?.viatura.numero_viatura;

  const steps = [
    { 
      label: 'Ocorrência Gerada', 
      time: ocorrencia.hora_acionamento, 
      active: true,
      color: 'bg-green-500'
    },
    { 
      label: 'Deslocamento Iniciado', 
      time: null, 
      active: true, 
      color: 'bg-blue-500'
    },
    { 
      label: 'Chegada ao Local', 
      time: displayChegada, // Usa o horário local se disponível
      active: chegou,
      sub: viatura ? `Viatura ${viatura}` : 'Sua equipe',
      color: 'bg-orange-500'
    },
  ];

  return (
    <ScrollView style={tw`flex-1 bg-white p-5`}>
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-5 border border-gray-100`}>
        <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Informações</Text>
        <View style={tw`flex-row flex-wrap`}>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Natureza</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>{ocorrencia.subgrupo.grupo?.natureza?.descricao || 'N/A'}</Text>
          </View>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Subgrupo</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>{ocorrencia.subgrupo.descricao_subgrupo}</Text>
          </View>
          <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Forma</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>{ocorrencia.forma_acervo.descricao}</Text>
          </View>
           <View style={tw`w-1/2 mb-4`}>
            <Text style={tw`text-xs text-slate-400 uppercase`}>Nº do Aviso</Text>
            <Text style={tw`text-sm font-bold text-slate-800`}>{ocorrencia.nr_aviso || 'S/N'}</Text>
          </View>
        </View>
      </View>
      
      <View style={tw`bg-white rounded-xl p-5 shadow-sm mb-20 border border-gray-100`}>
        <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Linha do Tempo</Text>
        {steps.map((step, i) => (
          <View key={i} style={tw`flex-row mb-6`}>
             {i !== steps.length - 1 && (
               <View style={tw`absolute left-[9px] top-4 bottom-[-24px] w-[2px] bg-gray-200`} />
             )}
             <View style={[tw`w-5 h-5 rounded-full items-center justify-center z-10`, step.active ? tw`${step.color}` : tw`bg-gray-300`]}>
                {step.active && <View style={tw`w-2 h-2 bg-white rounded-full`} />}
             </View>
             <View style={tw`ml-4 flex-1`}>
               <View style={tw`flex-row justify-between`}>
                 <Text style={[tw`text-sm font-bold`, step.active ? tw`text-slate-800` : tw`text-gray-400`]}>
                    {step.label}
                 </Text>
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

// --- ABA MÍDIA ---
const MidiaTab = ({ ocorrencia, onAddPress }: { ocorrencia: OcorrenciaFull, onAddPress: () => void }) => {
  return (
    <ScrollView style={tw`flex-1 bg-white p-5`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-lg font-bold text-slate-900`}>
          Evidências ({ocorrencia.midias.length} itens)
        </Text>
        <TouchableOpacity>
             <Text style={tw`text-[#061C43] font-medium`}>Selecionar</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-row flex-wrap justify-between`}>
        <TouchableOpacity 
          style={tw`w-[31%] aspect-square bg-white border border-[#061C43] rounded-xl items-center justify-center mb-3`}
          onPress={onAddPress}
        >
          <Camera size={24} color="#061C43" />
          <Text style={tw`text-xs font-bold text-[#061C43] mt-1`}>Adicionar</Text>
        </TouchableOpacity>

        {ocorrencia.midias.map((midia) => (
          <TouchableOpacity key={midia.id_midia} style={tw`w-[31%] aspect-square bg-slate-200 rounded-xl mb-3 overflow-hidden relative`}>
            <Image source={{ uri: midia.url_caminho }} style={tw`w-full h-full`} resizeMode="cover" />
            {midia.tipo_arquivo.includes('video') && (
              <View style={tw`absolute inset-0 items-center justify-center bg-black/30`}>
                  <View style={tw`w-8 h-8 bg-white/80 rounded-full items-center justify-center`}>
                    <View style={tw`w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-slate-900 border-b-[6px] border-b-transparent ml-1`} />
                  </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={tw`w-[31%]`} /><View style={tw`w-[31%]`} />
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- ABA VÍTIMAS ---
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
        <Text style={tw`text-lg font-bold text-slate-900`}>
          Vítimas Registradas ({ocorrencia.vitimas.length})
        </Text>
      </View>

      {ocorrencia.vitimas.length === 0 ? (
        <View style={tw`py-10 items-center`}>
          <User size={40} color="#cbd5e1" />
          <Text style={tw`text-slate-400 mt-2 text-center`}>Nenhuma vítima registrada.</Text>
        </View>
      ) : (
        ocorrencia.vitimas.map((vitima) => {
          const style = getBadgeStyle(vitima.classificacao_vitima);
          return (
            <View key={vitima.id_vitima} style={tw`bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm flex-row relative overflow-hidden`}>
              <View style={tw`absolute left-0 top-0 bottom-0 w-1.5 ${style.border}`} />
              <View style={tw`flex-1 ml-3`}>
                <View style={tw`flex-row justify-between items-start`}>
                  <View>
                    <Text style={tw`text-base font-bold text-slate-900`}>{vitima.nome_vitima}</Text>
                    <Text style={tw`text-sm text-slate-500 mt-0.5`}>{vitima.idade ? `${vitima.idade} anos` : 'Idade N/I'} • Sexo N/I</Text>
                  </View>
                  <TouchableOpacity><Edit2 size={18} color="#94a3b8" /></TouchableOpacity>
                </View>
                <View style={tw`flex-row mt-3 items-center`}>
                  <View style={tw`px-3 py-1 rounded-full ${style.bg}`}>
                    <Text style={tw`text-[10px] font-bold uppercase ${style.text}`}>{vitima.classificacao_vitima}</Text>
                  </View>
                </View>
                <View style={tw`mt-3 border-t border-gray-100 pt-2`}>
                  <Text style={tw`text-[10px] text-slate-400 uppercase`}>Destino</Text>
                  <Text style={tw`text-sm font-semibold text-slate-800`}>{vitima.destino_vitima || 'No local'}</Text>
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
  const queryClient = useQueryClient();

  const [ocorrencia, setOcorrencia] = useState<OcorrenciaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [chegouLocal, setChegouLocal] = useState(false);
  const [localChegadaTime, setLocalChegadaTime] = useState<string | null>(null); // Novo estado
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Carrega o horário local salvo no celular ao abrir a tela
  useEffect(() => {
    const loadLocalTime = async () => {
      try {
        const time = await AsyncStorage.getItem(`@chegada_${id}`);
        if (time) setLocalChegadaTime(time);
      } catch (e) {
        console.log('Erro ao ler AsyncStorage', e);
      }
    };
    loadLocalTime();
  }, [id]);

  const fetchDetalhes = async () => {
    try {
      const response = await api.get(`/api/v3/ocorrencias/${id}`);
      const dados = response.data;
      setOcorrencia(dados);
      const statusJaAndamento = dados.status_situacao === 'EM_ANDAMENTO';
      const viaturaChegou = dados.viaturas_usadas?.some((v: any) => v.horario_chegada_local !== null);
      
      if (statusJaAndamento || viaturaChegou) {
          setChegouLocal(true);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar detalhes.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDetalhes(); }, [id]));

  // AÇÕES
  const handleAction = async (action: 'FOTO' | 'VIDEO' | 'ASSINATURA' | 'VITIMA') => {
    if (!ocorrencia) return;

    if (action === 'FOTO') {
      handleCameraUpload();
    } else if (action === 'VIDEO') {
      Alert.alert("Em breve", "Gravação de vídeo será implementada.");
    } else if (action === 'ASSINATURA') {
      navigation.navigate('ColetarAssinatura', { ocorrenciaId: ocorrencia.id_ocorrencia });
    } else if (action === 'VITIMA') {
      navigation.navigate('RegistrarVitima', { ocorrenciaId: ocorrencia.id_ocorrencia });
    }
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
      
      // @ts-ignore
      formData.append('midia', { uri: asset.uri, name: filename, type });

      await api.post(`/api/v3/ocorrencias/${ocorrencia.id_ocorrencia}/midia`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      Alert.alert('Sucesso', 'Mídia registrada!');
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
      fetchDetalhes();

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao enviar a foto.');
    } finally {
      setUploading(false);
      setIsModalVisible(false);
    }
  };

  // --- LÓGICA DE CHEGADA: FRONTEND + ASYNCSTORAGE ---
  const handleRegistrarChegada = async () => {
    setUpdating(true);
    try {
      // 1. Pega GPS (só para log/debug, sem enviar para API para não dar erro)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          console.log(" GPS no momento da chegada:", location.coords);
      }

      // 2. Envia para API APENAS o status (evita Erro 500)
      await api.put(`/api/v3/ocorrencias/${id}`, {
        status_situacao: 'EM_ANDAMENTO',
        relacionado_eleicao: false,
        nr_aviso: ocorrencia?.nr_aviso || null,
        data_execucao_servico: null
      });

      // 3. Salva horário localmente para exibição na timeline
      const now = new Date().toISOString();
      await AsyncStorage.setItem(`@chegada_${id}`, now);
      setLocalChegadaTime(now);
      setChegouLocal(true);
      
      // 4. Atualiza estado global
      await queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
      Alert.alert('Sucesso', 'Chegada registrada! Status atualizado.');
      fetchDetalhes();

    } catch (error: any) {
      console.error("Erro ao registrar chegada:", error);
      Alert.alert('Erro', 'Falha ao registrar chegada.');
    } finally {
      setUpdating(false);
    }
  };

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

      // Limpa o horário local pois finalizou
      await AsyncStorage.removeItem(`@chegada_${id}`);

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

  if (loading) return <View style={tw`flex-1 justify-center items-center bg-[#FFF7ED]`}><ActivityIndicator size="large" color="#F97316" /></View>;
  if (!ocorrencia) return null;

  return (
    <SafeAreaView style={tw`flex-1 bg-orange-50`} edges={['top']}>
       
       {uploading && (
        <View style={tw`absolute inset-0 bg-black/50 z-50 items-center justify-center`}>
          <ActivityIndicator size="large" color="white" />
          <Text style={tw`text-white font-bold mt-4`}>Enviando Mídia...</Text>
        </View>
      )}

      {/* MODAL DE AÇÕES */}
      <ActionModal 
         visible={isModalVisible} 
         onClose={() => setIsModalVisible(false)}
         onAction={handleAction}
       />

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
            <Tab.Screen name="Geral">
                {/* Passamos o horário local para a aba Geral */}
                {() => <GeralTab ocorrencia={ocorrencia} chegou={chegouLocal} horarioChegadaLocal={localChegadaTime} />}
            </Tab.Screen>
            <Tab.Screen name="Mídia">
                {() => <MidiaTab ocorrencia={ocorrencia} onAddPress={handleCameraUpload} />}
            </Tab.Screen>
            <Tab.Screen name="Vítimas">
                {() => <VitimasTab ocorrencia={ocorrencia} />}
            </Tab.Screen>
        </Tab.Navigator>
      </View>

      {/* BARRA INFERIOR + BOTÃO FLUTUANTE */}
      <View style={tw`absolute bottom-0 left-0 right-0 px-5 pb-6 bg-white border-t border-gray-100 pt-4`}>

          {/* FAB - Menu de Ações */}
          <View style={tw`absolute -top-16 right-5`}>
             <TouchableOpacity 
                style={tw`w-14 h-14 bg-[#061C43] rounded-full items-center justify-center shadow-xl`}
                onPress={() => setIsModalVisible(true)}
              >
                <MoreVertical size={24} color="white" />
              </TouchableOpacity>
          </View>

          {/* Botões de Ação de Status */}
          {!chegouLocal ? (
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

export default DetalheAndamentoScreen;