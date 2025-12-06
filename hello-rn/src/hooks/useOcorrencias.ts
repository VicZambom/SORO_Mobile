// src/hooks/useOcorrencias.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

// Tipagem
export interface OcorrenciaAPI {
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

interface FetchOcorrenciasParams {
  status: string;
  limit?: number;
}

// Função de fetch desacoplada
const fetchOcorrencias = async ({ status, limit = 20 }: FetchOcorrenciasParams) => {
  const { data } = await api.get('/api/v3/ocorrencias', {
    params: { status, limit }
  });
  return data.data as OcorrenciaAPI[];
};

export const useOcorrencias = (status: 'PENDENTE' | 'EM_ANDAMENTO', limit?: number) => {
  return useQuery({
    // A chave única do cache. Se 'status' mudar, ele busca de novo.
    queryKey: ['ocorrencias', status],
    queryFn: () => fetchOcorrencias({ status, limit }),
    staleTime: 1000 * 60 * 1, // Dados considerados "novos" por 1 minuto
    refetchOnReconnect: true, // Recarrega se a internet cair e voltar
  });
};