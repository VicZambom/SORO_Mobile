// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import tw from 'twrnc';
import { User, Clock, Plus } from 'lucide-react-native'; 
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card'; 

// --- DADOS SIMULADOS (MOCK) ---
const ocorrenciaAtual = {
  id: '1',
  codigo: '#AV-2048',
  tipo: 'Incêndio em Residência',
  local: 'Boa Viagem • Rua dos Navegantes, 450',
  horario: '14:35'
};

const filaDeEspera = [
  { id: '2', codigo: '#AV-2047', tipo: 'Resgate de Animal', local: 'Setúbal', status: 'AGUARDANDO' },
  { id: '3', codigo: '#AV-2046', tipo: 'Vazamento de Gás', local: 'Pina', status: 'AGUARDANDO' },
  { id: '4', codigo: '#AV-2045', tipo: 'Acidente de Trânsito', local: 'Boa Viagem', status: 'AGUARDANDO' },
  { id: '5', codigo: '#AV-2044', tipo: 'Queda de Árvore', local: 'Recife Antigo', status: 'AGUARDANDO' },
];

// Tipo das props de navegação
export const DashboardScreen = ({ navigation }: any) => {
  
  // Renderização de cada item da lista de espera
  const renderItem = ({ item }: { item: typeof filaDeEspera[0] }) => (
    <Card 
      style={tw`bg-white border-l-4 border-l-red-500 border-gray-100 shadow-sm p-4 mb-3 rounded-l-none`}
      onPress={() => navigation.navigate('OcorrenciaDetalhe', { id: item.id })}
    >
      <Text style={tw`text-xs font-bold text-slate-500 mb-1`}>{item.codigo}</Text>
      <Text style={tw`text-base font-bold text-slate-800 mb-1`}>{item.tipo}</Text>
      <Text style={tw`text-sm text-slate-500 mb-3`}>{item.local}</Text>
      
      {/* Tag de Status */}
      <View style={tw`self-start bg-red-100 px-3 py-1 rounded-full`}>
        <Text style={tw`text-red-600 text-xs font-bold uppercase`}>{item.status}</Text>
      </View>
    </Card>
  );
  
  const ListHeader = () => (
    <View>
      {/* --- HEADER DA PÁGINA --- */}
      <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
        <Text style={tw`text-2xl font-bold text-slate-900`}>
          Minhas Ocorrências
        </Text>
        <TouchableOpacity 
          style={tw`w-12 h-12 bg-gray-200 rounded-full items-center justify-center`}
          onPress={() => console.log('Perfil')}
        >
          <User color="#475569" size={24} />
        </TouchableOpacity>
      </View>

      {/* --- SEÇÃO: EM ANDAMENTO --- */}
      <View style={tw`mb-8`}>
        <Text style={tw`text-xs font-bold text-slate-500 uppercase mb-2 ml-1`}>
          Em Andamento (Atual)
        </Text>

        <Card 
          style={tw`bg-orange-50 border-orange-200 border shadow-sm p-5`}
          onPress={() => navigation.navigate('OcorrenciaDetalhe', { id: ocorrenciaAtual.id })}
        >
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-sm font-bold text-slate-700`}>
              Ocorrência {ocorrenciaAtual.codigo}
            </Text>
            <View style={tw`flex-row items-center`}>
              <Clock size={14} color="#475569" style={tw`mr-1`} />
              <Text style={tw`text-sm font-medium text-slate-600`}>
                {ocorrenciaAtual.horario}
              </Text>
            </View>
          </View>

          <Text style={tw`text-xl font-bold text-slate-800 mb-1`}>
            {ocorrenciaAtual.tipo}
          </Text>
          <Text style={tw`text-base text-slate-600 leading-snug mb-5`}>
            {ocorrenciaAtual.local}
          </Text>

          <TouchableOpacity 
            style={tw`bg-orange-400 py-3 rounded-lg items-center shadow-sm`}
            onPress={() => navigation.navigate('OcorrenciaDetalhe', { id: ocorrenciaAtual.id })}
          >
            <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>
              Ver Detalhes / Atualizar
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Título da Lista */}
      <Text style={tw`text-xs font-bold text-slate-500 uppercase mb-2 ml-1`}>
        Fila de Espera (Pendentes)
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={tw`flex-1`}>
        <FlatList
          data={filaDeEspera}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-20`} // Espaço extra para o FAB não cobrir o último item
        />

        {/* --- FAB (Floating Action Button) --- */}
        <TouchableOpacity 
          style={tw`absolute bottom-6 right-4 bg-slate-900 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50`}
          onPress={() => navigation.navigate('NovaOcorrencia')}
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};