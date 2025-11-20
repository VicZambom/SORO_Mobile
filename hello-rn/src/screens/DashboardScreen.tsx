// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import tw from 'twrnc';
import { LogOut, RefreshCw, Plus } from 'lucide-react-native';

// Definindo o tipo das props de navegação (básico para agora)
export const DashboardScreen = ({ navigation }: any) => {
  
  return (
    <View style={tw`flex-1 bg-slate-50`}>
      {/* Header Personalizado conforme PDF */}
      <View style={tw`bg-blue-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg`}>
        <View style={tw`flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-blue-100 text-sm`}>Bem-vindo,</Text>
            <Text style={tw`text-white text-xl font-bold`}>Sd. Bombeiro</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <LogOut color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Botão de Sincronização (Destaque no PDF) */}
        <TouchableOpacity style={tw`bg-orange-500 flex-row items-center justify-center py-3 rounded-xl mt-6 shadow-sm`}>
          <RefreshCw color="white" size={20} style={tw`mr-2`} />
          <Text style={tw`text-white font-bold`}>Sincronizar Dados</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo / Lista */}
      <ScrollView style={tw`flex-1 px-6 mt-4`}>
        <Text style={tw`text-slate-800 font-bold text-lg mb-4`}>Minhas Ocorrências</Text>
        
        {/* Card de Exemplo 1 */}
        <View style={tw`bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm mb-3`}>
          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={tw`text-xs font-bold text-slate-500`}>#AV-2048</Text>
            <View style={tw`bg-green-100 px-2 py-1 rounded`}>
              <Text style={tw`text-green-700 text-xs font-bold`}>Em Andamento</Text>
            </View>
          </View>
          <Text style={tw`text-slate-800 font-bold text-base`}>Incêndio em Residência</Text>
          <Text style={tw`text-slate-500 text-sm mt-1`}>Rua dos Navegantes, 450</Text>
        </View>

         {/* Card de Exemplo 2 */}
         <View style={tw`bg-white p-4 rounded-xl border-l-4 border-orange-400 shadow-sm mb-3`}>
          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={tw`text-xs font-bold text-slate-500`}>#AV-2049</Text>
            <View style={tw`bg-orange-100 px-2 py-1 rounded`}>
              <Text style={tw`text-orange-700 text-xs font-bold`}>Pendente</Text>
            </View>
          </View>
          <Text style={tw`text-slate-800 font-bold text-base`}>Resgate de Animal</Text>
          <Text style={tw`text-slate-500 text-sm mt-1`}>Av. Boa Viagem, 1200</Text>
        </View>

      </ScrollView>

      {/* FAB (Floating Action Button) para Nova Ocorrência */}
      <TouchableOpacity 
        style={tw`absolute bottom-6 right-6 bg-blue-700 w-14 h-14 rounded-full items-center justify-center shadow-lg`}
        onPress={() => console.log('Navegar para Nova Ocorrência')}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </View>
  );
};