import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';

interface Props {
  title: string;
  showBack?: boolean;
}

export const Header: React.FC<Props> = ({ title, showBack = true }) => {
  const navigation = useNavigation();
  return (
    <View style={tw`flex-row items-center mb-6 mt-2`}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4 p-2 bg-white rounded-full shadow-sm`}>
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
      )}
      <Text style={tw`text-xl font-bold text-slate-800 flex-1`}>{title}</Text>
    </View>
  );
};