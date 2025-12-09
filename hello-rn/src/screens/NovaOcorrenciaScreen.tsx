import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ActivityIndicator, Alert, TextInput 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Check, MapPin, WifiOff } from 'lucide-react-native';
import tw from 'twrnc';
import * as Location from 'expo-location';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';
import { AppNavigationProp } from '../types/navigation';
import { useSync } from '../context/SyncContext';
import { COLORS } from '../constants/theme';
import { useCreateOcorrencia } from '../hooks/useOcorrenciaMutations';
import { SelectionModal } from '../components/SelectionModal';
import { StatusModal, StatusModalType } from '../components/StatusModal'; // NOVO IMPORT

const ocorrenciaSchema = z.object({
  naturezaId: z.string().min(1, "Selecione uma natureza"),
  grupoId: z.string().min(1, "Selecione um grupo"),
  subgrupoId: z.string().min(1, "Selecione um subgrupo"),
  bairroId: z.string().min(1, "Selecione o bairro"),
  logradouro: z.string().min(3, "Informe o logradouro ou use o GPS"), 
  formaAcervoId: z.string().min(1, "Selecione a forma de acionamento"),
  nrAviso: z.string().optional(),
  observacoes: z.string().optional(),
});

type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;

interface Option {
  id: string;
  label: string;
}

const SelectInput = ({ label, value, placeholder, onPress, disabled = false, error }: any) => (
  <View style={tw`mb-4`}>
    <Text style={[tw`font-bold mb-2 text-sm`, { color: COLORS.text }]}>{label}</Text>
    <TouchableOpacity 
      style={[
        tw`flex-row justify-between items-center bg-white border rounded-xl p-4 h-14`,
        disabled ? tw`bg-gray-50 border-gray-200` : (error ? tw`border-red-500` : tw`border-gray-300`)
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={value ? [tw`font-medium`, { color: COLORS.text }] : [tw``, { color: COLORS.textLight }]}>
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
        const color = isCompleted || isActive ? COLORS.primary : '#E2E8F0'; 
        
        return (
          <React.Fragment key={step.id}>
            <View style={tw`items-center mx-1`}>
              <View style={[
                tw`w-10 h-10 rounded-full items-center justify-center mb-1 border-2`,
                { backgroundColor: isActive ? color : (isCompleted ? COLORS.success : '#E2E8F0'), borderColor: isCompleted ? COLORS.success : color }
              ]}>
                {isCompleted ? (
                  <Check size={20} color="white" strokeWidth={3} />
                ) : (
                  <Text style={[tw`font-bold text-base`, { color: isActive ? 'white' : COLORS.textLight }]}>{step.id}</Text>
                )}
              </View>
              <Text style={[
                tw`text-xs font-bold`,
                { color: isActive || isCompleted ? COLORS.text : COLORS.textLight }
              ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[tw`w-10 h-1 mb-4 mx-1 rounded-full`, { backgroundColor: isCompleted ? COLORS.success : '#E2E8F0' }]} />
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
  
  // Hook de Mutação 
  const createMutation = useCreateOcorrencia();
  const isSubmitting = createMutation.isPending;

  // --- ESTADO DO STATUS MODAL ---
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'INFO' as StatusModalType,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showStatus = (type: StatusModalType, title: string, msg: string, onConfirm?: () => void) => {
    setStatusModal({
      visible: true,
      type,
      title,
      message: msg,
      onConfirm: onConfirm || (() => setStatusModal(prev => ({ ...prev, visible: false }))),
    });
  };

  const { control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: { logradouro: '', nrAviso: '', observacoes: '' }
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

  const loadNaturezas = async () => {
    try {
      const response = await api.get('/api/v3/naturezas');
      setNaturezas(response.data.map((n: any) => ({ id: n.id_natureza, label: n.descricao })));
    } catch (e) { console.error("Erro ao carregar naturezas", e); }
  };

  const loadBairros = async () => {
    try {
      const response = await api.get('/api/v3/bairros');
      setBairros(response.data.map((b: any) => ({ id: b.id_bairro, label: b.nome_bairro })));
    } catch (e) { console.error("Erro bairros", e); }
  };

  const loadFormas = async () => {
    try {
      const response = await api.get('/api/v3/formas-acervo');
      setFormas(response.data.map((f: any) => ({ id: f.id_forma_acervo, label: f.descricao })));
    } catch (e) { console.error("Erro formas", e); }
  };

  const handleSelectNatureza = async (item: Option) => {
    setValue('naturezaId', item.id);
    setLabels(prev => ({ ...prev, natureza: item.label, grupo: '', subgrupo: '' }));
    setValue('grupoId', '');
    setValue('subgrupoId', '');
    
    setLoadingList(true);
    try {
      const response = await api.get(`/api/v3/grupos/natureza/${item.id}`);
      setGrupos(response.data.map((g: any) => ({ id: g.id_grupo, label: g.descricao_grupo })));
    } catch (e) { console.error(e); } finally { setLoadingList(false); }
  };

  const handleSelectGrupo = async (item: Option) => {
    setValue('grupoId', item.id);
    setLabels(prev => ({ ...prev, grupo: item.label, subgrupo: '' }));
    setValue('subgrupoId', '');

    setLoadingList(true);
    try {
      const response = await api.get(`/api/v3/subgrupos/grupo/${item.id}`);
      setSubgrupos(response.data.map((s: any) => ({ id: s.id_subgrupo, label: s.descricao_subgrupo })));
    } catch (e) { console.error(e); } finally { setLoadingList(false); }
  };

  const handleGetLocation = async () => {
    setLoadingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showStatus('ERROR', 'Permissão Negada', 'Permissão de localização é necessária para pegar o GPS.');
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
      showStatus('ERROR', 'Erro no GPS', 'Não foi possível obter a localização atual.');
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

  const onSubmit = async (data: OcorrenciaFormData) => {
    const payload = {
        nr_aviso: data.nrAviso,
        data_acionamento: new Date().toISOString().split('T')[0],
        hora_acionamento: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        id_subgrupo_fk: data.subgrupoId,
        id_bairro_fk: data.bairroId,
        id_forma_acervo_fk: data.formaAcervoId,
        localizacao: {
            logradouro: data.logradouro,
            referencia_logradouro: '', 
            latitude: location?.coords.latitude,
            longitude: location?.coords.longitude
        },
        observacoes: data.observacoes
    };

    if (isOnline) {
       createMutation.mutate(payload, {
         onSuccess: () => {
            showStatus('SUCCESS', 'Ocorrência Criada', 'O registro foi enviado com sucesso!', () => {
                setStatusModal(prev => ({...prev, visible: false}));
                navigation.navigate('MinhasOcorrencias');
            });
         },
         onError: (error) => {
            showStatus('ERROR', 'Erro ao Criar', 'Falha ao enviar dados para o servidor.');
            console.error(error);
         }
       });
    } else {
        await addToQueue({ type: 'CREATE_OCORRENCIA', payload });
        showStatus('WARNING', 'Modo Offline', 'Ocorrência salva na fila e será enviada quando houver conexão.', () => {
            setStatusModal(prev => ({...prev, visible: false}));
            navigation.navigate('MinhasOcorrencias');
        });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={[tw`text-2xl font-bold mb-6`, { color: COLORS.text }]}>Classificação</Text>
            <SelectInput label="Natureza" placeholder="Selecione..." value={labels.natureza} onPress={() => setModalType('natureza')} error={errors.naturezaId?.message} />
            <SelectInput label="Grupo" placeholder="Selecione..." value={labels.grupo} onPress={() => setModalType('grupo')} disabled={!watchNatureza} error={errors.grupoId?.message} />
            <SelectInput label="Subgrupo" placeholder="Selecione..." value={labels.subgrupo} onPress={() => setModalType('subgrupo')} disabled={!watchGrupo} error={errors.subgrupoId?.message} />
            
            {!isOnline && (
              <View style={tw`mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex-row items-start`}>
                 <WifiOff size={20} color={COLORS.warning} style={tw`mr-3 mt-1`} />
                 <Text style={[tw`flex-1 text-xs`, { color: '#854D0E' }]}>Modo Offline Ativo. O registro será sincronizado depois.</Text>
              </View>
            )}
          </>
        );
      case 2:
        return (
          <>
             <Text style={[tw`text-2xl font-bold mb-6`, { color: COLORS.text }]}>Localização</Text>
             
             <View style={tw`mb-4`}>
                <Text style={[tw`font-bold mb-2 text-sm`, { color: COLORS.text }]}>Coordenadas GPS</Text>
                <TouchableOpacity 
                  style={tw`flex-row items-center justify-center bg-blue-50 border border-blue-100 rounded-xl p-4 h-14`}
                  onPress={handleGetLocation}
                  disabled={loadingLoc}
                >
                  {loadingLoc ? <ActivityIndicator color={COLORS.primary} /> : (
                    <>
                      <MapPin size={20} color={COLORS.primary} style={tw`mr-2`} />
                      <Text style={[tw`font-bold`, { color: COLORS.primary }]}>
                        {location ? 'Atualizar Localização' : 'Pegar Localização Atual'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
             </View>

             <View style={tw`mb-4`}>
               <Text style={[tw`font-bold mb-2 text-sm`, { color: COLORS.text }]}>Logradouro</Text>
               <Controller
                 control={control}
                 name="logradouro"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={[tw`bg-white border rounded-xl p-4 text-base`, errors.logradouro ? tw`border-red-500` : tw`border-gray-300`, { color: COLORS.text }]}
                     placeholder="Rua, Avenida, etc..."
                     value={value}
                     onChangeText={onChange}
                   />
                 )}
               />
               {errors.logradouro && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.logradouro.message}</Text>}
             </View>

             <SelectInput label="Bairro" placeholder="Selecione..." value={labels.bairro} onPress={() => setModalType('bairro')} error={errors.bairroId?.message} />
          </>
        );
      case 3:
        return (
          <>
             <Text style={[tw`text-2xl font-bold mb-6`, { color: COLORS.text }]}>Detalhes</Text>
             <SelectInput label="Forma de Acionamento" placeholder="Selecione..." value={labels.forma} onPress={() => setModalType('forma')} error={errors.formaAcervoId?.message} />
             
             <View style={tw`mb-4`}>
               <Text style={[tw`font-bold mb-2 text-sm`, { color: COLORS.text }]}>Nº do Aviso (Opcional)</Text>
               <Controller
                 control={control}
                 name="nrAviso"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={[tw`bg-white border border-gray-300 rounded-xl p-4 text-base`, { color: COLORS.text }]}
                     placeholder="Ex: 12345"
                     keyboardType="numeric"
                     value={value}
                     onChangeText={onChange}
                   />
                 )}
               />
             </View>

             <View style={tw`mb-4`}>
               <Text style={[tw`font-bold mb-2 text-sm`, { color: COLORS.text }]}>Observações</Text>
               <Controller
                 control={control}
                 name="observacoes"
                 render={({ field: { onChange, value } }) => (
                   <TextInput
                     style={[tw`bg-white border border-gray-300 rounded-xl p-4 text-base h-32`, { color: COLORS.text }]}
                     placeholder="Detalhes adicionais..."
                     multiline
                     textAlignVertical="top"
                     value={value}
                     onChangeText={onChange}
                   />
                 )}
               />
             </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: COLORS.background }]}>
      <StatusModal 
         visible={statusModal.visible}
         type={statusModal.type}
         title={statusModal.title}
         message={statusModal.message}
         onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
         onConfirm={statusModal.onConfirm}
       />

      <View style={tw`flex-row items-center px-5 py-4 border-b border-gray-100`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 -ml-2`}>
          <ArrowLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={[tw`text-lg font-bold ml-2`, { color: COLORS.text }]}>Nova Ocorrência</Text>
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
            { backgroundColor: step === 3 ? COLORS.success : COLORS.primary }
          ]}
          onPress={step < 3 ? handleNextStep : handleSubmit(onSubmit)}
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

      {/* --- SELECTION MODALS (Usando o componente unificado) --- */}
      
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