import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import tw from 'twrnc';
import { User, Clock, Plus, CloudOff } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/SkeletonCard'; 
import { useTheme } from '../context/ThemeContext'; 

import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSync } from '../context/SyncContext';
import { AppNavigationProp } from '../types/navigation';
import { useOcorrencias, OcorrenciaAPI } from '../hooks/useOcorrencias';

export const MinhasOcorrencias = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { pendingQueue, isOnline } = useSync();
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

  const OfflineBanner = () => {
  if (pendingQueue.length === 0) return null;

  return (
    <TouchableOpacity 
      style={[tw`px-4 py-3 mb-4 rounded-lg flex-row items-center`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Perfil')}
    >
      <CloudOff size={20} color={colors.danger} style={tw`mr-3`} />
      <View style={tw`flex-1`}>
        <Text style={[tw`font-bold text-xs uppercase`, { color: colors.text }]}>
          Sincronização Pendente
        </Text>
        <Text style={[tw`text-xs`, { color: colors.textLight }]}> 
          {pendingQueue.length} ocorrência(s) aguardando conexão.
        </Text>
      </View>
      <Text style={[tw`font-bold text-xs`, { color: colors.primary }]}>Ver</Text>
    </TouchableOpacity>
  );
};

  const formatarHora = (dataIso: string) => {
    if (!dataIso) return '--:--';
    const date = new Date(dataIso);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: OcorrenciaAPI }) => (
    <Card 
      style={[{ backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: colors.danger, padding: 16, marginBottom: 12 }]}
      onPress={() => navigation.navigate('DetalhePendente', { id: item.id_ocorrencia })}
    >
      <View style={tw`flex-row justify-between mb-1`}>
        <Text style={[{ fontSize: 12, fontWeight: '700', color: colors.textLight }]}>
          {item.nr_aviso ? `#${item.nr_aviso}` : 'S/N'}
        </Text>
        <Text style={[{ fontSize: 12, color: colors.textLight }]}>{formatarHora(item.hora_acionamento)}</Text>
      </View>

      <Text style={[{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 }]} numberOfLines={1}>
        {item.subgrupo?.descricao_subgrupo || 'Tipo não informado'}
      </Text>
      
      <Text style={[{ fontSize: 14, color: colors.textLight, marginBottom: 12 }]}>
        {item.bairro?.nome_bairro || 'Local desconhecido'}
      </Text>
      
      <View style={[{ backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start' }]}>
        <Text style={[{ color: colors.danger, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }]}>AGUARDANDO</Text>
      </View>
    </Card>
  );
  
  // Componente de Loading (Skeleton)
  const LoadingView = () => (
    <View style={tw`pt-2`}>
      {/* Simula o Card de "Em Andamento" */}
      <View style={tw`h-40 bg-gray-200 rounded-xl mb-8 animate-pulse`} />
      
      {/* Simula a lista de pendentes */}
      <Text style={[tw`text-xs font-bold uppercase mb-2 ml-1`, { color: colors.textLight }]}>
        Carregando lista...
      </Text>
      {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
        <View>
          <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Minhas Ocorrências</Text>
          <Text style={[tw`text-sm`, { color: colors.textLight }]}>
            {user?.nome ? `Olá, ${user.nome.split(' ')[0]}` : 'Bem-vindo'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Perfil')} 
        >
          <User color={colors.textLight} size={20} />
        </TouchableOpacity>
      </View>

      {/* Se estiver carregando SÓ os dados iniciais, o Skeleton aparece abaixo no render principal. 
          Aqui renderizamos o conteúdo real se não estiver carregando ou se já tivermos dados. */}
      
      {!loading && (
        <View style={tw`mb-8`}>
          <Text style={[tw`text-xs font-bold uppercase mb-2 ml-1`, { color: colors.textLight }]}>
            Em Andamento (Atual)
          </Text>

          {ocorrenciaAtual ? (
                <Card 
              style={[{ backgroundColor: !isDark ? '#FFF7ED' : colors.surface, borderWidth: 1, borderColor: !isDark ? '#FEEBC8' : colors.border, padding: 16 }]}
              onPress={() => navigation.navigate('DetalheAndamento', { id: ocorrenciaAtual.id_ocorrencia })}
            >
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={[{ fontSize: 14, fontWeight: '700', color: colors.textLight }]}>
                  {ocorrenciaAtual.nr_aviso ? `Aviso ${ocorrenciaAtual.nr_aviso}` : 'Sem Aviso'}
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Clock size={14} color={colors.textLight} style={tw`mr-1`} />
                  <Text style={[{ fontSize: 14, color: colors.textLight }]}>
                    {formatarHora(ocorrenciaAtual.hora_acionamento)}
                  </Text>
                </View>
              </View>

              <Text style={[{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6 }]}>
                {ocorrenciaAtual.subgrupo?.descricao_subgrupo}
              </Text>
              <Text style={[{ fontSize: 14, color: colors.textLight, marginBottom: 12 }]}>
                {ocorrenciaAtual.bairro?.nome_bairro}
              </Text>

              <TouchableOpacity 
                style={[{ backgroundColor: colors.secondary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }]}
                onPress={() => navigation.navigate('DetalheAndamento', { id: ocorrenciaAtual.id_ocorrencia })}
              >
                <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>
                  Ver Detalhes / Atualizar
                </Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <View style={[tw`p-6 rounded-xl items-center justify-center`, { backgroundColor: colors.background, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border }] }>
              <Text style={[{ color: colors.textLight, fontSize: 14 }]}>Nenhuma ocorrência em andamento.</Text>
            </View>
          )}
        </View>
      )}

      {!loading && (
        <Text style={[tw`text-xs font-bold uppercase mb-2 ml-1`, { color: colors.textLight }]}>
          Fila de Espera (Pendentes)
        </Text>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={tw`flex-1`}>
        <OfflineBanner />
        {loading ? (
          <>
            <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
              <View>
                <Text style={[tw`text-2xl font-bold`, { color: colors.text }]}>Minhas Ocorrências</Text>
                <Text style={[tw`text-sm`, { color: colors.textLight }]}>Carregando...</Text>
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
                <Text style={[{ color: colors.textLight }]}>Nenhuma ocorrência pendente.</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-24`}
            refreshControl={
              <RefreshControl 
                refreshing={isRefetchingPendentes} 
                onRefresh={() => { refetchAndamento(); refetchPendentes(); }} 
                colors={[colors.primary]} // Usando a cor do tema
              />
            }
          />
        )}

        <TouchableOpacity 
          style={[tw`absolute bottom-6 right-4 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50`, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('NovaOcorrencia')}
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};