import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Alert } from 'react-native';

// --- TIPO PARA CRIAÇÃO ---
interface NovaOcorrenciaData {
  data_acionamento: string;
  hora_acionamento: string;
  id_subgrupo_fk: string;
  id_bairro_fk: string;
  id_forma_acervo_fk: string;
  nr_aviso?: string;
  observacoes?: string;
  localizacao?: {
    logradouro?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

// --- TIPO PARA ATUALIZAÇÃO ---
interface AtualizaStatusData {
  id: string;
  status_situacao: 'EM_ANDAMENTO' | 'CONCLUIDO';
  nr_aviso?: string | null;
}

// Hook para CRIAR Ocorrência
export const useCreateOcorrencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NovaOcorrenciaData) => api.post('/api/v1/ocorrencias', data),
    onSuccess: () => {
      // Invalida o cache para forçar a lista "PENDENTE" a atualizar
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
        Alert.alert("Sucesso", "Ocorrência enviada para a central."); 
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Falha ao criar ocorrência.";
      Alert.alert("Erro no envio", msg);
    }
  });
};

// Hook para ATUALIZAR Status
export const useUpdateStatusOcorrencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: AtualizaStatusData) => 
      api.put(`/api/v1/ocorrencias/${id}`, { ...data, relacionado_eleicao: false, data_execucao_servico: null }),
    
    onSuccess: (_, variables) => {
      // Atualiza todas as listas e o detalhe específico dessa ocorrência
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
    },

    onError: (error: any) => {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  });
};