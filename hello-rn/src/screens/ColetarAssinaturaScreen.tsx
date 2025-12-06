import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';

import api from '../services/api';
import { RootStackParamList } from '../types/navigation';

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
      const fsCache = (FileSystem as any).cacheDirectory;
      
      if (!fsCache) {
        throw new Error('Diretório de cache não disponível.');
      }

      const base64Code = signatureBase64.replace("data:image/png;base64,", "");
      const filename = `assinatura_${new Date().getTime()}.png`;
      const fileUri = fsCache + filename;

      await FileSystem.writeAsStringAsync(fileUri, base64Code, {
        encoding: 'base64', 
      });

      const formData = new FormData();
      formData.append('midia', {
        uri: fileUri,
        name: filename,
        type: 'image/png',
      } as any);

      await api.post(`/api/v3/ocorrencias/${ocorrenciaId}/midia`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Sucesso', `Assinatura de ${nomeSignatario} salva com sucesso!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('Erro ao salvar assinatura:', error);
      Alert.alert('Erro', 'Falha ao enviar a assinatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F8FAFC]`}>
      
      {/* HEADER */}
      <View style={tw`flex-row justify-between items-center px-5 py-4 bg-[#F8FAFC]`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1 mr-2`}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={tw`text-lg font-bold text-slate-900`}>Assinatura</Text>
        </View>
        
        <TouchableOpacity onPress={handleClear}>
          <Text style={tw`text-red-600 font-bold text-sm`}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO */}
      <View style={tw`flex-1 px-5 pt-2`}>
        
        <View style={tw`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 mb-24`}>
          
          <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>
            Nome do Signatário (Testemunha/Vítima)
          </Text>
          <TextInput
            style={tw`bg-white border border-gray-300 rounded-lg p-3 text-slate-800 mb-6`}
            placeholder="Digite o nome completo..."
            value={nomeSignatario}
            onChangeText={setNomeSignatario}
          />

          <Text style={tw`text-slate-600 text-sm mb-2`}>Desenhe a assinatura abaixo</Text>
          
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
            
            <View style={tw`absolute inset-0 -z-10 items-center justify-center`}>
                <Text style={tw`text-slate-300 text-lg`}>Assine aqui</Text>
            </View>
          </View>

          <View style={tw`bg-gray-100 p-3 rounded-lg`}>
            <Text style={tw`text-xs text-slate-500 text-center leading-4`}>
              A assinatura será salva como imagem e anexada à ocorrência
            </Text>
          </View>

        </View>
      </View>

      {/* BOTÃO FLUTUANTE */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100`}>
        <TouchableOpacity 
          style={tw`bg-[#10B981] py-4 rounded-xl items-center shadow-sm`}
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