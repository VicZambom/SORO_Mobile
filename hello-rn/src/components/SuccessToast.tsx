// src/components/SuccessToast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native'; // Ícone de OK
import tw from 'twrnc';

interface SuccessToastProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({ isVisible, message, onClose }) => {
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isVisible) {
      // Configura o timer para fechar após 3000ms (3 segundos)
      timer = setTimeout(onClose, 3000); 
    }
    return () => {
      // Limpa o timer se o componente for desmontado ou a visibilidade mudar
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    // View que flutua no topo (top-20 é para ficar abaixo do Header) e centraliza
    <View style={tw`absolute top-20 w-full items-center z-50`}>
        {/*
          Estilo do Modal/Toast:
          - bg-white, rounded-xl, shadow-lg.
          - Simulação de 360W x 60H usando w-11/12 (90% da largura) e padding vertical/horizontal.
        */}
        <View style={tw`w-11/12 bg-white px-4 py-3 rounded-xl shadow-lg border border-green-200 flex-row items-center`}>
            
            {/* Ícone Circular Verde de OK (tamanho 24) */}
            <CheckCircle size={24} color="#10b981" style={tw`mr-3`} /> 
            
            {/* Frase "Ocorrência Finalizada com Sucesso!" (Poppins Medium 20) */}
            <Text style={tw`text-xl text-green-700 font-medium`}> 
                {message}
            </Text>
        </View>
    </View>
  );
};
