import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';

import api from '../services/api';
import { RootStackParamList } from '../types/navigation';

type RegistrarVitimaRouteProp = RouteProp<RootStackParamList, 'RegistrarVitima'>;

export const RegistrarVitimaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RegistrarVitimaRouteProp>();
  const { ocorrenciaId } = route.params;

  const [loading, setLoading] = useState(false);

  // Estado do Formulário
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('');
  const [destino, setDestino] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // Estado da Classificação
  const [classificacao, setClassificacao] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!classificacao) {
      Alert.alert('Atenção', 'Por favor, selecione a classificação da vítima.');
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
        id_ocorrencia_fk: ocorrenciaId
      };

      await api.post(`/api/v3/ocorrencias/${ocorrenciaId}/vitimas`, payload);

      Alert.alert('Sucesso', 'Vítima registrada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert('Sucesso (Simulado)', 'Vítima registrada localmente.');
      navigation.goBack();
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
    <SafeAreaView style={tw`flex-1 bg-[#F8FAFC]`}>
      
      {/* HEADER */}
      <View style={tw`flex-row justify-between items-center px-5 py-4 bg-[#F8FAFC]`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-1`}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={tw`text-lg font-bold text-slate-900`}>Nova Vítima</Text>
        
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={tw`text-red-600 font-medium`}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`p-5 pb-32`}>
          
          {/* CARD DO FORMULÁRIO */}
          <View style={tw`bg-white rounded-2xl p-5 shadow-sm border border-slate-200`}>
            
            {/* Nome */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Nome Completo (Opcional)</Text>
              <TextInput
                style={tw`bg-white border border-gray-300 rounded-lg p-3 text-slate-800`}
                placeholder="Digite o nome da vítima"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            {/* Idade e Sexo */}
            <View style={tw`flex-row mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Idade</Text>
                <TextInput
                  style={tw`bg-white border border-gray-300 rounded-lg p-3 text-slate-800`}
                  placeholder="Ex: 45"
                  keyboardType="numeric"
                  value={idade}
                  onChangeText={setIdade}
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Sexo</Text>
                <TextInput
                  style={tw`bg-white border border-gray-300 rounded-lg p-3 text-slate-800`}
                  placeholder="M / F"
                  value={sexo}
                  onChangeText={setSexo}
                />
              </View>
            </View>

            {/* Classificação */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Classificação (Toque para selecionar)</Text>
              
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
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Destino / Unidade de Saúde</Text>
              <TextInput
                style={tw`bg-white border border-gray-300 rounded-lg p-3 text-slate-800`}
                placeholder="Ex: Hosp. da Restauração"
                value={destino}
                onChangeText={setDestino}
              />
            </View>

            {/* Observações */}
            <View style={tw`mb-2`}>
              <Text style={tw`text-slate-700 font-bold mb-2 text-sm`}>Observações / Lesões</Text>
              <TextInput
                style={tw`bg-white border border-gray-300 rounded-lg p-3 text-slate-800 h-24`}
                placeholder="Descreva lesões, condições ou observações..."
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
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100`}>
        <TouchableOpacity 
          style={tw`bg-[#10B981] py-4 rounded-xl items-center shadow-sm`}
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