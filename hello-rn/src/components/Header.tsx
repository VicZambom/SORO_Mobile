import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import tw from 'twrnc';

interface Props {
  title: string;
  showBack?: boolean;
}

export const Header: React.FC<Props> = ({ title, showBack = true }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  return (
    <View style={tw`flex-row items-center mb-6 mt-2`}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={[tw`mr-4 p-2 rounded-full`, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <Text style={[tw`text-xl font-bold flex-1`, { color: colors.text }]}>{title}</Text>
    </View>
  );
};