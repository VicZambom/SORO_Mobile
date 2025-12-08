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

// 1. Hook para CRIAR Ocorrência
export const useCreateOcorrencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NovaOcorrenciaData) => api.post('/api/v3/ocorrencias', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Falha ao criar ocorrência.";
      Alert.alert("Erro no envio", msg);
    }
  });
};

// 2. Hook para ATUALIZAR Status 
export const useUpdateStatusOcorrencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status_situacao, nr_aviso }: AtualizaStatusData) => {
      const payload: any = {
        status_situacao,
        relacionado_eleicao: false,
        nr_aviso
      };

      if (status_situacao === 'CONCLUIDO') {
        payload.data_execucao_servico = new Date().toISOString();
      } else {
        payload.data_execucao_servico = null;
      }

      return api.put(`/api/v3/ocorrencias/${id}`, payload);
    },
    
    onSuccess: () => {
      // Força a atualização de todas as listas 
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
    },
    onError: (error: any) => {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  });
};