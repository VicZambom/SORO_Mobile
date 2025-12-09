import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importante!

import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';

type ColetarAssinaturaRouteProp = RouteProp<RootStackParamList, 'ColetarAssinatura'>;

export const ColetarAssinaturaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ColetarAssinaturaRouteProp>();
  const { ocorrenciaId } = route.params;

  const ref = useRef<SignatureViewRef>(null);
  const [nomeSignatario, setNomeSignatario] = useState('');
  const [loading, setLoading] = useState(false);

  const style = `.m-signature-pad { box-shadow: none; border: none; } 
                 .m-signature-pad--body { border: none; }
                 .m-signature-pad--footer { display: none; margin: 0px; }
                 body,html { width: 100%; height: 100%; }`;

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleConfirm = () => {
    if (!nomeSignatario.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome do signatário.');
      return;
    }
    ref.current?.readSignature();
  };

  const handleSignatureOK = async (signatureBase64: string) => {
    setLoading(true);
    try {
      // --- MODO SIMULAÇÃO / OFFLINE ---
      console.log('Salvando assinatura localmente (Bypass de Rede)...');

      const key = `@SORO:assinatura_${ocorrenciaId}`;
      
      // Salva a string Base64 direto no armazenamento do navegador/celular
      await AsyncStorage.setItem(key, JSON.stringify({
        uri: signatureBase64, // A própria string base64 serve como URI para imagem
        nome: nomeSignatario,
        data: new Date().toISOString()
      }));

      // Simula um delay de rede para parecer real
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert('Sucesso', `Assinatura de ${nomeSignatario} registrada!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
      console.error('Erro ao salvar localmente:', error);
      Alert.alert('Erro', 'Falha ao salvar a assinatura no dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F8FAFC]`}>
      <View style={tw`flex-row justify-between items-center px-5 py-4 bg-[#F8FAFC]`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1 mr-2`}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={[tw`text-lg font-bold`, { color: COLORS.text }]}>Assinatura</Text>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text style={[tw`font-bold text-sm`, { color: COLORS.danger }]}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 px-5 pt-2`}>
        <View style={tw`bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex-1 mb-24`}>
          <Text style={[tw`font-bold mb-2 text-sm`, { color: COLORS.text }]}>
            Nome do Signatário
          </Text>
          <TextInput
            style={[tw`bg-white border border-gray-300 rounded-lg p-3 mb-6`, { color: COLORS.text }]}
            placeholder="Digite o nome completo..."
            placeholderTextColor={COLORS.textLight}
            value={nomeSignatario}
            onChangeText={setNomeSignatario}
          />
          <Text style={[tw`text-sm mb-2`, { color: COLORS.textLight }]}>Desenhe a assinatura abaixo</Text>
          
          <View style={tw`flex-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-4`}>
            <SignatureScreen
              ref={ref}
              onOK={handleSignatureOK}
              webStyle={style}
              backgroundColor="transparent"
              descriptionText="Assine aqui"
              confirmText=""
              clearText=""
            />
          </View>
        </View>
      </View>

      <View style={tw`absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100`}>
        <TouchableOpacity 
          style={[tw`py-4 rounded-xl items-center shadow-sm`, { backgroundColor: COLORS.success }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>
              CONFIRMAR E SALVAR
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};