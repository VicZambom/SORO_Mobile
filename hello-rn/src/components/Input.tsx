// src/components/Input.tsx
import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import tw from 'twrnc';

interface InputProps extends TextInputProps {
  icon?: React.ElementType; // Permite passar um ícone opcional
}

export const Input = ({ icon: Icon, style, ...rest }: InputProps) => {
  return (
    <View style={tw`flex-row items-center bg-slate-800 rounded-lg px-4 border border-slate-700 mb-4`}>
      {Icon && <Icon color="#94a3b8" size={20} />}
      <TextInput
        placeholderTextColor="#94a3b8"
        style={[tw`flex-1 text-white py-4 ml-3`, style]}
        {...rest}
      />
    </View>
  );
};