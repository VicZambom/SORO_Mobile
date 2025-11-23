import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Definição global das rotas e seus parâmetros
export type RootStackParamList = {
  Login: undefined;
  MinhasOcorrencias: undefined;
  DetalhePendente: { id: string };
  NovaOcorrencia: undefined;
  Perfil: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;