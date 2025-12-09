import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { X, Check } from 'lucide-react-native';
import tw from 'twrnc';
import { COLORS } from '../constants/theme';

interface Option {
  id: string;
  label: string;
}

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  onSelect: (item: Option) => void;
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({ 
  visible, onClose, title, options, onSelect, loading 
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/40`}>
          <TouchableWithoutFeedback>
            <View style={tw`bg-white rounded-t-3xl max-h-[70%] flex-1`}>
              
               {/* Handle Bar */}
              <View style={tw`items-center py-3`}>
                <View style={tw`w-12 h-1.5 bg-gray-300 rounded-full`} />
              </View>

              {/* Header */}
              <View style={tw`flex-row justify-between items-center px-6 pb-4 border-b border-gray-100`}>
                <Text style={tw`text-xl font-bold text-slate-900`}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={tw`p-2 bg-gray-50 rounded-full`}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={tw`p-10 items-center`}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={tw`mt-4 text-slate-400`}>Carregando opções...</Text>
                </View>
              ) : (
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={tw`p-4 pb-10`}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={tw`py-4 px-3 border-b border-slate-50 flex-row items-center active:bg-slate-50 rounded-lg`}
                      onPress={() => { onSelect(item); onClose(); }}
                    >
                      <View style={tw`w-2 h-2 rounded-full bg-slate-300 mr-4`} />
                      <Text style={tw`text-base font-medium text-slate-700 flex-1`}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={tw`py-10 items-center`}>
                      <Text style={tw`text-slate-400`}>Nenhuma opção disponível.</Text>
                    </View>
                  }
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};