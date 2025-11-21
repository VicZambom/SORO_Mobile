// src/components/ActionModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import tw from 'twrnc';
import { Camera, Video, Edit, UserPlus, X } from 'lucide-react-native'; 

interface ActionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onActionSelect: (action: 'tirarFoto' | 'gravarVideo' | 'coletarAssinatura' | 'registrarVitima') => void;
}

// Componente interno para cada item de ação
const ActionItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}> = ({ icon, title, onPress }) => (
    <TouchableOpacity 
      style={tw`flex-row items-center py-4 px-4 border-b border-gray-100`}
      onPress={onPress}
    >
      <View style={tw`w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4`}>
        {icon}
      </View>
      <View style={tw`flex-1`}>
        {/* Poppins Semibold 16 - Usamos font-semibold e text-base para simular */}
        <Text style={tw`text-base font-semibold text-slate-900`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );


export const ActionModal: React.FC<ActionModalProps> = ({ isVisible, onClose, onActionSelect }) => {
  return (
    <Modal
      animationType="slide" 
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-end items-center bg-black bg-opacity-50`}>
        
        {/* Container do Modal (393W x 510H - usando 95% da largura e max-height para altura) */}
        <View style={[{ width: '95%', maxHeight: 510 }, tw`bg-white rounded-t-xl`]}> 
          
          {/* Título do Modal */}
          <View style={tw`py-4 border-b border-gray-100 px-4 flex-row justify-between items-center`}>
            {/* Título: "Adicionar à Ocorrência" (Poppins Semibold 17) */}
            <Text style={tw`text-lg font-semibold text-slate-900`}>Adicionar à Ocorrência</Text>
            
            {/* Botão X para fechar o modal (adicionado para boa prática) */}
            <TouchableOpacity onPress={onClose} style={tw`p-1`}>
                <X size={24} color="#64748b" /> 
            </TouchableOpacity>
          </View>

          {/* Opções de Ação */}
          <View style={tw`flex-1`}> 
            <ActionItem
              icon={<Camera size={24} color="#2563eb" />}
              title="Tirar Foto"
              onPress={() => onActionSelect('tirarFoto')}
            />
            <ActionItem
              icon={<Video size={24} color="#2563eb" />}
              title="Gravar Vídeo"
              onPress={() => onActionSelect('gravarVideo')}
            />
            <ActionItem
              icon={<Edit size={24} color="#2563eb" />}
              title="Coletar Assinatura"
              onPress={() => onActionSelect('coletarAssinatura')}
            />
            <ActionItem
              icon={<UserPlus size={24} color="#2563eb" />}
              title="Registrar Vítima"
              onPress={() => onActionSelect('registrarVitima')}
            />
          </View>

          {/* Botão Cancelar (Rodapé do Modal) */}
          <View style={tw`p-4 border-t border-gray-100 bg-white`}>
            <TouchableOpacity
              // CORREÇÃO APLICADA: Usando tw`h-[58.23px]` para o height exato
              style={tw`w-full h-[58.23px] rounded-lg items-center justify-center bg-red-500`}
              onPress={onClose}
            >
              <Text style={tw`text-white text-base font-semibold`}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
