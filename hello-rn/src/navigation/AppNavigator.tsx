import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Importando as TELAS reais do diretório `src/screens`
import { LoginScreen } from '../screens/LoginScreen';
import MyOccurrencesScreen from '../screens/OcorrenciaListaScreen';
import TelaDetalhesOcorrencia from '../screens/TelaDetalhesOcorrencia';
import TelaEmDeslocamento from '../screens/TelaEmDeslocamento'; // <-- NOVO IMPORT

// Inicializa o Native Stack Navigator
const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  // Simulação de lógica de autenticação
  const userIsAuthenticated = true; 

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaOcorrencias" screenOptions={{ headerShown: false }}>
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ListaOcorrencias" component={MyOccurrencesScreen} />
          <Stack.Screen name="DetalhesOcorrencia" component={TelaDetalhesOcorrencia} />
          <Stack.Screen name="EmDeslocamento" component={TelaEmDeslocamento} />
        </>
      </Stack.Navigator>
    </NavigationContainer>
 );
};

export default AppNavigator;