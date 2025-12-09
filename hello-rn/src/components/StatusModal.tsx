import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import tw from 'twrnc';
import { useTheme } from '../context/ThemeContext';

export type StatusModalType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  type?: StatusModalType;
  title: string;
  message?: string;
  // Botão Principal
  confirmText?: string;
  onConfirm?: () => void;
  // Botão Secundário (Opcional, para confirmações tipo "Sim/Não")
  cancelText?: string;
  onCancel?: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({ 
  visible, onClose, type = 'INFO', title, message, 
  confirmText = 'OK', onConfirm, 
  cancelText, onCancel 
}) => {

  // Configuração visual baseada no tipo
  const { colors } = useTheme();

  const getConfig = () => {
    switch (type) {
      case 'SUCCESS': return { icon: CheckCircle, color: colors.success, bgColor: '#ECFDF5' };
      case 'ERROR': return { icon: XCircle, color: colors.danger, bgColor: '#FEF2F2' };
      case 'WARNING': return { icon: AlertTriangle, color: colors.warning, bgColor: '#FFFBEB' };
      default: return { icon: Info, color: colors.primary, bgColor: '#EFF6FF' };
    }
  };

  const { icon: Icon, color, bgColor } = getConfig();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={tw`flex-1 justify-center items-center bg-black/60 px-6`}>
        <TouchableWithoutFeedback>
          <View style={[tw`w-full rounded-2xl p-6 shadow-2xl items-center`, { backgroundColor: colors.surface }]}>
            
            {/* Ícone de destaque */}
            <View style={[tw`w-16 h-16 rounded-full items-center justify-center mb-4`, { backgroundColor: bgColor }]}>
              <Icon size={32} color={color} />
            </View>

            {/* Texto */}
            <Text style={[tw`text-xl font-bold text-center mb-2`, { color: colors.text }]}>
              {title}
            </Text>
            
            {message && (
              <Text style={[tw`text-base text-center mb-6 leading-6`, { color: colors.textLight }]}>
                {message}
              </Text>
            )}

            {/* Botões */}
            <View style={tw`w-full flex-row justify-center`}>
              {/* Botão Cancelar (Só aparece se cancelText for passado) */}
              {cancelText && (
                <TouchableOpacity 
                  style={[tw`flex-1 py-3 mr-3 rounded-xl items-center`, { borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                >
                  <Text style={[tw`font-bold`, { color: colors.textLight }]}>{cancelText}</Text>
                </TouchableOpacity>
              )}

              {/* Botão Confirmar */}
              <TouchableOpacity 
                style={[tw`flex-1 py-3 rounded-xl items-center shadow-sm`, { backgroundColor: color }]}
                onPress={handleConfirm}
              >
                <Text style={tw`text-white font-bold tracking-wide uppercase`}>{confirmText}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};