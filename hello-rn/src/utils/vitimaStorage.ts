import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a chave base para salvar no celular
const getKey = (ocorrenciaId: string) => `@SORO:vitimas_${ocorrenciaId}`;

export const saveVitimaLocal = async (ocorrenciaId: string, vitimaData: any) => {
  try {
    const key = getKey(ocorrenciaId);
    
    // 1. Pega as vítimas que já existem salvas
    const storedData = await AsyncStorage.getItem(key);
    const currentVitimas = storedData ? JSON.parse(storedData) : [];

    // 2. Adiciona a nova com um ID falso (timestamp)
    const novaVitima = {
      ...vitimaData,
      id_vitima: `local_${new Date().getTime()}`, // ID único local
    };

    const updatedList = [...currentVitimas, novaVitima];

    // 3. Salva de volta
    await AsyncStorage.setItem(key, JSON.stringify(updatedList));
    return novaVitima;
  } catch (error) {
    console.error("Erro ao salvar vítima localmente", error);
    throw error;
  }
};

export const getVitimasLocais = async (ocorrenciaId: string) => {
  try {
    const key = getKey(ocorrenciaId);
    const storedData = await AsyncStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    return [];
  }
};