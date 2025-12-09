import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'; 
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { StatusModal, StatusModalType } from '../components/StatusModal';

type ColetarAssinaturaRouteProp = RouteProp<RootStackParamList, 'ColetarAssinatura'>;

export const ColetarAssinaturaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ColetarAssinaturaRouteProp>();
  const { ocorrenciaId } = route.params;

  const ref = useRef<SignatureViewRef>(null);
  const [nomeSignatario, setNomeSignatario] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado do Modal Bonito
  const [modal, setModal] = useState({
    visible: false,
    type: 'INFO' as StatusModalType,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showModal = (type: StatusModalType, title: string, message: string, onConfirm?: () => void) => {
    setModal({
      visible: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setModal(prev => ({ ...prev, visible: false }))),
    });
  };

  const { colors } = useTheme();

  const style = `.m-signature-pad { box-shadow: none; border: none; } 
                 .m-signature-pad--body { border: none; }
                 .m-signature-pad--footer { display: none; margin: 0px; }
                 body,html { width: 100%; height: 100%; }`;

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleConfirm = () => {
    if (!nomeSignatario.trim()) {
      showModal('WARNING', 'Campo Obrigatório', 'Por favor, digite o nome do signatário antes de assinar.');
      return;
    }
    ref.current?.readSignature();
  };

  const handleSignatureOK = async (signatureBase64: string) => {
    setLoading(true);
    try {
      console.log('Salvando assinatura localmente (Bypass de Rede)...');

      const key = `@SORO:assinatura_${ocorrenciaId}`;
      
      await AsyncStorage.setItem(key, JSON.stringify({
        uri: signatureBase64,
        nome: nomeSignatario,
        data: new Date().toISOString()
      }));

      // Simula delay
      await new Promise(resolve => setTimeout(resolve, 500));

      showModal('SUCCESS', 'Assinatura Registrada!', `A assinatura de ${nomeSignatario} foi salva com sucesso.`, () => {
         setModal(prev => ({ ...prev, visible: false }));
         navigation.goBack();
      });

    } catch (error: any) {
      console.error('Erro ao salvar localmente:', error);
      showModal('ERROR', 'Erro ao Salvar', 'Não foi possível registrar a assinatura no dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}> 
      <View style={[tw`flex-row justify-between items-center px-5 py-4`, { backgroundColor: colors.background }]}> 
        <View style={tw`flex-row items-center`}> 
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Assinatura</Text>
        </View>

        <TouchableOpacity onPress={handleClear}>
          <Text style={[tw`font-bold text-sm`, { color: colors.danger }]}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 px-5 pt-2`}>
        <View style={[tw`rounded-2xl p-5 shadow-sm flex-1 mb-24`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Nome do Signatário</Text>

          <TextInput
            style={[tw`rounded-lg p-3 mb-6`, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, color: colors.text }]}
            placeholder="Digite o nome completo..."
            placeholderTextColor={colors.textLight}
            value={nomeSignatario}
            onChangeText={setNomeSignatario}
          />

          <Text style={[tw`text-sm mb-2`, { color: colors.textLight }]}>Desenhe a assinatura abaixo</Text>

          <View style={[tw`flex-1 rounded-xl overflow-hidden mb-4`, { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }]}>
            <SignatureScreen
              ref={ref}
              onOK={handleSignatureOK}
              webStyle={style}
              backgroundColor="transparent"
            />
          </View>
        </View>
      </View>

      <View style={[tw`absolute bottom-0 left-0 right-0 p-5`, { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }]}> 
        <TouchableOpacity
          style={[tw`py-4 rounded-xl items-center shadow-sm`, { backgroundColor: colors.success }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[tw`text-white font-bold text-base uppercase tracking-wider`]}>CONFIRMAR E SALVAR</Text>
          )}
        </TouchableOpacity>
      </View>

      <StatusModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, visible: false }))}
        onConfirm={modal.onConfirm}
        confirmText={modal.type === 'ERROR' ? 'TENTAR NOVAMENTE' : 'OK'}
      />
    </SafeAreaView>
  );
};