import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';

export const SobreScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} style={tw`bg-white`}>

        {/* Header */}
        <View style={tw`flex-row items-center px-3 mt-3 mb-6`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`mr-3 p-2 rounded-full border border-slate-300 bg-white`}
          >
            <ArrowLeft size={22} color="#0A1A36" />
          </TouchableOpacity>

          <Text style={tw`text-base text-[#0A1A36] font-medium`}>
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

          <Text style={tw`text-2xl text-[#0A1A36] font-bold mb-1`}>
            S.O.R.O
          </Text>

          <Text style={tw`text-sm text-[#0A1A36] text-center`}>
            Sistema Organizacional{"\n"}para Registros de Ocorrências
          </Text>
        </View>

        {/* Card Sobre o Projeto */}
        <View style={tw`bg-white border border-slate-200 rounded-xl p-5 mx-4 mb-5`}>
          <Text style={tw`text-[#0A1A36] text-base font-semibold mb-3`}>
            Sobre o Projeto
          </Text>

          <Text style={tw`text-[#4B5563] leading-5 text-sm`}>
            O S.O.R.O. é uma solução de coleta e gestão de dados de ocorrências em
            campo, desenvolvida para o Corpo de Bombeiros Militar de Pernambuco
            (CBMPE). A solução é composta por este aplicativo mobile (para
            registro em campo) e um painel administrativo web para gestão e
            análise.
          </Text>
        </View>

        {/* Card Créditos Acadêmicos */}
        <View style={tw`bg-white border border-slate-200 rounded-xl p-5 mx-4 mb-5`}>
          <Text style={tw`text-[#0A1A36] text-base font-semibold mb-3`}>
            Créditos Acadêmicos
          </Text>

          <Text style={tw`text-[#4B5563] leading-5 text-sm mb-3`}>
            Este sistema foi desenvolvido como Projeto Integrador da Turma 44 da
            Faculdade Senac Pernambuco, sob a orientação dos professores Danilo
            Farias, Geraldo Gomes, Marcos Tenorio e Sônia Gomes.
          </Text>

          <Text style={tw`text-[#0A1A36] text-base font-semibold mb-2`}>
            Equipe:
          </Text>

          <View style={tw`pl-2`}>
            <Text style={tw`text-[#4B5563] text-sm mb-1`}>• Arthur Henrique Silveira de Paula</Text>
            <Text style={tw`text-[#4B5563] text-sm mb-1`}>• Maira Lourenço de Melo</Text>
            <Text style={tw`text-[#4B5563] text-sm mb-1`}>• Manoel Olímpio de Melo Neto</Text>
            <Text style={tw`text-[#4B5563] text-sm mb-1`}>• Matheus Willian Lima Oliveira</Text>
            <Text style={tw`text-[#4B5563] text-sm mb-1`}>• Victor Henrique Gomes de Melo</Text>
            <Text style={tw`text-[#4B5563] text-sm mb-1`}>• Victória Gouveia Zambom</Text>
          </View>
        </View>

        {/* Versão */}
        <View style={tw`mt-4 mb-10 items-center`}>
          <Text style={tw`text-xs text-slate-400`}>
            Versão 1.0.2
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};
