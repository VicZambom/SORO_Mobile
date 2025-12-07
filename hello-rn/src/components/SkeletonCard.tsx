import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import tw from 'twrnc';

export const SkeletonCard = () => {
  // Valor inicial da opacidade
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Cria um loop infinito de animação 
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop(); // Limpa a animação ao desmontar
  }, [opacity]);

  return (
    <Animated.View 
      style={[
        tw`bg-gray-200 rounded-xl mb-3 border border-gray-100`, 
        { height: 110, opacity } // Altura fixa simula o tamanho do card real
      ]} 
    />
  );
};