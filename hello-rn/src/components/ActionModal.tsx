import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Camera, Video, FileSignature, UserPlus, X } from 'lucide-react-native';
import tw from 'twrnc';
import { COLORS } from '../constants/theme';

export interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: 'FOTO' | 'VIDEO' | 'ASSINATURA' | 'VITIMA') => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ visible, onClose, onAction }) => {
  
  const ActionItem = ({ icon: Icon, label, desc, action, color = COLORS.primary }: any) => (
    <TouchableOpacity 
      style={tw`flex-row items-center p-4 mb-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm`} 
      onPress={() => { onClose(); onAction(action); }}
      activeOpacity={0.7}
    >
      <View style={[tw`w-12 h-12 rounded-full items-center justify-center mr-4`, { backgroundColor: '#DBEAFE' }]}> 
        <Icon size={24} color={color} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-bold text-slate-800`}>{label}</Text>
        {desc && <Text style={tw`text-xs text-slate-500 mt-0.5`}>{desc}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 bg-black/40 justify-end`}>
          <TouchableWithoutFeedback>
            <View style={tw`bg-white rounded-t-3xl pt-2 pb-8 px-5 max-h-[80%]`}>
              
              {/* Handle Bar (Indicador visual de puxar) */}
              <View style={tw`items-center py-3`}>
                <View style={tw`w-12 h-1.5 bg-gray-300 rounded-full`} />
              </View>

              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text style={tw`text-xl font-bold text-slate-900`}>Adicionar Registro</Text>
                <TouchableOpacity onPress={onClose} style={tw`p-2 bg-gray-100 rounded-full`}>
                   <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ActionItem 
                icon={Camera} 
                label="Tirar Foto" 
                desc="Registrar danos ou cenário." 
                action="FOTO" 
                color="#2563EB"
              />

              <ActionItem 
                icon={FileSignature} 
                label="Coletar Assinatura" 
                desc="Testemunha ou solicitante." 
                action="ASSINATURA" 
                color="#2563EB"
              />

              <ActionItem 
                icon={UserPlus} 
                label="Registrar Vítima" 
                desc="Adicionar dados de atendidos." 
                action="VITIMA" 
                color="#DC2626" // Vermelho para destacar emergência
              />
              
               <ActionItem 
                icon={Video} 
                label="Gravar Vídeo" 
                desc="Em breve." 
                action="VIDEO" 
                color="#94A3B8"
              />

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};