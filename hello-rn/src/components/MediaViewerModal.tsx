// src/components/MediaViewerModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Alert } from 'react-native';
import tw from 'twrnc';
import { ArrowLeft, Trash2 } from 'lucide-react-native';

interface MediaViewerModalProps {
  isVisible: boolean;
  mediaUrl: string; // URL real da mídia para visualização
  mediaType: 'photo' | 'video'; // Tipo da mídia
  onClose: () => void; // Ação ao clicar na seta Voltar
  onDelete: () => void; // Ação ao clicar na lixeira
}

// Estilo para simular as dimensões do modal (360W x 452H)
const MODAL_WIDTH = 360;
const MODAL_HEIGHT = 452;

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ 
  isVisible, 
  mediaUrl, 
  mediaType, 
  onClose, 
  onDelete 
}) => {
  
  if (!isVisible) {
    return null;
  }
  
  const handleDeletePress = () => {
    // Confirmação antes de excluir (boa prática)
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-80`}>
        
        {/* Container Central do Modal (360W x 452H) */}
        <View 
          style={tw.style(
            'bg-white rounded-xl overflow-hidden shadow-lg',
            { width: MODAL_WIDTH, height: MODAL_HEIGHT } // Dimensões fixas
          )}
        >
          {/* Header Superior (Botão Voltar) */}
          <View style={tw`p-4 flex-row items-center`}>
            <TouchableOpacity onPress={onClose} style={tw`p-1`}>
              <ArrowLeft size={24} color="#000000" />
            </TouchableOpacity>
            {/* O #AV-2023-091 ficaria aqui se necessário */}
          </View>

          {/* Área de Visualização da Mídia */}
          <View style={tw`flex-1 items-center justify-center`}>
            
            {/* Container da Imagem (320x320) com Cor de Fundo FFDCC0 */}
            <View 
              style={tw.style(
                'items-center justify-center rounded-lg', 
                { width: 320, height: 320, backgroundColor: '#FFDCC0' } // Cor do protótipo
              )}
            >
              <Text style={tw`text-base text-slate-800 text-center`}>
                Ao clicar na imagem,{'\n'}ela aparece aqui
              </Text>
              {/* Aqui o componente Image ou Video real seria renderizado */}
              {/* <Image source={{ uri: mediaUrl }} style={{ width: 320, height: 320 }} /> */}
            </View>
            
          </View>
          
          {/* Rodapé - Botão de Excluir */}
          <View style={tw`pb-6 pt-4 items-center`}>
            <TouchableOpacity 
              onPress={handleDeletePress}
              // Botão Circular Vermelho (47.98 x 47.98)
              style={tw.style(
                'bg-red-500 rounded-full items-center justify-center', 
                { width: 47.98, height: 47.98 }
              )}
            >
              {/* Ícone de Lixeira (tamanho auto-ajustável) */}
              <Trash2 size={24} color="white" />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};
