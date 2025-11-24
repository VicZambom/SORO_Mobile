// src/screens/NovaOcorrenciaScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  ScrollView, Text, View, TouchableOpacity, KeyboardAvoidingView, 
  Platform, Modal, FlatList, ActivityIndicator, Alert, TextInput 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, X, Check, MapPin, WifiOff } from 'lucide-react-native';
import tw from 'twrnc';

import api from '../services/api';
import { AppNavigationProp } from '../types/navigation';

// --- TIPOS ---
interface Option {
  id: string;
  label: string;
}

interface FormData {
  // Etapa 1
  naturezaId: string;
  grupoId: string;
  subgrupoId: string;
  // Etapa 2
  bairroId: string;
  logradouro: string;
  // Etapa 3
  data: Date;
  hora: Date;
  formaAcervoId: string;
  nrAviso: string;
  observacoes: string; // Adicionado
}

// --- COMPONENTES INTERNOS ---

// Modal de Seleção
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

// Input Select
const SelectInput = ({ label, value, placeholder, onPress, disabled = false }: any) => (
  <View style={tw`mb-4`}>
    <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>{label}</Text>
    <TouchableOpacity 
      style={[
        tw`flex-row justify-between items-center bg-white border rounded-xl p-4 h-14`,
        disabled ? tw`bg-gray-50 border-gray-200` : tw`border-gray-300`
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={value ? tw`text-slate-800 font-medium` : tw`text-slate-400`}>
        {value || placeholder}
      </Text>
      <ChevronDown size={20} color={disabled ? "#cbd5e1" : "#64748b"} />
    </TouchableOpacity>
  </View>
);

// Indicador de Passos 
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
  const [step, setStep] = useState(1);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [form, setForm] = useState<FormData>({
    naturezaId: '', grupoId: '', subgrupoId: '',
    bairroId: '', logradouro: '',
    data: new Date(), hora: new Date(),
    formaAcervoId: '', nrAviso: '', observacoes: ''
  });

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

  // Carga Inicial
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [resNat, resBai, resFor] = await Promise.all([
          api.get('/api/v1/naturezas'),
          api.get('/api/v1/bairros'),
          api.get('/api/v1/formas-acervo')
        ]);
        setNaturezas(resNat.data.map((n: any) => ({ id: n.id_natureza, label: n.descricao })));
        setBairros(resBai.data.map((b: any) => ({ id: b.id_bairro, label: b.nome_bairro })));
        setFormas(resFor.data.map((f: any) => ({ id: f.id_forma_acervo, label: f.descricao })));
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao carregar listas. Verifique sua conexão.');
      }
    };
    loadInitialData();
  }, []);

  // Lógica de Cascata
  const handleSelectNatureza = async (item: Option) => {
    setForm(prev => ({ ...prev, naturezaId: item.id, grupoId: '', subgrupoId: '' }));
    setLabels(prev => ({ ...prev, natureza: item.label, grupo: '', subgrupo: '' }));
    
    setLoadingList(true);
    try {
       const res = await api.get('/api/v1/grupos'); 
       const filtered = res.data
         .filter((g: any) => g.id_natureza_fk === item.id)
         .map((g: any) => ({ id: g.id_grupo, label: g.descricao_grupo }));
       setGrupos(filtered);
    } catch (err) { console.log(err); }
    setLoadingList(false);
  };

  const handleSelectGrupo = async (item: Option) => {
    setForm(prev => ({ ...prev, grupoId: item.id, subgrupoId: '' }));
    setLabels(prev => ({ ...prev, grupo: item.label, subgrupo: '' }));

    setLoadingList(true);
    try {
       const res = await api.get('/api/v1/subgrupos'); 
       const filtered = res.data
         .filter((s: any) => s.id_grupo_fk === item.id)
         .map((s: any) => ({ id: s.id_subgrupo, label: s.descricao_subgrupo }));
       setSubgrupos(filtered);
    } catch (err) { console.log(err); }
    setLoadingList(false);
  };

  // Enviar Dados
  const handleSubmit = async () => {
    if (!form.subgrupoId || !form.bairroId || !form.formaAcervoId) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios de todas as etapas.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const payload = {
        data_acionamento: form.data.toISOString(),
        hora_acionamento: form.hora.toISOString(),
        id_subgrupo_fk: form.subgrupoId,
        id_bairro_fk: form.bairroId,
        id_forma_acervo_fk: form.formaAcervoId,
        nr_aviso: form.nrAviso || null,
        // Campos adicionais
        observacoes: form.observacoes, 
        localizacao: {
           logradouro: form.logradouro,
           latitude: -8.0476, // GPS virá
           longitude: -34.8770
        }
      };

      await api.post('/api/v1/ocorrencias', payload);
      
      Alert.alert("Ocorrência Criada!", "Os dados foram enviados com sucesso.", [
        { text: "Voltar ao Início", onPress: () => navigation.navigate('MinhasOcorrencias') }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível criar a ocorrência. Tente novamente.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Conteúdo das Etapas
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>Classificação</Text>
            <SelectInput label="Natureza" placeholder="Selecione..." value={labels.natureza} onPress={() => setModalType('natureza')} />
            <SelectInput label="Grupo" placeholder="Selecione..." value={labels.grupo} onPress={() => setModalType('grupo')} disabled={!form.naturezaId} />
            <SelectInput label="Subgrupo" placeholder="Selecione..." value={labels.subgrupo} onPress={() => setModalType('subgrupo')} disabled={!form.grupoId} />
            
            <View style={tw`mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex-row items-start`}>
               <WifiOff size={20} color="#ca8a04" style={tw`mr-3 mt-1`} />
               <View style={tw`flex-1`}>
                 <Text style={tw`text-yellow-800 font-bold text-sm`}>Modo Offline</Text>
                 <Text style={tw`text-yellow-700 text-xs mt-1`}>Registro será salvo localmente e sincronizado depois.</Text>
               </View>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>Localização</Text>
            
            {/* Botão GPS e Mapa Fake */}
            <TouchableOpacity 
              style={tw`bg-blue-50 py-3 rounded-xl border border-blue-200 flex-row items-center justify-center mb-4`}
              activeOpacity={0.7}
            >
               <MapPin size={20} color="#2563eb" style={tw`mr-2`} />
               <Text style={tw`text-blue-600 font-bold`}>Usar Localização Atual (GPS)</Text>
            </TouchableOpacity>

            <View style={tw`h-40 bg-slate-200 rounded-xl mb-6 border border-slate-300 items-center justify-center overflow-hidden`}>
               {/* Aqui viria o <MapView /> */}
               <MapPin size={40} color="#94a3b8" />
               <View style={tw`bg-white px-3 py-1 rounded-full shadow mt-2`}>
                  <Text style={tw`text-xs font-bold text-slate-700`}>Boa Viagem, Recife</Text>
               </View>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Município</Text>
              <View style={tw`bg-gray-100 border border-gray-200 rounded-xl p-4 h-14 justify-center`}>
                 <Text style={tw`text-slate-500 font-medium`}>Recife</Text>
              </View>
            </View>

            <SelectInput label="Bairro" placeholder="Selecione..." value={labels.bairro} onPress={() => setModalType('bairro')} />
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Logradouro</Text>
              <TextInput 
                 style={tw`bg-white border border-gray-300 rounded-xl p-4 text-base text-slate-800 h-14`}
                 placeholder="Ex: Rua dos Navegantes, 450"
                 value={form.logradouro}
                 onChangeText={t => setForm(prev => ({...prev, logradouro: t}))}
              />
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>Detalhes</Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Data do Acionamento</Text>
              <View style={tw`bg-gray-100 border border-gray-200 rounded-xl p-4 h-14 justify-center`}>
                 <Text style={tw`text-slate-800 font-medium`}>{form.data.toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Hora do Acionamento</Text>
              <View style={tw`bg-gray-100 border border-gray-200 rounded-xl p-4 h-14 justify-center`}>
                 <Text style={tw`text-slate-800 font-medium`}>{form.hora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</Text>
              </View>
            </View>

            <SelectInput label="Forma de Acionamento" placeholder="Selecione..." value={labels.forma} onPress={() => setModalType('forma')} />

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Número do Aviso (Opcional)</Text>
              <TextInput 
                 style={tw`bg-white border border-gray-300 rounded-xl p-4 text-base text-slate-800 h-14`}
                 placeholder="091"
                 keyboardType="numeric"
                 value={form.nrAviso}
                 onChangeText={t => setForm(prev => ({...prev, nrAviso: t}))}
              />
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Observações Iniciais</Text>
              <TextInput 
                 style={tw`bg-white border border-gray-300 rounded-xl p-4 text-base text-slate-800 h-32`}
                 placeholder="Descreva informações adicionais sobre o acionamento..."
                 multiline
                 textAlignVertical="top"
                 value={form.observacoes}
                 onChangeText={t => setForm(prev => ({...prev, observacoes: t}))}
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
            step === 3 ? tw`bg-[#10B981]` : tw`bg-[#061C43]` // Verde Vibrante ou Azul Escuro
          ]}
          onPress={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? <ActivityIndicator color="white" /> : (
            <>
              <Text style={tw`text-white font-bold text-base mr-2 uppercase tracking-wider`}>
                {step === 3 ? 'FINALIZAR CADASTRO' : 'PRÓXIMO'}
              </Text>
              <ChevronDown size={20} color="white" style={{ transform: [{ rotate: '-90deg' }] }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modais */}
      <SelectionModal visible={modalType === 'natureza'} title="Natureza" options={naturezas} onClose={() => setModalType(null)} onSelect={handleSelectNatureza} />
      <SelectionModal visible={modalType === 'grupo'} title="Grupo" options={grupos} loading={loadingList} onClose={() => setModalType(null)} onSelect={handleSelectGrupo} />
      <SelectionModal visible={modalType === 'subgrupo'} title="Subgrupo" options={subgrupos} loading={loadingList} onClose={() => setModalType(null)} onSelect={(i) => { setForm(prev => ({...prev, subgrupoId: i.id})); setLabels(prev => ({...prev, subgrupo: i.label})); }} />
      <SelectionModal visible={modalType === 'bairro'} title="Bairro" options={bairros} onClose={() => setModalType(null)} onSelect={(i) => { setForm(prev => ({...prev, bairroId: i.id})); setLabels(prev => ({...prev, bairro: i.label})); }} />
      <SelectionModal visible={modalType === 'forma'} title="Forma de Acionamento" options={formas} onClose={() => setModalType(null)} onSelect={(i) => { setForm(prev => ({...prev, formaAcervoId: i.id})); setLabels(prev => ({...prev, forma: i.label})); }} />
    </SafeAreaView>
  );
};