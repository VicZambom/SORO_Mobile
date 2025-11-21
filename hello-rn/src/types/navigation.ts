import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Definição global das rotas e seus parâmetros
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  OcorrenciaLista: undefined;
  OcorrenciaDetalhe: { id: string };
  NovaOcorrencia: undefined;
  Perfil: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;