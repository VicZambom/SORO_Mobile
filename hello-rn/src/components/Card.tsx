import React from 'react';
import { TouchableOpacity, View, ViewProps } from 'react-native';
import tw from 'twrnc';

interface Props extends ViewProps {
  onPress?: () => void;
  children: React.ReactNode;
}

export const Card: React.FC<Props> = ({ children, style, onPress, ...props }) => {
  const baseStyle = [tw`bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3`, style];

  if (onPress) {
    return (
      <TouchableOpacity style={baseStyle} onPress={onPress} {...(props as any)}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={baseStyle} {...props}>
      {children}
    </View>
  );
};