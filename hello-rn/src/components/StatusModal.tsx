import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import tw from 'twrnc';
import { COLORS } from '../constants/theme';

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
  const getConfig = () => {
    switch (type) {
      case 'SUCCESS': return { icon: CheckCircle, color: COLORS.success, bg: 'bg-green-100' };
      case 'ERROR': return { icon: XCircle, color: COLORS.danger, bg: 'bg-red-100' };
      case 'WARNING': return { icon: AlertTriangle, color: COLORS.warning, bg: 'bg-yellow-100' };
      default: return { icon: Info, color: COLORS.primary, bg: 'bg-blue-100' };
    }
  };

  const { icon: Icon, color, bg } = getConfig();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={tw`flex-1 justify-center items-center bg-black/60 px-6`}>
        <TouchableWithoutFeedback>
          <View style={tw`bg-white w-full rounded-2xl p-6 shadow-2xl items-center`}>
            
            {/* Ícone de destaque */}
            <View style={tw`w-16 h-16 rounded-full ${bg} items-center justify-center mb-4`}>
              <Icon size={32} color={color} />
            </View>

            {/* Texto */}
            <Text style={[tw`text-xl font-bold text-center mb-2`, { color: COLORS.text }]}>
              {title}
            </Text>
            
            {message && (
              <Text style={[tw`text-base text-center mb-6 text-slate-500 leading-6`]}>
                {message}
              </Text>
            )}

            {/* Botões */}
            <View style={tw`w-full flex-row justify-center`}>
              {/* Botão Cancelar (Só aparece se cancelText for passado) */}
              {cancelText && (
                <TouchableOpacity 
                  style={tw`flex-1 py-3 mr-3 rounded-xl border border-gray-200 items-center`}
                  onPress={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                >
                  <Text style={[tw`font-bold`, { color: COLORS.textLight }]}>{cancelText}</Text>
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