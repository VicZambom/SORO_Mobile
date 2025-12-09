import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export const SobreScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} style={[tw`flex-1`, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={tw`flex-row items-center px-3 mt-3 mb-6`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[tw`text-base font-medium`, { color: colors.text }]}>
            Sobre o S.O.R.O.
          </Text>
        </View>

        {/* Logo + Título */}
        <View style={tw`items-center px-6 mb-6`}>
          <Image
            source={require('../../assets/Logo.png')}
            style={tw`w-20 h-20 mb-3`}
            resizeMode="contain"
          />

          <Text style={[tw`text-2xl font-bold mb-1`, { color: colors.text }]}>
            S.O.R.O
          </Text>

          <Text style={[tw`text-sm text-center`, { color: colors.textLight }]}>
            Sistema Organizacional{"\n"}para Registros de Ocorrências
          </Text>
        </View>

        {/* Card Sobre o Projeto */}
        <View style={[tw`border rounded-xl p-5 mx-4 mb-5`, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[tw`text-base font-semibold mb-3`, { color: colors.text }]}>
            Sobre o Projeto
          </Text>

          <Text style={[tw`leading-5 text-sm`, { color: colors.textLight }]}>
            O S.O.R.O. é uma solução de coleta e gestão de dados de ocorrências em
            campo, desenvolvida para o Corpo de Bombeiros Militar de Pernambuco
            (CBMPE). A solução é composta por este aplicativo mobile (para
            registro em campo) e um painel administrativo web para gestão e
            análise.
          </Text>
        </View>

        {/* Card Créditos Acadêmicos */}
        <View style={[tw`border rounded-xl p-5 mx-4 mb-5`, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[tw`text-base font-semibold mb-3`, { color: colors.text }]}>
            Créditos Acadêmicos
          </Text>

          <Text style={[tw`leading-5 text-sm mb-3`, { color: colors.textLight }]}>
            Este sistema foi desenvolvido como Projeto Integrador da Turma 44 da
            Faculdade Senac Pernambuco, sob a orientação dos professores Danilo
            Farias, Geraldo Gomes, Marcos Tenorio e Sônia Gomes.
          </Text>

          <Text style={[tw`text-base font-semibold mb-2`, { color: colors.text }]}>
            Equipe:
          </Text>

          <View style={tw`pl-2`}>
            <Text style={[tw`text-sm mb-1`, { color: colors.textLight }]}>• Arthur Henrique Silveira de Paula</Text>
            <Text style={[tw`text-sm mb-1`, { color: colors.textLight }]}>• Maira Lourenço de Melo</Text>
            <Text style={[tw`text-sm mb-1`, { color: colors.textLight }]}>• Manoel Olímpio de Melo Neto</Text>
            <Text style={[tw`text-sm mb-1`, { color: colors.textLight }]}>• Matheus Willian Lima Oliveira</Text>
            <Text style={[tw`text-sm mb-1`, { color: colors.textLight }]}>• Victor Henrique Gomes de Melo</Text>
            <Text style={[tw`text-sm mb-1`, { color: colors.textLight }]}>• Victória Gouveia Zambom</Text>
          </View>
        </View>

        {/* Versão */}
        <View style={tw`mt-4 mb-10 items-center`}>
          <Text style={[tw`text-xs`, { color: colors.textLight }]}>
            Versão 1.0.2
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};
