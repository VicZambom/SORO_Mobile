// src/screens/OcorrenciaListaScreen.tsx

import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

// Componentes Requeridos (Padrão Obrigatório)
import { ScreenWrapper } from '../components/ScreenWrapper'; // 1. Importe o Wrapper 
import { Header } from '../components/Header'; // 2. Importe o Header 
import { Card } from '../components/Card'; // Use o componente Card 

// Tipagem Requerida
import { AppNavigationProp } from '../types/navigation'; // Importe a tipagem 

// --- SIMULAÇÃO DE DADOS E API ---
interface Ocorrencia {
  id: string;
  codigo: string;
  tipo: string;
  status: 'PENDENTE' | 'EM ANDAMENTO';
  local: string;
  dataHora: string;
}

const api = {
  get: (url: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            // Ocorrência Atual (EM ANDAMENTO)
            { id: '1', codigo: '#AV-2050', tipo: 'Incêndio em Residência', status: 'EM ANDAMENTO', local: 'Boa Viagem • Rua dos Navegantes, 450', dataHora: '14:35' },
            // Ocorrências Pendentes (Fila de Espera)
            { id: '2', codigo: '#AV-2047', tipo: 'Resgate de Animal', status: 'PENDENTE', local: 'Setúbal', dataHora: '10:00' },
            { id: '3', codigo: '#AV-2046', tipo: 'Vazamento de Gás', status: 'PENDENTE', local: 'Pina', dataHora: '11:20' },
            { id: '4', codigo: '#AV-2045', tipo: 'Acidente de Trânsito', status: 'PENDENTE', local: 'Boa Viagem', dataHora: '12:45' },
            { id: '5', codigo: '#AV-2044', tipo: 'Queda de Árvore', status: 'PENDENTE', local: 'Recife Antigo', dataHora: '13:55' },
          ],
        });
      }, 1000);
    });
  },
};

// --- COMPONENTE DE TAG DE STATUS ---
const StatusTag = ({ status }: { status: 'PENDENTE' | 'EM ANDAMENTO' }) => {
  const colorClass = status === 'PENDENTE' ? 'bg-red-100 border border-red-400' : 'bg-red-600';
  const textClass = status === 'PENDENTE' ? 'text-red-600' : 'text-white';
  
  return (
    <View style={tw`py-0.5 px-2 rounded-lg ${colorClass}`}>
      <Text style={tw`text-xs font-bold uppercase ${textClass}`}>{status === 'PENDENTE' ? 'AGUARDANDO' : 'EM ANDAMENTO'}</Text>
    </View>
  );
};


// --- TELA PRINCIPAL ---
export const OcorrenciaListaScreen = () => {
  // Use useNavigation<AppNavigationProp>() [cite: 28, 26]
  const navigation = useNavigation<AppNavigationProp>();
  
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  const ocorrenciaAtual = ocorrencias.find(item => item.status === 'EM ANDAMENTO');
  const filaDeEspera = ocorrencias.filter(item => item.status === 'PENDENTE');

  // Ação: Ao carregar a tela, faça api.get('/ocorrencias') 
  useEffect(() => {
    async function fetchOcorrencias() {
      try {
        setLoading(true);
        // @ts-ignore
        const response = await api.get('/ocorrencias'); 
        // @ts-ignore
        setOcorrencias(response.data); 
      } catch (error) {
        console.error('Erro ao buscar ocorrências:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOcorrencias();
  }, []);

  const handlePressCard = (id: string) => {
    // Clique: Ao clicar no Card, navegue para Ocorrencia Detalhe [cite: 50]
    navigation.navigate('OcorrenciaDetalhe', { id }); 
  };

  // Renderização dos itens da FILA DE ESPERA
  const renderItem = ({ item }: { item: Ocorrencia }) => (
    // Para cada item, use o componente Card 
    <TouchableOpacity onPress={() => handlePressCard(item.id)} style={tw`mb-4`}>
      <Card style={tw`flex-row p-4 items-center border-l-4 border-red-500 bg-white shadow-md`}>
        <View style={tw`flex-1`}>
          {/* Conteúdo do Card: Mostre ID, Tipo e Status [cite: 49] */}
          <Text style={tw`text-sm font-bold text-slate-900`}>{item.codigo}</Text>
          <Text style={tw`text-base font-semibold text-slate-800 mt-1`}>{item.tipo}</Text>
          <Text style={tw`text-sm text-slate-600 mb-2`}>{item.local}</Text>
          <StatusTag status={item.status} />
        </View>
        {/* Ícone de Navegação (não necessário no novo layout, mas mantido para referência) */}
      </Card>
    </TouchableOpacity>
  );

  return (
    // Padrão Obrigatório: Usar ScreenWrapper [cite: 17]
    <ScreenWrapper>
      {/* Padrão Obrigatório: Header com título */}
      {/* Note: O Header no protótipo não tem fundo e mostra o avatar (ajustado aqui) */}
      <View style={tw`pt-4 pb-2 px-4 flex-row justify-between items-center bg-white border-b border-gray-100`}>
        <Text style={tw`text-xl font-bold text-slate-800`}>Minhas Ocorrências</Text>
        {/* Simulação do Avatar */}
        <View style={tw`w-8 h-8 rounded-full bg-gray-300 border border-gray-400 items-center justify-center`}>
          <Text style={tw`text-sm text-white`}>👤</Text>
        </View>
      </View>


      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          // Layout: Use FlatList 
          data={filaDeEspera}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={tw`p-4`}
          ListHeaderComponent={() => (
            <>
              {/* === 1. CARD EM ANDAMENTO (ATUAL) === */}
              {ocorrenciaAtual && (
                <View style={tw`mb-6`}>
                  <Text style={tw`text-sm font-bold text-slate-600 mb-2`}>EM ANDAMENTO (ATUAL)</Text>
                  <Card style={tw`p-4 bg-orange-50 border border-orange-200 shadow-lg`}>
                    <View style={tw`flex-row justify-between items-center mb-1`}>
                      <Text style={tw`text-base font-bold text-slate-900`}>Ocorrência {ocorrenciaAtual.codigo}</Text>
                      <Text style={tw`text-sm text-slate-600`}>⏰ {ocorrenciaAtual.dataHora}</Text>
                    </View>
                    <Text style={tw`text-lg font-semibold text-slate-800`}>{ocorrenciaAtual.tipo}</Text>
                    <Text style={tw`text-sm text-slate-600 mb-4`}>{ocorrenciaAtual.local}</Text>
                    
                    {/* Botão VER DETALHES / ATUALIZAR */}
                    <TouchableOpacity 
                      style={tw`py-2 rounded-lg bg-orange-500 items-center mt-2`}
                      onPress={() => handlePressCard(ocorrenciaAtual.id)}
                    >
                      <Text style={tw`text-white font-bold`}>VER DETALHES / ATUALIZAR</Text>
                    </TouchableOpacity>
                  </Card>
                </View>
              )}
              
              {/* === 2. FILA DE ESPERA (PENDENTES) === */}
              <Text style={tw`text-sm font-bold text-slate-600 mb-4`}>FILA DE ESPERA (PENDENTES)</Text>
            </>
          )}
          ListEmptyComponent={
            <Text style={tw`text-center text-slate-600 mt-10`}>Nenhuma ocorrência pendente na fila.</Text>
          }
        />
      )}
      
      {/* Botão de Adicionar (+) [Para a Nova Ocorrência da Maíra] */}
      <TouchableOpacity 
        style={tw`absolute bottom-6 right-6 w-14 h-14 bg-slate-900 rounded-full items-center justify-center shadow-lg`}
        onPress={() => navigation.navigate('NovaOcorrencia')} 
      >
        <Text style={tw`text-white text-3xl font-light`}>+</Text>
      </TouchableOpacity>
      
    </ScreenWrapper>
  );
};