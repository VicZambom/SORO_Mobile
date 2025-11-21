// src/types/navigation.ts (ATUALIZADO)
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Definição global das rotas e seus parâmetros
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  OcorrenciaLista: undefined;
  OcorrenciaDetalhe: { id: string };
  NovaOcorrencia: undefined;
  Perfil: undefined;
  // NOVA ROTA ADICIONADA
  RegistroVitima: { ocorrenciaId: string }; 
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;