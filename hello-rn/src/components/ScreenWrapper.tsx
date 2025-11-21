import React from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import tw from 'twrnc';

interface Props {
  children: React.ReactNode;
}

export const ScreenWrapper: React.FC<Props> = ({ children }) => {
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={tw`flex-1 px-4 pt-4`}>
        {children}
      </View>
    </SafeAreaView>
  );
};