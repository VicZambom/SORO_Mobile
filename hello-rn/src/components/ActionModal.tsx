import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Camera, Video, FileSignature, UserPlus } from 'lucide-react-native';
import tw from 'twrnc';

export interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: 'FOTO' | 'VIDEO' | 'ASSINATURA' | 'VITIMA') => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ visible, onClose, onAction }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay Escuro (Fecha ao clicar fora) */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 bg-black/60 justify-end`}>
          
          {/* Conteúdo do Modal (Impede que o clique no modal feche ele mesmo) */}
          <TouchableWithoutFeedback>
            <View style={tw`bg-white rounded-t-3xl p-6 pb-10`}>
              
              {/* Título */}
              <Text style={tw`text-lg font-bold text-center text-slate-900 mb-8`}>
                Adicionar à Ocorrência
              </Text>

              {/* Opção 1: Tirar Foto */}
              <TouchableOpacity 
                style={tw`flex-row items-center mb-6`} 
                onPress={() => { onClose(); onAction('FOTO'); }}
              >
                <View style={tw`w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4`}>
                  <Camera size={24} color="#2563EB" />
                </View>
                <View>
                  <Text style={tw`text-base font-bold text-slate-800`}>Tirar Foto</Text>
                  <Text style={tw`text-xs text-slate-500`}>Registrar danos ou cenário.</Text>
                </View>
              </TouchableOpacity>

              {/* Opção 2: Gravar Vídeo */}
              <TouchableOpacity 
                style={tw`flex-row items-center mb-6`}
                onPress={() => { onClose(); onAction('VIDEO'); }}
              >
                <View style={tw`w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4`}>
                  <Video size={24} color="#2563EB" />
                </View>
                <View>
                  <Text style={tw`text-base font-bold text-slate-800`}>Gravar Vídeo</Text>
                </View>
              </TouchableOpacity>

              {/* Opção 3: Coletar Assinatura */}
              <TouchableOpacity 
                style={tw`flex-row items-center mb-6`}
                onPress={() => { onClose(); onAction('ASSINATURA'); }}
              >
                <View style={tw`w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4`}>
                  <FileSignature size={24} color="#2563EB" />
                </View>
                <View>
                  <Text style={tw`text-base font-bold text-slate-800`}>Coletar Assinatura</Text>
                  <Text style={tw`text-xs text-slate-500`}>Testemunha ou proprietário.</Text>
                </View>
              </TouchableOpacity>

              {/* Opção 4: Registrar Vítima */}
              <TouchableOpacity 
                style={tw`flex-row items-center mb-8`}
                onPress={() => { onClose(); onAction('VITIMA'); }}
              >
                <View style={tw`w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4`}>
                  <UserPlus size={24} color="#2563EB" />
                </View>
                <View>
                  <Text style={tw`text-base font-bold text-slate-800`}>Registrar Vítima</Text>
                </View>
              </TouchableOpacity>

              {/* Botão Cancelar */}
              <TouchableOpacity 
                style={tw`w-full py-4 border border-red-500 rounded-xl items-center`}
                onPress={onClose}
              >
                <Text style={tw`text-red-600 font-bold text-base`}>Cancelar</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};