import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback, ActivityIndicator, TextInput } from 'react-native';
import { X, Search } from 'lucide-react-native';
import tw from 'twrnc';
import { useTheme } from '../context/ThemeContext';

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

  const { colors, isDark } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <TouchableWithoutFeedback>
            <View style={[tw`rounded-t-3xl h-[80%] flex-1 mt-20 shadow-2xl`, { backgroundColor: colors.surface }] }>
              
               {/* Handle Bar */}
              <View style={tw`items-center py-3`}>
                <View style={[{ width: 48, height: 6, borderRadius: 999, backgroundColor: colors.border }]} />
              </View>

              {/* Header com Título e Fechar */}
              <View style={tw`flex-row justify-between items-center px-6 pb-2`}>
                <Text style={[tw`text-xl font-bold`, { color: colors.text }]}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={[tw`p-2 rounded-full`, { backgroundColor: colors.background }] }>
                  <X size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>

              {/* BARRA DE BUSCA (NOVO!) */}
              <View style={tw`px-6 pb-4 pt-2`}>
                <View style={[tw`flex-row items-center rounded-xl px-4 h-12`, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}>
                  <Search size={20} color={colors.textLight} style={tw`mr-3`} />
                  <TextInput
                    style={[tw`flex-1 text-base`, { color: colors.text }]}
                    placeholder={`Buscar ${title.toLowerCase()}...`}
                    placeholderTextColor={colors.textLight}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <View style={[tw`rounded-full p-1`, { backgroundColor: colors.border }]}>
                        <X size={12} color={colors.surface} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={[{ height: 1, backgroundColor: colors.border, width: '100%' }]} />

              {/* Lista */}
              {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[tw`mt-4`, { color: colors.textLight }]}>Carregando opções...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={tw`p-4 pb-10`}
                  keyboardShouldPersistTaps="handled" // Importante para clicar enquanto o teclado está aberto
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[tw`py-4 px-3 flex-row items-center rounded-lg`, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                      onPress={() => { 
                          onSelect(item); 
                          onClose(); 
                      }}
                    >
                      <View style={[tw`w-2 h-2 rounded-full mr-4`, { backgroundColor: colors.textLight }]} />
                      <Text style={[tw`text-base font-medium flex-1`, { color: colors.text }] }>
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