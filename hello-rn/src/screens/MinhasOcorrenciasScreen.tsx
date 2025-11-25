// src/screens/MinhasOcorrenciasScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import { User, Clock, Plus, RefreshCw } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { ScreenWrapper } from '../components/ScreenWrapper';
import { Card } from '../components/Card';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AppNavigationProp } from '../types/navigation';

// --- TIPAGEM DOS DADOS DA API ---
interface OcorrenciaAPI {
  id_ocorrencia: string;
  nr_aviso: string | null;
  status_situacao: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  hora_acionamento: string; 
  subgrupo: {
    descricao_subgrupo: string;
  };
  bairro: {
    nome_bairro: string;
  };
}

export const MinhasOcorrencias = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();
  const { socket } = useSocket();

  // Estados para armazenar os dados reais
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState<OcorrenciaAPI | null>(null);
  const [filaDeEspera, setFilaDeEspera] = useState<OcorrenciaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função para formatar hora 
  const formatarHora = (dataIso: string) => {
    if (!dataIso) return '--:--';
    const date = new Date(dataIso);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função principal de busca de dados
  const fetchDados = async () => {
    try {
      // Busca ocorrências EM ANDAMENTO (para o destaque)
      const resAndamento = await api.get('/api/v1/ocorrencias', {
        params: { status: 'EM_ANDAMENTO', limit: 1 }
      });
      
      // Se houver alguma, pega a primeira. Senão, null.
      if (resAndamento.data.data && resAndamento.data.data.length > 0) {
        setOcorrenciaAtual(resAndamento.data.data[0]);
      } else {
        setOcorrenciaAtual(null);
      }

      // Busca ocorrências PENDENTES
      const resPendentes = await api.get('/api/v1/ocorrencias', {
        params: { status: 'PENDENTE', limit: 20 }
      });
      setFilaDeEspera(resPendentes.data.data || []);

    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
      // Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Se o socket não existir (ex: usuário deslogado ou sem internet), não faz nada.
    if (!socket) return;

    // --- CANAL 1: NOVA OCORRÊNCIA ---
    socket.on('nova_ocorrencia', (novaOcorrencia: OcorrenciaAPI) => {
      console.log('⚡ Socket: Nova ocorrência recebida:', novaOcorrencia);

      // Lógica de Estado
      setFilaDeEspera((prevLista) => [novaOcorrencia, ...prevLista]);
      Alert.alert('Nova Ocorrência', `Tipo: ${novaOcorrencia.subgrupo?.descricao_subgrupo}`);
    });

    // --- CANAL 2: OCORRÊNCIA ATUALIZADA ---
    socket.on('ocorrencia_atualizada', (ocorrenciaAtualizada: OcorrenciaAPI) => {
      console.log('⚡ Socket: Atualização recebida:', ocorrenciaAtualizada);

      // Cenário A: A ocorrência na lista de pendentes
      setFilaDeEspera((prevLista) => 
        prevLista.map((item) => 
          item.id_ocorrencia === ocorrenciaAtualizada.id_ocorrencia 
            ? ocorrenciaAtualizada 
            : item
        )
      );

      // Cenário B: Ocorrência em andamento
      if (ocorrenciaAtual?.id_ocorrencia === ocorrenciaAtualizada.id_ocorrencia) {
        setOcorrenciaAtual(ocorrenciaAtualizada);
      }

      // Cenário C: Se o status mudou de PENDENTE para EM_ANDAMENTO (alguém pegou),
      // ela deve sair da fila e ir para o destaque.
      // Nesse caso complexo, forçamos um refresh completo para garantir a ordem correta.
      if (ocorrenciaAtualizada.status_situacao === 'EM_ANDAMENTO') {
         fetchDados(); 
      }
    });

    // 4. CLEANUP (Limpeza)
    return () => {
      socket.off('nova_ocorrencia');
      socket.off('ocorrencia_atualizada');
    };

  }, [socket, ocorrenciaAtual]); // Reexecuta se o socket mudar ou a ocorrência atual mudar

  // useFocusEffect garante que os dados atualizem sempre que a tela aparecer
  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [])
  );

  // Função para "Puxar para atualizar"
  const onRefresh = () => {
    setRefreshing(true);
    fetchDados();
  };
  
  // --- RENDERIZAÇÃO ---
  // Renderiza cada item da lista de pendentes
  const renderItem = ({ item }: { item: OcorrenciaAPI }) => (
    <Card 
      style={tw`bg-white border-l-4 border-l-red-500 border-gray-100 shadow-sm p-4 mb-3 rounded-l-none`}
      onPress={() => navigation.navigate('DetalhePendente', { id: item.id_ocorrencia })}
    >
      <View style={tw`flex-row justify-between mb-1`}>
        <Text style={tw`text-xs font-bold text-slate-500`}>
          {item.nr_aviso ? `#${item.nr_aviso}` : 'S/N'}
        </Text>
        <Text style={tw`text-xs text-slate-400`}>{formatarHora(item.hora_acionamento)}</Text>
      </View>

      <Text style={tw`text-base font-bold text-slate-800 mb-1`} numberOfLines={1}>
        {item.subgrupo?.descricao_subgrupo || 'Tipo não informado'}
      </Text>
      
      <Text style={tw`text-sm text-slate-500 mb-3`}>
        {item.bairro?.nome_bairro || 'Local desconhecido'}
      </Text>
      
      <View style={tw`self-start bg-red-100 px-3 py-1 rounded-full`}>
        <Text style={tw`text-red-600 text-xs font-bold uppercase`}>AGUARDANDO</Text>
      </View>
    </Card>
  );
  
  // Cabeçalho da Lista
  const ListHeader = () => (
    <View>
      {/* --- HEADER --- */}
      <View style={tw`flex-row justify-between items-center mb-6 mt-2`}>
        <View>
          <Text style={tw`text-2xl font-bold text-slate-900`}>Minhas Ocorrências</Text>
          <Text style={tw`text-sm text-slate-500`}>
            {user?.name ? `Olá, ${user.name.split(' ')[0]}` : 'Bem-vindo'}
          </Text>
        </View>
        
        {/* Botão de Perfil */}
        <TouchableOpacity 
          style={tw`w-10 h-10 bg-gray-200 rounded-full items-center justify-center border border-gray-300`}
          onPress={() => navigation.navigate('Perfil')} 
        >
          <User color="#475569" size={20} />
        </TouchableOpacity>
      </View>

      {/* Seção: EM ANDAMENTO */}
      <View style={tw`mb-8`}>
        <Text style={tw`text-xs font-bold text-slate-500 uppercase mb-2 ml-1`}>
          Em Andamento (Atual)
        </Text>

        {ocorrenciaAtual ? (
          <Card 
            style={tw`bg-orange-50 border-orange-200 border shadow-sm p-5`}
            onPress={() => navigation.navigate('DetalhePendente', { id: ocorrenciaAtual.id_ocorrencia })}
          >
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`text-sm font-bold text-slate-700`}>
                {ocorrenciaAtual.nr_aviso ? `Aviso ${ocorrenciaAtual.nr_aviso}` : 'Sem Aviso'}
              </Text>
              <View style={tw`flex-row items-center`}>
                <Clock size={14} color="#475569" style={tw`mr-1`} />
                <Text style={tw`text-sm font-medium text-slate-600`}>
                  {formatarHora(ocorrenciaAtual.hora_acionamento)}
                </Text>
              </View>
            </View>

            <Text style={tw`text-xl font-bold text-slate-800 mb-1`}>
              {ocorrenciaAtual.subgrupo?.descricao_subgrupo}
            </Text>
            <Text style={tw`text-base text-slate-600 leading-snug mb-5`}>
              {ocorrenciaAtual.bairro?.nome_bairro}
            </Text>

            <TouchableOpacity 
              style={tw`bg-orange-400 py-3 rounded-lg items-center shadow-sm`}
              onPress={() => navigation.navigate('DetalhePendente', { id: ocorrenciaAtual.id_ocorrencia })}
            >
              <Text style={tw`text-white font-bold text-sm uppercase tracking-wide`}>
                Ver Detalhes / Atualizar
              </Text>
            </TouchableOpacity>
          </Card>
        ) : (
          // Estado vazio para Em Andamento
          <View style={tw`bg-gray-50 border-dashed border-2 border-gray-200 p-6 rounded-xl items-center justify-center`}>
            <Text style={tw`text-slate-400 text-sm`}>Nenhuma ocorrência em andamento.</Text>
          </View>
        )}
      </View>

      {/* Título da Lista de Espera */}
      <Text style={tw`text-xs font-bold text-slate-500 uppercase mb-2 ml-1`}>
        Fila de Espera (Pendentes)
      </Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={tw`flex-1`}>
        {loading && !refreshing ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={tw`mt-4 text-slate-500`}>Carregando ocorrências...</Text>
          </View>
        ) : (
          <FlatList
            data={filaDeEspera}
            renderItem={renderItem}
            keyExtractor={item => item.id_ocorrencia}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={
              <View style={tw`py-10 items-center`}>
                <Text style={tw`text-slate-400`}>Nenhuma ocorrência pendente.</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-24`}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}

        {/* FAB - Botão Flutuante */}
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