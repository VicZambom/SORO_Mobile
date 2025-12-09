import React from 'react';
import { View, StatusBar } from 'react-native'; // Removido SafeAreaView daqui
import { SafeAreaView } from 'react-native-safe-area-context'; // Adicionado aqui
import tw from 'twrnc';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
}

export const ScreenWrapper: React.FC<Props> = ({ children }) => {
  const { colors, statusBarStyle } = useTheme();
  
  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} />
      <View style={[tw`flex-1 px-4 pt-4`, { backgroundColor: colors.background }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};