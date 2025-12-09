import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback, ActivityIndicator, TextInput } from 'react-native';
import { X, Search } from 'lucide-react-native';
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
}

export const SelectionModal: React.FC<SelectionModalProps> = ({ 
  visible, onClose, title, options, onSelect, loading 
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);

  // Atualiza a lista filtrada sempre que o texto ou as opções mudarem
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredOptions(options);
    } else {
      const lowerText = searchText.toLowerCase();
      const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(lowerText)
      );
      setFilteredOptions(filtered);
    }
  }, [searchText, options]);

  // Limpa a busca ao fechar ou abrir o modal
  useEffect(() => {
    if (visible) setSearchText('');
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <TouchableWithoutFeedback>
            <View style={tw`bg-white rounded-t-3xl h-[80%] flex-1 mt-20 shadow-2xl`}>
              
               {/* Handle Bar */}
              <View style={tw`items-center py-3`}>
                <View style={tw`w-12 h-1.5 bg-gray-300 rounded-full`} />
              </View>

              {/* Header com Título e Fechar */}
              <View style={tw`flex-row justify-between items-center px-6 pb-2`}>
                <Text style={tw`text-xl font-bold text-slate-900`}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={tw`p-2 bg-gray-100 rounded-full`}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* BARRA DE BUSCA (NOVO!) */}
              <View style={tw`px-6 pb-4 pt-2`}>
                <View style={tw`flex-row items-center bg-gray-100 rounded-xl px-4 h-12 border border-gray-200`}>
                    <Search size={20} color={COLORS.textLight} style={tw`mr-3`} />
                    <TextInput
                        style={[tw`flex-1 text-base`, { color: COLORS.text }]}
                        placeholder={`Buscar ${title.toLowerCase()}...`}
                        placeholderTextColor={COLORS.textLight}
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="none"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <View style={tw`bg-gray-300 rounded-full p-1`}>
                                <X size={12} color="white" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
              </View>

              <View style={tw`h-[1px] bg-gray-100 w-full`} />

              {/* Lista */}
              {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={tw`mt-4 text-slate-400`}>Carregando opções...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={tw`p-4 pb-10`}
                  keyboardShouldPersistTaps="handled" // Importante para clicar enquanto o teclado está aberto
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={tw`py-4 px-3 border-b border-slate-50 flex-row items-center active:bg-slate-50 rounded-lg`}
                      onPress={() => { 
                          onSelect(item); 
                          onClose(); 
                      }}
                    >
                      <View style={tw`w-2 h-2 rounded-full bg-slate-300 mr-4`} />
                      <Text style={tw`text-base font-medium text-slate-700 flex-1`}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={tw`py-10 items-center px-10`}>
                      <Search size={40} color="#e2e8f0" />
                      <Text style={tw`text-slate-400 text-center mt-3`}>
                        {searchText ? `Nenhum resultado para "${searchText}"` : 'Nenhuma opção disponível.'}
                      </Text>
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