import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';

import api from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { saveVitimaLocal } from '../utils/vitimaStorage';
import { useTheme } from '../context/ThemeContext';
import { StatusModal, StatusModalType } from '../components/StatusModal';

type RegistrarVitimaRouteProp = RouteProp<RootStackParamList, 'RegistrarVitima'>;

export const RegistrarVitimaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RegistrarVitimaRouteProp>();
  const { ocorrenciaId } = route.params;
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);

  // Estado do Formulário
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('');
  const [destino, setDestino] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // Estado da Classificação
  const [classificacao, setClassificacao] = useState<string | null>(null);

  // Estado do Modal
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: 'INFO' as StatusModalType,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: undefined as string | undefined,
    onConfirm: () => {},
  });

  const showStatus = (type: StatusModalType, title: string, msg: string, onConfirm?: () => void) => {
    setStatusModal({
      visible: true,
      type,
      title,
      message: msg,
      confirmText: 'OK',
      cancelText: undefined,
      onConfirm: onConfirm || (() => setStatusModal(prev => ({ ...prev, visible: false }))),
    });
  };

  const handleRegister = async () => {
    if (!classificacao) {
      showStatus('WARNING', 'Atenção', 'Por favor, selecione a classificação da vítima.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome_vitima: nome || 'Não Identificado',
        idade: idade ? parseInt(idade) : null,
        sexo: sexo, 
        classificacao_vitima: classificacao,
        destino_vitima: destino,
        lesoes_json: { descricao: observacoes }, 
      };

      await saveVitimaLocal(ocorrenciaId, payload);

      showStatus('SUCCESS', 'Sucesso', 'Vítima registrada com sucesso!', () => {
        setStatusModal(prev => ({ ...prev, visible: false }));
        navigation.goBack();
      });

    } catch (error) {
      console.error(error);
      showStatus('ERROR', 'Erro', 'Falha ao salvar os dados no dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  // Componente auxiliar para botão de classificação
  const ClassificacaoButton = ({ label, value, colorBg, colorText }: any) => {
    const isSelected = classificacao === value;
    return (
      <TouchableOpacity
        style={[
          tw`flex-1 py-3 rounded-lg items-center justify-center mx-1 shadow-sm`,
          isSelected ? tw`${colorBg} border-2 border-slate-600` : tw`${colorBg} opacity-60 border border-transparent`
        ]}
        onPress={() => setClassificacao(value)}
        activeOpacity={0.7}
      >
        <Text style={tw`text-xs font-bold ${colorText} uppercase`}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      
      <StatusModal 
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        confirmText={statusModal.confirmText}
        cancelText={statusModal.cancelText}
        onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
        onConfirm={statusModal.onConfirm}
      />

      {/* HEADER */}
      <View style={[tw`flex-row justify-between items-center px-5 py-4`, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[tw`text-lg font-bold`, { color: colors.text }]}>Nova Vítima</Text>
        
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[tw`font-medium`, { color: colors.danger }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`p-5 pb-32`}>
          
          {/* CARD DO FORMULÁRIO */}
          <View style={[tw`rounded-2xl p-5 shadow-sm border`, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Nome */}
            <View style={tw`mb-4`}>
              <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Nome Completo (Opcional)</Text>
              <TextInput
                style={[tw`rounded-lg p-3 text-base`, { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                placeholder="Digite o nome da vítima"
                placeholderTextColor={colors.textLight}
                value={nome}
                onChangeText={setNome}
              />
            </View>

            {/* Idade e Sexo */}
            <View style={tw`flex-row mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Idade</Text>
                <TextInput
                  style={[tw`rounded-lg p-3 text-base`, { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                  placeholder="Ex: 45"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  value={idade}
                  onChangeText={setIdade}
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Sexo</Text>
                <TextInput
                  style={[tw`rounded-lg p-3 text-base`, { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                  placeholder="M / F"
                  placeholderTextColor={colors.textLight}
                  value={sexo}
                  onChangeText={setSexo}
                />
              </View>
            </View>

            {/* Classificação */}
            <View style={tw`mb-4`}>
              <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Classificação (Toque para selecionar)</Text>
              
              {/* Linha 1 */}
              <View style={tw`flex-row mb-2`}>
                <ClassificacaoButton 
                  label="Leve" 
                  value="LEVE" 
                  colorBg="bg-green-400" 
                  colorText="text-white" 
                />
                <ClassificacaoButton 
                  label="Moderado" 
                  value="MODERADO" 
                  colorBg="bg-yellow-400" 
                  colorText="text-white" 
                />
              </View>

              {/* Linha 2 */}
              <View style={tw`flex-row`}>
                <ClassificacaoButton 
                  label="Grave" 
                  value="GRAVE" 
                  colorBg="bg-red-600" 
                  colorText="text-white" 
                />
                <ClassificacaoButton 
                  label="Óbito" 
                  value="OBITO" 
                  colorBg="bg-slate-500" 
                  colorText="text-white" 
                />
              </View>
            </View>

            {/* Destino */}
            <View style={tw`mb-4`}>
              <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Destino / Unidade de Saúde</Text>
              <TextInput
                style={[tw`rounded-lg p-3 text-base`, { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                placeholder="Ex: Hosp. da Restauração"
                placeholderTextColor={colors.textLight}
                value={destino}
                onChangeText={setDestino}
              />
            </View>

            {/* Observações */}
            <View style={tw`mb-2`}>
              <Text style={[tw`font-bold mb-2 text-sm`, { color: colors.text }]}>Observações / Lesões</Text>
              <TextInput
                style={[tw`rounded-lg p-3 text-base h-24`, { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                placeholder="Descreva lesões, condições ou observações..."
                placeholderTextColor={colors.textLight}
                multiline
                textAlignVertical="top"
                value={observacoes}
                onChangeText={setObservacoes}
              />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTÃO FINAL */}
      <View style={[tw`absolute bottom-0 left-0 right-0 p-5`, { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[tw`py-4 rounded-xl items-center shadow-sm`, { backgroundColor: colors.success }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white font-bold text-base uppercase tracking-wider`}>
              REGISTRAR VÍTIMA
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};
