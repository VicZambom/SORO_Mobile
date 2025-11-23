// src/screens/DetalhePendenteScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, MapPin, Navigation as NavigationIcon } from 'lucide-react-native';
import tw from 'twrnc';

// TIPAGEM DOS DADOS
type RouteParams = {
  DetalhePendente: {
    id: string;
  };
};

export const DetalhePendenteScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'DetalhePendente'>>();
  const insets = useSafeAreaInsets();

  const { id } = route.params || { id: '#AV-2023-092' };

  // --- ESTADO DA TELA MOCKADO ---
  // 'AGUARDANDO' = Tela Vermelha (Pendente)
  // 'DESLOCAMENTO' = Tela Laranja (Em Deslocamento)
  const [statusAtual, setStatusAtual] = useState<'AGUARDANDO' | 'DESLOCAMENTO'>('AGUARDANDO');

  // --- DADOS MOCKADOS ---
  const dadosMock = {
    titulo: 'Resgate de Animal',
    subtitulo: 'Gato preso em árvore (Risco de Queda)',
    descricao: 'Solicitante informa que o animal está a 10m de altura, próximo à fiação elétrica.',
    natureza: 'Resgate',
    prioridade: 'Média',
    horario: '15:20',
    forma: 'Telefone',
    endereco: {
      rua: 'Rua Sá e Souza, 1200',
      cidade: 'Setúbal, Recife - PE',
      referencia: 'Ref: Próximo ao Parque Dona Lindu',
    }
  };

  // --- AÇÕES ---
  const handleBotaoPrincipal = () => {
    if (statusAtual === 'AGUARDANDO') {
      // Ação: Iniciar Deslocamento
      setStatusAtual('DESLOCAMENTO');
      // Aqui futuramente faremos o PATCH na API para mudar status para EM_ANDAMENTO
    } else {
      // Ação: Registrar Chegada
      Alert.alert("Chegada", "Registrar chegada no local? (Próxima etapa)");
      // Futuramente navegaria para a tela de atendimento ou mudaria status
    }
  };

  const handleNavegarMapa = () => {
    console.log('Abrindo mapa...');
  };

  // --- COMPONENTES INTERNOS ---
  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={tw`w-[48%] mb-4`}>
      <Text style={tw`text-xs text-gray-400 mb-0.5`}>{label}</Text>
      <Text style={tw`text-base font-bold text-slate-800`}>{value}</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      
      {/* --- HEADER --- */}
      {/* A cor de fundo muda sutilmente dependendo do status para combinar com a pílula */}
      <View 
        style={[
          tw`pb-6 rounded-b-3xl shadow-sm`,
          { 
            backgroundColor: statusAtual === 'AGUARDANDO' ? '#FECACA' : '#FFEDD5', // Vermelho-claro ou Laranja-claro
            paddingTop: insets.top 
          }
        ]}
      >
        {/* Top Bar */}
        <View style={tw`flex-row items-center justify-between px-6 py-3`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1`}>
            <ArrowLeft color="#1F2937" size={28} />
          </TouchableOpacity>
          
          <Text style={tw`text-lg font-extrabold text-slate-900 tracking-wider`}>
            {id}
          </Text>
          
          <View style={{ width: 28 }} /> 
        </View>

        {/* Status Pill */}
        <View style={tw`items-center mt-1`}>
            <View style={[
                tw`px-5 py-2 rounded-full flex-row items-center shadow-sm`,
                { backgroundColor: statusAtual === 'AGUARDANDO' ? '#DC2626' : '#EA580C' } // Vermelho ou Laranja Escuro
            ]}>
                <View style={tw`w-2 h-2 rounded-full bg-white mr-2`} />
                <Text style={tw`text-white font-bold text-xs uppercase tracking-wide`}>
                    {statusAtual === 'AGUARDANDO' 
                        ? 'PENDENTE • AGUARDANDO EQUIPE' 
                        : 'PENDENTE • EM DESLOCAMENTO'}
                </Text>
            </View>
        </View>
      </View>

      <ScrollView style={tw`flex-1 -mt-4`} contentContainerStyle={tw`px-5 pb-32`}>
        
        {/* --- CARD DETALHES --- */}
        <View style={tw`bg-white rounded-2xl p-6 shadow-md mb-4 border border-gray-100`}>
          <Text style={tw`text-2xl font-black text-slate-900 mb-1`}>{dadosMock.titulo}</Text>
          <Text style={tw`text-base font-semibold text-slate-600 mb-3`}>{dadosMock.subtitulo}</Text>
          
          <View style={tw`h-px bg-gray-100 my-3`} />
          
          <Text style={tw`text-sm text-slate-500 italic leading-relaxed mb-6`}>
            "{dadosMock.descricao}"
          </Text>

          <View style={tw`flex-row flex-wrap justify-between`}>
            <InfoItem label="Natureza" value={dadosMock.natureza} />
            <InfoItem label="Prioridade" value={dadosMock.prioridade} />
            <InfoItem label="Horário" value={dadosMock.horario} />
            <InfoItem label="Forma" value={dadosMock.forma} />
          </View>
        </View>

        {/* --- CARD LOCALIZAÇÃO --- */}
        <View style={tw`bg-white rounded-2xl p-5 shadow-md border border-gray-100`}>
            <View style={tw`flex-row items-start mb-4`}>
                <View style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}>
                    <MapPin color="#EF4444" size={20} />
                </View>
                <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-bold text-slate-900`}>{dadosMock.endereco.rua}</Text>
                    <Text style={tw`text-sm text-slate-500`}>{dadosMock.endereco.cidade}</Text>
                    <Text style={tw`text-xs text-slate-400 mt-1`}>{dadosMock.endereco.referencia}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={tw`bg-blue-50 py-3 rounded-xl border border-blue-100 flex-row items-center justify-center`}
                onPress={handleNavegarMapa}
            >
                <MapPin size={18} color="#3B82F6" style={tw`mr-2`} />
                <Text style={tw`text-blue-500 font-bold text-sm`}>Ir para o mapa</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- FOOTER (Botão Fixo) --- */}
      <View style={[tw`absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-gray-100`, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity 
            style={tw`bg-[#061C43] py-4 rounded-xl shadow-lg flex-row items-center justify-center`}
            onPress={handleBotaoPrincipal}
            activeOpacity={0.9}
        >
            {statusAtual === 'AGUARDANDO' && (
                <NavigationIcon size={20} color="white" style={tw`mr-2`} /> 
                // Ícone de "seta/navegação" para iniciar deslocamento
            )}
            
            <Text style={tw`text-white font-bold text-base tracking-wider uppercase`}>
                {statusAtual === 'AGUARDANDO' ? 'INICIAR DESLOCAMENTO' : 'REGISTRAR CHEGADA'}
            </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default DetalhePendenteScreen;