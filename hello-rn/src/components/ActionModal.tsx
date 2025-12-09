import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Camera, Video, FileSignature, UserPlus, X } from 'lucide-react-native';
import tw from 'twrnc';
import { useTheme } from '../context/ThemeContext';

export interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: 'FOTO' | 'VIDEO' | 'ASSINATURA' | 'VITIMA') => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ visible, onClose, onAction }) => {
  const { colors, isDark } = useTheme();

  const ActionItem = ({ icon: Icon, label, desc, action, color }: any) => (
    <TouchableOpacity 
      style={[
        tw`flex-row items-center p-4 mb-3 rounded-xl shadow-sm`,
        { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
      ]}
      onPress={() => { onClose(); onAction(action); }}
      activeOpacity={0.7}
    >
      <View style={[tw`w-12 h-12 rounded-full items-center justify-center mr-4`, { backgroundColor: isDark ? '#172554' : '#DBEAFE' }]}> 
        <Icon size={24} color={color ?? colors.primary} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={[tw`text-base font-bold`, { color: colors.text }]}>{label}</Text>
        {desc && <Text style={[tw`text-xs mt-0.5`, { color: colors.textLight }]}>{desc}</Text>}
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
              <View style={[tw`rounded-t-3xl pt-2 pb-8 px-5 max-h-[80%]`, { backgroundColor: colors.surface }]}>
              
              {/* Handle Bar (Indicador visual de puxar) */}
              <View style={tw`items-center py-3`}>
                <View style={[{ width: 48, height: 6, borderRadius: 999, backgroundColor: colors.border }]} />
              </View>

              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>Adicionar Registro</Text>
                <TouchableOpacity onPress={onClose} style={[tw`p-2 rounded-full`, { backgroundColor: colors.background }] }>
                   <X size={20} color={colors.textLight} />
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