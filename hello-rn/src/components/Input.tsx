// src/components/Input.tsx
import React from 'react';
import { View, TextInput, TextInputProps, Text } from 'react-native';
import tw from 'twrnc';

interface InputProps extends TextInputProps {
  label?: string; 
  icon?: React.ElementType;
  isPassword?: boolean;
}

export const Input = ({ label, style, ...rest }: InputProps) => {
  return (
    <View style={tw`mb-4 w-full`}>
      {/* Renderiza a Label se ela for passada */}
      {label && <Text style={tw`text-slate-900 font-bold mb-2 text-base`}>{label}</Text>}
      
      {/* Container do Input com fundo cinza claro (gray-100) e borda suave */}
      <View style={tw`flex-row items-center bg-gray-100 rounded-lg px-4 border border-gray-200`}>
        <TextInput
          placeholderTextColor="#94a3b8"
          style={[tw`flex-1 text-slate-800 py-4 text-base`, style]}
          {...rest}
        />
      </View>
    </View>
  );
};