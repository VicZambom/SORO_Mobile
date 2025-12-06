// src/screens/NovaOcorrenciaScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, KeyboardAvoidingView, 
  Platform, Modal, FlatList, ActivityIndicator, Alert, TextInput 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, X, Check, MapPin, WifiOff } from 'lucide-react-native';
import tw from 'twrnc';
import * as Location from 'expo-location';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import api from '../services/api';
import { AxiosError } from 'axios';
import { AppNavigationProp } from '../types/navigation';
import { useSync } from '../context/SyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- SCHEMA DE VALIDAÇÃO (ZOD) ---
const ocorrenciaSchema = z.object({
  naturezaId: z.string().min(1, "Selecione uma natureza"),
  grupoId: z.string().min(1, "Selecione um grupo"),
  subgrupoId: z.string().min(1, "Selecione um subgrupo"),
  bairroId: z.string().min(1, "Selecione o bairro"),
  logradouro: z.string().optional(),
  formaAcervoId: z.string().min(1, "Selecione a forma de acionamento"),
  nrAviso: z.string().optional(),
  observacoes: z.string().optional(),
});

// Inferência do tipo TypeScript a partir do schema
type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;

// --- TIPOS AUXILIARES ---
interface Option {
  id: string;
  label: string;
}

// --- COMPONENTES INTERNOS ---
const SelectionModal = ({ 
  visible, onClose, title, options, onSelect, loading 
}: { 
  visible: boolean; onClose: () => void; title: string; options: Option[]; onSelect: (item: Option) => void; loading?: boolean;
}) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View style={tw`flex-1 justify-end bg-black/60`}>
      <View style={tw`bg-white rounded-t-3xl max-h-[60%]`}>
        <View style={tw`flex-row justify-between items-center p-5 border-b border-gray-100`}>
          <Text style={tw`text-lg font-bold text-slate-800`}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={tw`p-1`}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={tw`p-10 items-center`}>
            <ActivityIndicator size="large" color="#061C43" />
            <Text style={tw`mt-4 text-slate-500`}>Carregando opções...</Text>
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            contentContainerStyle={tw`p-4`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={tw`py-4 border-b border-gray-50 flex-row items-center`}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <View style={tw`w-2 h-2 rounded-full bg-slate-300 mr-3`} />
                <Text style={tw`text-base text-slate-700 font-medium`}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={tw`text-center text-slate-400 py-6`}>Nenhuma opção disponível.</Text>
            }
          />
        )}
      </View>
    </View>
  </Modal>
);

const SelectInput = ({ label, value, placeholder, onPress, disabled = false, error }: any) => (
  <View style={tw`mb-4`}>
    <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>{label}</Text>
    <TouchableOpacity 
      style={[
        tw`flex-row justify-between items-center bg-white border rounded-xl p-4 h-14`,
        disabled ? tw`bg-gray-50 border-gray-200` : (error ? tw`border-red-500` : tw`border-gray-300`)
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={value ? tw`text-slate-800 font-medium` : tw`text-slate-400`}>
        {value || placeholder}
      </Text>
      <ChevronDown size={20} color={disabled ? "#cbd5e1" : "#64748b"} />
    </TouchableOpacity>
    {error && <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>}
  </View>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Tipo' },
    { id: 2, label: 'Local' },
    { id: 3, label: 'Detalhes' },
  ];

  return (
    <View style={tw`flex-row justify-center items-center py-6 bg-white`}>
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <View style={tw`items-center mx-1`}>
              <View style={[
                tw`w-10 h-10 rounded-full items-center justify-center mb-1 border-2`,
                isCompleted ? tw`bg-green-500 border-green-500` : (isActive ? tw`bg-[#061C43] border-[#061C43]` : tw`bg-gray-200 border-gray-200`)
              ]}>
                {isCompleted ? (
                  <Check size={20} color="white" strokeWidth={3} />
                ) : (
                  <Text style={tw`text-white font-bold text-base`}>{step.id}</Text>
                )}
              </View>
              <Text style={[
                tw`text-xs font-bold`,
                isActive || isCompleted ? tw`text-slate-900` : tw`text-slate-400`
              ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[tw`w-10 h-1 mb-4 mx-1 rounded-full`, isCompleted ? tw`bg-green-500` : tw`bg-gray-200`]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// --- TELA PRINCIPAL ---
export const NovaOcorrenciaScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { isOnline, addToQueue } = useSync();
  const [step, setStep] = useState(1);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // React Hook Form
  const { control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: {
      logradouro: '',
      nrAviso: '',
      observacoes: ''
    }
  });

  // Watchers para dependências (labels e lógica de cascata)
  const watchNatureza = watch('naturezaId');
  const watchGrupo = watch('grupoId');

  // Estado para Labels 
  const [labels, setLabels] = useState({
    natureza: '', grupo: '', subgrupo: '', bairro: '', forma: ''
  });

  // Dados das Listas
  const [naturezas, setNaturezas] = useState<Option[]>([]);
  const [grupos, setGrupos] = useState<Option[]>([]);
  const [subgrupos, setSubgrupos] = useState<Option[]>([]);
  const [bairros, setBairros] = useState<Option[]>([]);
  const [formas, setFormas] = useState<Option[]>([]);

  // Controle Modais
  const [modalType, setModalType] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  // Geolocalização
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Carga Inicial
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (isOnline) {
          const [resNat, resBai, resFor] = await Promise.all([
            api.get('/api/v1/naturezas'),
            api.get('/api/v1/bairros'),
            api.get('/api/v1/formas-acervo')
          ]);

          const naturezasData = resNat.data.map((n: any) => ({ id: n.id_natureza, label: n.descricao }));
          const bairrosData = resBai.data.map((b: any) => ({ id: b.id_bairro, label: b.nome_bairro }));
          const formasData = resFor.data.map((f: any) => ({ id: f.id_forma_acervo, label: f.descricao }));

          setNaturezas(naturezasData);
          setBairros(bairrosData);
          setFormas(formasData);

          await AsyncStorage.setItem('@SORO:cache_naturezas', JSON.stringify(naturezasData));
          await AsyncStorage.setItem('@SORO:cache_bairros', JSON.stringify(bairrosData));
          await AsyncStorage.setItem('@SORO:cache_formas', JSON.stringify(formasData));
        } else {
          // Offline Fallback
          const cachedNat = await AsyncStorage.getItem('@SORO:cache_naturezas');
          const cachedBai = await AsyncStorage.getItem('@SORO:cache_bairros');
          const cachedFor = await AsyncStorage.getItem('@SORO:cache_formas');

          if (cachedNat) setNaturezas(JSON.parse(cachedNat));
          if (cachedBai) setBairros(JSON.parse(cachedBai));
          if (cachedFor) setFormas(JSON.parse(cachedFor));
        }
      } catch (error) {
        console.log('Erro ao carregar listas:', error);
      }
    };
    loadInitialData();
  }, [isOnline]);

  // Carregar Grupos
  const handleSelectNatureza = async (item: Option) => {
    setValue('naturezaId', item.id);
    setValue('grupoId', ''); 
    setValue('subgrupoId', ''); 
    setLabels(prev => ({ ...prev, natureza: item.label, grupo: '', subgrupo: '' }));
    
    setLoadingList(true);
    const cacheKey = `@SORO:cache_grupos_${item.id}`; 
    try {
       if (isOnline) {
          const res = await api.get('/api/v1/grupos', { params: { naturezaId: item.id } }); // Filtro na query
          const mapped = res.data.map((g: any) => ({ id: g.id_grupo, label: g.descricao_grupo }));
          
          setGrupos(mapped);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
       } else {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) setGrupos(JSON.parse(cached));
       }
    } catch (err) { console.log(err); }
    setLoadingList(false);
  };

  // Carregar Subgrupos 
  const handleSelectGrupo = async (item: Option) => {
    setValue('grupoId', item.id);
    setValue('subgrupoId', '');
    setLabels(prev => ({ ...prev, grupo: item.label, subgrupo: '' }));

    setLoadingList(true);
    const cacheKey = `@SORO:cache_subgrupos_${item.id}`;
    try {
       if (isOnline) {
          const res = await api.get('/api/v1/subgrupos', { params: { grupoId: item.id } }); // Filtro na query
          const mapped = res.data.map((s: any) => ({ id: s.id_subgrupo, label: s.descricao_subgrupo }));
          
          setSubgrupos(mapped);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(mapped));
       } else {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) setSubgrupos(JSON.parse(cached));
       }
    } catch (err) { console.log(err); }
    setLoadingList(false);
  };

  const handleGetLocation = async () => {
    setLoadingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à localização.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Erro', 'Verifique o GPS.');
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await trigger(['naturezaId', 'grupoId', 'subgrupoId']);
    if (step === 2) isValid = await trigger(['bairroId']); 

    if (isValid) setStep(prev => prev + 1);
  };

  const onSubmit = async (data: OcorrenciaFormData) => {
    setLoadingSubmit(true);
    const now = new Date(); 

    const payload = {
      data_acionamento: now.toISOString(),
      hora_acionamento: now.toISOString(),
      id_subgrupo_fk: data.subgrupoId,
      id_bairro_fk: data.bairroId,
      id_forma_acervo_fk: data.formaAcervoId,
      nr_aviso: data.nrAviso || undefined,
      observacoes: data.observacoes, 
      localizacao: {
          logradouro: data.logradouro,
          latitude: location?.coords.latitude || null, 
          longitude: location?.coords.longitude || null
      }
    };

    try {
      if (isOnline) {
        await api.post('/api/v1/ocorrencias', payload);
        Alert.alert("Sucesso!", "Ocorrência enviada.", [{ text: "OK", onPress: () => navigation.navigate('MinhasOcorrencias') }]);
      } else {
        await addToQueue(payload);
        navigation.navigate('MinhasOcorrencias');
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Falha ao processar.";
      Alert.alert("Erro", msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // --- RENDER ---
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>Classificação</Text>
            
            <SelectInput 
              label="Natureza" 
              placeholder="Selecione..." 
              value={labels.natureza} 
              onPress={() => setModalType('natureza')} 
              error={errors.naturezaId?.message}
            />

            <SelectInput 
              label="Grupo" 
              placeholder="Selecione..." 
              value={labels.grupo} 
              onPress={() => setModalType('grupo')} 
              disabled={!watchNatureza} 
              error={errors.grupoId?.message}
            />

            <SelectInput 
              label="Subgrupo" 
              placeholder="Selecione..." 
              value={labels.subgrupo} 
              onPress={() => setModalType('subgrupo')} 
              disabled={!watchGrupo} 
              error={errors.subgrupoId?.message}
            />
            
            {!isOnline && (
              <View style={tw`mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex-row items-start`}>
                 <WifiOff size={20} color="#ca8a04" style={tw`mr-3 mt-1`} />
                 <Text style={tw`flex-1 text-yellow-800 text-xs`}>Modo Offline Ativo. O registro será sincronizado depois.</Text>
              </View>
            )}
          </>
        );
      case 2:
        return (
          <>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>Localização</Text>
            
            <TouchableOpacity 
              style={[tw`py-3 rounded-xl border flex-row items-center justify-center mb-4`, location ? tw`bg-green-50 border-green-200` : tw`bg-blue-50 border-blue-200`]}
              onPress={handleGetLocation}
              disabled={loadingLoc}
            >
               {loadingLoc ? <ActivityIndicator size="small" color="#2563eb" /> : location ? 
                  <><Check size={20} color="#16a34a" style={tw`mr-2`} /><Text style={tw`text-green-700 font-bold`}>GPS OK</Text></> : 
                  <><MapPin size={20} color="#2563eb" style={tw`mr-2`} /><Text style={tw`text-blue-600 font-bold`}>Usar GPS</Text></>
               }
            </TouchableOpacity>

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Município</Text>
              <View style={tw`bg-gray-100 border border-gray-200 rounded-xl p-4 h-14 justify-center`}>
                 <Text style={tw`text-slate-500 font-medium`}>Recife</Text>
              </View>
            </View>

            <SelectInput 
              label="Bairro" 
              placeholder="Selecione..." 
              value={labels.bairro} 
              onPress={() => setModalType('bairro')} 
              error={errors.bairroId?.message}
            />
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Logradouro</Text>
              <Controller
                control={control}
                name="logradouro"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput 
                     style={tw`bg-white border border-gray-300 rounded-xl p-4 text-base text-slate-800 h-14`}
                     placeholder="Ex: Rua dos Navegantes"
                     onBlur={onBlur}
                     onChangeText={onChange}
                     value={value}
                  />
                )}
              />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>Detalhes</Text>

            <SelectInput 
              label="Forma de Acionamento" 
              placeholder="Selecione..." 
              value={labels.forma} 
              onPress={() => setModalType('forma')} 
              error={errors.formaAcervoId?.message}
            />

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Número do Aviso (Opcional)</Text>
              <Controller
                control={control}
                name="nrAviso"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                     style={tw`bg-white border border-gray-300 rounded-xl p-4 text-base text-slate-800 h-14`}
                     placeholder="091"
                     keyboardType="numeric"
                     onChangeText={onChange}
                     value={value}
                  />
                )}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Observações</Text>
              <Controller
                control={control}
                name="observacoes"
                render={({ field: { onChange, value } }) => (
                  <TextInput 
                     style={tw`bg-white border border-gray-300 rounded-xl p-4 text-base text-slate-800 h-32`}
                     placeholder="Detalhes adicionais..."
                     multiline
                     textAlignVertical="top"
                     onChangeText={onChange}
                     value={value}
                  />
                )}
              />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center px-5 py-4 border-b border-gray-100`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
          <ArrowLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-slate-900 ml-2`}>Nova Ocorrência</Text>
      </View>

      <StepIndicator currentStep={step} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`p-6 pb-32`}>
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={tw`absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 shadow-lg`}>
        <TouchableOpacity 
          style={[
            tw`py-4 rounded-xl items-center shadow-sm flex-row justify-center`,
            step === 3 ? tw`bg-[#10B981]` : tw`bg-[#061C43]`
          ]}
          onPress={step < 3 ? handleNextStep : handleSubmit(onSubmit)}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? <ActivityIndicator color="white" /> : (
            <>
              <Text style={tw`text-white font-bold text-base mr-2 uppercase tracking-wider`}>
                {step === 3 ? 'FINALIZAR' : 'PRÓXIMO'}
              </Text>
              <ChevronDown size={20} color="white" style={{ transform: [{ rotate: '-90deg' }] }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modais */}
      <SelectionModal visible={modalType === 'natureza'} title="Natureza" options={naturezas} onClose={() => setModalType(null)} onSelect={handleSelectNatureza} />
      <SelectionModal visible={modalType === 'grupo'} title="Grupo" options={grupos} loading={loadingList} onClose={() => setModalType(null)} onSelect={handleSelectGrupo} />
      <SelectionModal visible={modalType === 'subgrupo'} title="Subgrupo" options={subgrupos} loading={loadingList} onClose={() => setModalType(null)} onSelect={(i) => { setValue('subgrupoId', i.id); setLabels(prev => ({...prev, subgrupo: i.label})); }} />
      <SelectionModal visible={modalType === 'bairro'} title="Bairro" options={bairros} onClose={() => setModalType(null)} onSelect={(i) => { setValue('bairroId', i.id); setLabels(prev => ({...prev, bairro: i.label})); }} />
      <SelectionModal visible={modalType === 'forma'} title="Forma de Acionamento" options={formas} onClose={() => setModalType(null)} onSelect={(i) => { setValue('formaAcervoId', i.id); setLabels(prev => ({...prev, forma: i.label})); }} />
    </SafeAreaView>
  );
};