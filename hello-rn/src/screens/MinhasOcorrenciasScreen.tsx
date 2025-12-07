import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import tw from 'twrnc';
import { User, Clock, Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/SkeletonCard'; // <--- Importei o Skeleton
import { COLORS } from '../constants/theme'; // <--- Importei o Tema

import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AppNavigationProp } from '../types/navigation';
import { useOcorrencias, OcorrenciaAPI } from '../hooks/useOcorrencias';

export const MinhasOcorrencias = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { 
    data: ocorrenciasAndamento, 
    isLoading: loadingAndamento,
    refetch: refetchAndamento 
  } = useOcorrencias('EM_ANDAMENTO', 1);

  const { 
    data: ocorrenciasPendentes, 
    isLoading: loadingPendentes,
    refetch: refetchPendentes,
    isRefetching: isRefetchingPendentes
  } = useOcorrencias('PENDENTE', 20);

  const ocorrenciaAtual = ocorrenciasAndamento?.[0] || null;
  const filaDeEspera = ocorrenciasPendentes || [];
  
  const loading = loadingAndamento || loadingPendentes;

  useFocusEffect(
    useCallback(() => {
      refetchAndamento();
      refetchPendentes();
    }, [])
  );

  useEffect(() => {
    if (!socket) return;
    const atualizarCache = () => queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });

    socket.on('nova_ocorrencia', atualizarCache);
    socket.on('ocorrencia_atualizada', atualizarCache);

    return () => {
      socket.off('nova_ocorrencia');
      socket.off('ocorrencia_atualizada');
    };
  }, [socket, queryClient]);

  const formatarHora = (dataIso: string) => {
    if (!dataIso) return '--:--';
    const date = new Date(dataIso);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: OcorrenciaAPI }) => (
    <Card 
      style={tw`bg-white border-l-4 border-l-[${COLORS.danger}] border-gray-100 shadow-sm p-4 mb-3 rounded-l-none`}
      onPress={() => navigation.navigate('DetalhePendente', { id: item.id_ocorrencia })}
    >
      <View style={tw`flex-row justify-between mb-1`}>
        <Text style={tw`text-xs font-bold text-[${COLORS.textLight}]`}>
          {item.nr_aviso ? `#${item.nr_aviso}` : 'S/N'}
        </Text>
        <Text style={tw`text-xs text-[${COLORS.textLight}]`}>{formatarHora(item.hora_acionamento)}</Text>
      </View>

      <Text style={tw`text-base font-bold text-[${COLORS.text}] mb-1`} numberOfLines={1}>
        {item.subgrupo?.descricao_subgrupo || 'Tipo não informado'}
      </Text>
      
      <Text style={tw`text-sm text-[${COLORS.textLight}] mb-3`}>
        {item.bairro?.nome_bairro || 'Local desconhecido'}
      </Text>
      
      <View style={tw`self-start bg-red-100 px-3 py-1 rounded-full`}>
        <Text style={tw`text-[${COLORS.danger}] text-xs font-bold uppercase`}>AGUARDANDO</Text>
      </View>
    </Card>
  );
  
  // Componente de Loading (Skeleton)
  const LoadingView = () => (
    <View style={tw`pt-2`}>
      {/* Simula o Card de "Em Andamento" */}
      <View style={tw`h-40 bg-gray-200 rounded-xl mb-8 animate-pulse`} />
      
      {/* Simula a lista de pendentes */}
      <Text style={tw`text-xs font-bold text-[${COLORS.textLight}] uppercase mb-2 ml-1`}>
        Carregando lista...
      </Text>
      {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
        <View>
          <Text style={tw`text-2xl font-bold text-[${COLORS.text}]`}>Minhas Ocorrências</Text>
          <Text style={tw`text-sm text-[${COLORS.textLight}]`}>
            {user?.nome ? `Olá, ${user.nome.split(' ')[0]}` : 'Bem-vindo'}
          </Text>
        </View>
        <TouchableOpacity 
          style={tw`w-10 h-10 bg-gray-200 rounded-full items-center justify-center border border-[${COLORS.border}]`}
          onPress={() => navigation.navigate('Perfil')} 
        >
          <User color={COLORS.textLight} size={20} />
        </TouchableOpacity>
      </View>

      {/* Se estiver carregando SÓ os dados iniciais, o Skeleton aparece abaixo no render principal. 
          Aqui renderizamos o conteúdo real se não estiver carregando ou se já tivermos dados. */}
      
      {!loading && (
        <View style={tw`mb-8`}>
          <Text style={tw`text-xs font-bold text-[${COLORS.textLight}] uppercase mb-2 ml-1`}>
            Em Andamento (Atual)
          </Text>

          {ocorrenciaAtual ? (
            <Card 
              style={tw`bg-orange-50 border-orange-200 border shadow-sm p-5`}
              onPress={() => navigation.navigate('DetalheAndamento', { id: ocorrenciaAtual.id_ocorrencia })}
            >
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`text-sm font-bold text-slate-700`}>
                  {ocorrenciaAtual.nr_aviso ? `Aviso ${ocorrenciaAtual.nr_aviso}` : 'Sem Aviso'}
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Clock size={14} color={COLORS.textLight} style={tw`mr-1`} />
                  <Text style={tw`text-sm font-medium text-slate-600`}>
                    {formatarHora(ocorrenciaAtual.hora_acionamento)}
                  </Text>
                </View>
              </View>

              <Text style={tw`text-xl font-bold text-[${COLORS.text}] mb-1`}>
                {ocorrenciaAtual.subgrupo?.descricao_subgrupo}
              </Text>
              <Text style={tw`text-base text-slate-600 leading-snug mb-5`}>
                {ocorrenciaAtual.bairro?.nome_bairro}
              </Text>

              <TouchableOpacity 
                style={tw`bg-[${COLORS.secondary}] py-3 rounded-lg items-center shadow-sm`}
                onPress={() => navigation.navigate('DetalheAndamento', { id: ocorrenciaAtual.id_ocorrencia })}
              >
                <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>
                  Ver Detalhes / Atualizar
                </Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <View style={tw`bg-gray-50 border-dashed border-2 border-[${COLORS.border}] p-6 rounded-xl items-center justify-center`}>
              <Text style={tw`text-[${COLORS.textLight}] text-sm`}>Nenhuma ocorrência em andamento.</Text>
            </View>
          )}
        </View>
      )}

      {!loading && (
        <Text style={tw`text-xs font-bold text-[${COLORS.textLight}] uppercase mb-2 ml-1`}>
          Fila de Espera (Pendentes)
        </Text>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={tw`flex-1`}>
        {loading ? (
          // Exibe o Header estático + Skeletons enquanto carrega
          <>
            <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
              <View>
                <Text style={tw`text-2xl font-bold text-[${COLORS.text}]`}>Minhas Ocorrências</Text>
                <Text style={tw`text-sm text-[${COLORS.textLight}]`}>Carregando...</Text>
              </View>
            </View>
            <LoadingView />
          </>
        ) : (
          <FlatList
            data={filaDeEspera}
            renderItem={renderItem}
            keyExtractor={item => item.id_ocorrencia}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={
              <View style={tw`py-10 items-center`}>
                <Text style={tw`text-[${COLORS.textLight}]`}>Nenhuma ocorrência pendente.</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-24`}
            refreshControl={
              <RefreshControl 
                refreshing={isRefetchingPendentes} 
                onRefresh={() => { refetchAndamento(); refetchPendentes(); }} 
                colors={[COLORS.primary]} // Usando a cor do tema
              />
            }
          />
        )}

        <TouchableOpacity 
          style={tw`absolute bottom-6 right-4 bg-[${COLORS.primary}] w-14 h-14 rounded-full items-center justify-center shadow-lg z-50`}
          onPress={() => navigation.navigate('NovaOcorrencia')}
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};