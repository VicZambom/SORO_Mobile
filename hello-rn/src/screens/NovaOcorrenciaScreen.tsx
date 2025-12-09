import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ActivityIndicator, TextInput 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Check, MapPin, WifiOff } from 'lucide-react-native';
import tw from 'twrnc';
import * as Location from 'expo-location';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import api from '../services/api';
import { AppNavigationProp } from '../types/navigation';
import { useSync } from '../context/SyncContext';
import { useTheme } from '../context/ThemeContext';
import { useCreateOcorrencia } from '../hooks/useOcorrenciaMutations';
import { SelectionModal } from '../components/SelectionModal';
import { StatusModal, StatusModalType } from '../components/StatusModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Schema de validação
const ocorrenciaSchema = z.object({
  naturezaId: z.string().min(1, "Selecione uma natureza"),
  grupoId: z.string().min(1, "Selecione um grupo"),
  subgrupoId: z.string().min(1, "Selecione um subgrupo"),
  bairroId: z.string().min(1, "Selecione o bairro"),
  logradouro: z.string().min(1, "Informe o logradouro").min(3, "Endereço muito curto"), 
  formaAcervoId: z.string().min(1, "Selecione a forma de acionamento"),
  nrAviso: z.string().optional(),
  observacoes: z.string().optional(),
});

type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;

interface Option {
  id: string;
  label: string;
}

const SelectInput = ({ label, value, placeholder, onPress, disabled = false, error }: any) => {
  const { colors } = useTheme();
  return (
    <View style={tw`mb-4`}>
      <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity 
        style={[
          tw`flex-row justify-between items-center border rounded-xl p-4 h-14`,
          { 
            backgroundColor: colors.surface, 
            borderColor: error ? colors.danger : colors.border 
          }
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={value ? [tw`font-medium`, { color: colors.text }] : [tw``, { color: colors.textLight }]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={disabled ? colors.border : colors.textLight} />
      </TouchableOpacity>
      {error && <Text style={[tw`text-xs mt-1`, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Tipo' },
    { id: 2, label: 'Local' },
    { id: 3, label: 'Detalhes' },
  ];
  const { colors } = useTheme();

  return (
    <View style={[tw`flex-row justify-center items-center py-6`, { backgroundColor: colors.surface }]}> 
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const color = isCompleted || isActive ? colors.primary : colors.border; 
        
        return (
          <React.Fragment key={step.id}>
            <View style={tw`items-center mx-1`}>
              <View style={[
                tw`w-10 h-10 rounded-full items-center justify-center mb-1 border-2`,
                { 
                    backgroundColor: isActive ? color : (isCompleted ? colors.success : colors.border), 
                    borderColor: isCompleted ? colors.success : color 
                }
              ]}>
                {isCompleted ? (
                  <Check size={20} color="white" strokeWidth={3} />
                ) : (
                  <Text style={[tw`font-bold text-base`, { color: isActive ? 'white' : colors.textLight }]}>{step.id}</Text>
                )}
              </View>
              <Text style={[
                tw`text-xs font-bold`,
                { color: isActive || isCompleted ? colors.text : colors.textLight }
              ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[tw`w-10 h-1 mb-4 mx-1 rounded-full`, { backgroundColor: isCompleted ? colors.success : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export const NovaOcorrenciaScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { isOnline, addToQueue } = useSync();
  const [step, setStep] = useState(1);
  const { colors } = useTheme(); 
  
  const createMutation = useCreateOcorrencia();
  const isSubmitting = createMutation.isPending;

  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'INFO' as StatusModalType,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: undefined as string | undefined,
    onConfirm: () => {},
  });

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

  const { control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: { logradouro: '', nrAviso: '', observacoes: '' },
    shouldUnregister: false, // Mantém dados mesmo escondidos
  });

  const watchNatureza = watch('naturezaId');
  const watchGrupo = watch('grupoId');

  const [labels, setLabels] = useState({ natureza: '', grupo: '', subgrupo: '', bairro: '', forma: '' });
  const [naturezas, setNaturezas] = useState<Option[]>([]);
  const [grupos, setGrupos] = useState<Option[]>([]);
  const [subgrupos, setSubgrupos] = useState<Option[]>([]);
  const [bairros, setBairros] = useState<Option[]>([]);
  const [formas, setFormas] = useState<Option[]>([]);

  const [modalType, setModalType] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    loadNaturezas();
    loadBairros();
    loadFormas();
  }, []);

  // --- FUNÇÕES DE CARREGAMENTO COM CACHE (OFFLINE) ---

  const loadDataWithCache = async (
    key: string, 
    apiCall: () => Promise<any>, 
    setState: (data: Option[]) => void, 
    mapFn: (item: any) => Option
  ) => {
    try {
      // 1. Tenta buscar da API (Online)
      const response = await apiCall();
      const mappedData = response.data.map(mapFn);
      
      setState(mappedData);
      
      // 2. Salva no cache para uso futuro
      await AsyncStorage.setItem(key, JSON.stringify(mappedData));
      
    } catch (error) {
      console.log(`[Offline] Carregando ${key} do cache...`);
      
      // 3. Se deu erro (Offline), tenta ler do cache
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        setState(JSON.parse(cached));
      } else {
        // Se não tem cache nem internet, mostra erro (opcional)
        // showStatus('WARNING', 'Sem Dados', `Não foi possível carregar ${key} offline.`);
      }
    }
  };

  const loadNaturezas = () => loadDataWithCache(
    '@SORO:cache_naturezas',
    () => api.get('/api/v3/naturezas'),
    setNaturezas,
    (n: any) => ({ id: n.id_natureza, label: n.descricao })
  );

  const loadBairros = () => loadDataWithCache(
    '@SORO:cache_bairros',
    () => api.get('/api/v3/bairros'),
    setBairros,
    (b: any) => ({ id: b.id_bairro, label: b.nome_bairro })
  );

  const loadFormas = () => loadDataWithCache(
    '@SORO:cache_formas',
    () => api.get('/api/v3/formas-acervo'),
    setFormas,
    (f: any) => ({ id: f.id_forma_acervo, label: f.descricao })
  );

  const handleSelectNatureza = async (item: Option) => {
    setValue('naturezaId', item.id);
    setLabels(prev => ({ ...prev, natureza: item.label, grupo: '', subgrupo: '' }));
    setValue('grupoId', '');
    setValue('subgrupoId', '');
    
    setLoadingList(true);
    
    // Cache específico para esta natureza
    const cacheKey = `@SORO:cache_grupos_${item.id}`;
    
    await loadDataWithCache(
      cacheKey,
      () => api.get('/api/v3/grupos', { params: { naturezaId: item.id } }),
      setGrupos,
      (g: any) => ({ id: g.id_grupo, label: g.descricao_grupo })
    ).finally(() => setLoadingList(false));
  };

  const handleSelectGrupo = async (item: Option) => {
    setValue('grupoId', item.id);
    setLabels(prev => ({ ...prev, grupo: item.label, subgrupo: '' }));
    setValue('subgrupoId', '');

    setLoadingList(true);

    // Cache específico para este grupo
    const cacheKey = `@SORO:cache_subgrupos_${item.id}`;

    await loadDataWithCache(
      cacheKey,
      () => api.get('/api/v3/subgrupos', { params: { grupoId: item.id } }),
      setSubgrupos,
      (s: any) => ({ id: s.id_subgrupo, label: s.descricao_subgrupo })
    ).finally(() => setLoadingList(false));
  };

  const handleGetLocation = async () => {
    setLoadingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showStatus('ERROR', 'Permissão Negada', 'Necessário acesso à localização.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      if (address) {
        const fullAddress = `${address.street || ''}, ${address.subregion || ''}`;
        setValue('logradouro', fullAddress);
      }
    } catch (error) {
      showStatus('ERROR', 'Erro no GPS', 'Não foi possível obter localização.');
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await trigger(['naturezaId', 'grupoId', 'subgrupoId']);
    if (step === 2) isValid = await trigger(['bairroId', 'logradouro']);
    
    if (isValid) setStep(prev => prev + 1);
  };

  const onInvalid = (errors: any) => {
    console.log("Erros de validação:", errors);
    const firstErrorKey = Object.keys(errors)[0];
    const errorMessage = errors[firstErrorKey]?.message || "Verifique os campos obrigatórios.";
    showStatus('WARNING', 'Campos Pendentes', errorMessage);
  };

  const onSubmit = async (data: OcorrenciaFormData) => {
    const now = new Date();
    
    const payload = {
        nr_aviso: data.nrAviso || undefined,
        data_acionamento: now.toISOString(),
        hora_acionamento: now.toISOString(),
        id_subgrupo_fk: data.subgrupoId,
        id_bairro_fk: data.bairroId,
        id_forma_acervo_fk: data.formaAcervoId,
        localizacao: {
            logradouro: data.logradouro,
            referencia_logradouro: undefined,
            latitude: location?.coords.latitude || undefined,
            longitude: location?.coords.longitude || undefined
        },
        observacoes: data.observacoes || undefined
    };

    showStatus(
      'WARNING',
      'Confirmar Ocorrência',
      'Deseja realmente criar esta ocorrência?',
      () => {
        setStatusModal(prev => ({ ...prev, visible: false }));
        enviarOcorrencia(payload);
      },
      'Cancelar',
      'Confirmar'
    );
  };

  const enviarOcorrencia = async (payload: any) => {
    if (isOnline) {
       createMutation.mutate(payload, {
         onSuccess: () => {
            showStatus('SUCCESS', 'Sucesso!', 'Ocorrência registrada.', () => {
                setStatusModal(prev => ({...prev, visible: false}));
                navigation.navigate('MinhasOcorrencias');
            });
         },
         onError: (error: any) => {
            console.error("Erro API:", error.response?.data || error);
            const msg = error.response?.data?.message || 'Erro no servidor.';
            showStatus('ERROR', 'Erro ao Criar', msg);
         }
       });
    } else {
        await addToQueue(payload); 

        showStatus('WARNING', 'Modo Offline', 'Salvo na fila de sincronização.', () => {
        setStatusModal(prev => ({...prev, visible: false}));
        navigation.navigate('MinhasOcorrencias');
    });
    }
  };

  // RENDERIZAÇÃO ALTERADA PARA USAR 'display: none' E MANTER O FORMULÁRIO MONTADO
  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
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

        <View style={[tw`flex-row items-center px-5 py-4`, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[tw`text-2xl font-bold ml-2`, { color: colors.text }]}>Nova Ocorrência</Text>
      </View>

      <StepIndicator currentStep={step} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`p-6 pb-32`}>
          
          {/* PASSO 1: Classificação */}
          <View style={{ display: step === 1 ? 'flex' : 'none' }}>
            <Text style={[tw`text-2xl font-bold mb-6`, { color: colors.text }]}>Classificação</Text>
            <SelectInput label="Natureza" placeholder="Selecione..." value={labels.natureza} onPress={() => setModalType('natureza')} error={errors.naturezaId?.message} />
            <SelectInput label="Grupo" placeholder="Selecione..." value={labels.grupo} onPress={() => setModalType('grupo')} disabled={!watchNatureza} error={errors.grupoId?.message} />
            <SelectInput label="Subgrupo" placeholder="Selecione..." value={labels.subgrupo} onPress={() => setModalType('subgrupo')} disabled={!watchGrupo} error={errors.subgrupoId?.message} />
            
            {!isOnline && (
              <View style={[tw`mt-4 p-4 rounded-xl flex-row items-start`, { backgroundColor: colors.warning + '20' }]}>
                 <WifiOff size={20} color={colors.warning} style={tw`mr-3 mt-1`} />
                 <Text style={[tw`flex-1 text-xs`, { color: colors.warning }]}>Modo Offline Ativo.</Text>
              </View>
            )}
          </View>

          {/* PASSO 2: Localização (O Input problemático está aqui) */}
          <View style={{ display: step === 2 ? 'flex' : 'none' }}>
             <Text style={[tw`text-2xl font-bold mb-6`, { color: colors.text }]}>Localização</Text>
             
             <View style={tw`mb-4`}>
                <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Coordenadas GPS</Text>
                <TouchableOpacity 
                  style={[
                      tw`flex-row items-center justify-center rounded-xl p-4 h-14`, 
                      { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }
                  ]}
                  onPress={handleGetLocation}
                  disabled={loadingLoc}
                >
                  {loadingLoc ? <ActivityIndicator color={colors.primary} /> : (
                    <>
                      <MapPin size={20} color={colors.primary} style={tw`mr-2`} />
                      <Text style={[tw`font-bold`, { color: colors.primary }]}>
                        {location ? 'Atualizar Localização' : 'Pegar Localização Atual'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
             </View>

             <View style={tw`mb-4`}>
               <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Logradouro</Text>
               <Controller
                 control={control}
                 name="logradouro"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={[
                         tw`rounded-xl p-4 text-base`, 
                         { 
                             backgroundColor: colors.surface, 
                             borderWidth: 1, 
                             borderColor: errors.logradouro ? colors.danger : colors.border, 
                             color: colors.text 
                         }
                     ]}
                     placeholder="Rua, Avenida, etc..."
                     placeholderTextColor={colors.textLight}
                     value={value}
                     onChangeText={onChange}
                   />
                 )}
               />
               {errors.logradouro && <Text style={[tw`text-xs mt-1`, { color: colors.danger }]}>{errors.logradouro.message}</Text>}
             </View>

             <SelectInput label="Bairro" placeholder="Selecione..." value={labels.bairro} onPress={() => setModalType('bairro')} error={errors.bairroId?.message} />
          </View>

          {/* PASSO 3: Detalhes */}
          <View style={{ display: step === 3 ? 'flex' : 'none' }}>
             <Text style={[tw`text-2xl font-bold mb-6`, { color: colors.text }]}>Detalhes</Text>
             <SelectInput label="Forma de Acionamento" placeholder="Selecione..." value={labels.forma} onPress={() => setModalType('forma')} error={errors.formaAcervoId?.message} />
             
             <View style={tw`mb-4`}>
               <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Nº do Aviso (Opcional)</Text>
               <Controller
                 control={control}
                 name="nrAviso"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={[
                         tw`rounded-xl p-4 text-base`, 
                         { backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }
                     ]}
                     placeholder="Ex: 12345"
                     placeholderTextColor={colors.textLight}
                     keyboardType="numeric"
                     value={value}
                     onChangeText={onChange}
                   />
                 )}
               />
             </View>

             <View style={tw`mb-4`}>
               <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Observações</Text>
               <Controller
                 control={control}
                 name="observacoes"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={[
                         tw`rounded-xl p-4 text-base h-32`, 
                         { backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.border }
                     ]}
                     placeholder="Detalhes adicionais..."
                     placeholderTextColor={colors.textLight}
                     multiline
                     textAlignVertical="top"
                     value={value}
                     onChangeText={onChange}
                   />
                 )}
               />
             </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[tw`absolute bottom-0 left-0 right-0 p-5`, { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            tw`py-4 rounded-xl items-center shadow-sm flex-row justify-center`,
            { backgroundColor: step === 3 ? colors.success : colors.primary }
          ]}
          onPress={step < 3 ? handleNextStep : handleSubmit(onSubmit, onInvalid)}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="white" /> : (
            <>
              <Text style={tw`text-white font-bold text-base mr-2 uppercase tracking-wider`}>
                {step === 3 ? 'FINALIZAR' : 'PRÓXIMO'}
              </Text>
              <ChevronDown size={20} color="white" style={{ transform: [{ rotate: '-90deg' }] }} />
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* MODAIS (MANTIDOS) */}
      <SelectionModal 
        visible={modalType === 'natureza'} 
        title="Natureza" 
        options={naturezas} 
        onClose={() => setModalType(null)} 
        onSelect={handleSelectNatureza} 
      />
      <SelectionModal 
        visible={modalType === 'grupo'} 
        title="Grupo" 
        options={grupos} 
        loading={loadingList} 
        onClose={() => setModalType(null)} 
        onSelect={handleSelectGrupo} 
      />
      <SelectionModal 
        visible={modalType === 'subgrupo'} 
        title="Subgrupo" 
        options={subgrupos} 
        loading={loadingList} 
        onClose={() => setModalType(null)} 
        onSelect={(i) => { setValue('subgrupoId', i.id); setLabels(prev => ({...prev, subgrupo: i.label})); }} 
      />
      <SelectionModal 
        visible={modalType === 'bairro'} 
        title="Bairro" 
        options={bairros} 
        onClose={() => setModalType(null)} 
        onSelect={(i) => { setValue('bairroId', i.id); setLabels(prev => ({...prev, bairro: i.label})); }} 
      />
      <SelectionModal 
        visible={modalType === 'forma'} 
        title="Forma de Acionamento" 
        options={formas} 
        onClose={() => setModalType(null)} 
        onSelect={(i) => { setValue('formaAcervoId', i.id); setLabels(prev => ({...prev, forma: i.label})); }} 
      />

    </SafeAreaView>
  );
};