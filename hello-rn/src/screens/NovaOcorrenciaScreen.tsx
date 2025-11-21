// src/screens/NovaOcorrenciaScreen.tsx (Atualizado para o Wizard - Etapa 1)

import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

import { ScreenWrapper } from '../components/ScreenWrapper'; 
import { Header } from '../components/Header'; 
import { AppNavigationProp } from '../types/navigation'; 

// --- SIMULAÇÃO DE COMPONENTES ---
// Simulação de um componente Select (Substitua pelo seu componente Select real)
const Select = ({ placeholder }: { placeholder: string }) => (
    <View style={tw`border border-gray-300 rounded-lg p-3 mb-4 bg-white flex-row justify-between items-center`}>
        <Text style={tw`text-slate-500`}>{placeholder}</Text>
        <Text style={tw`text-lg text-slate-500`}>▼</Text>
    </View>
);

// Componente para o indicador de progresso (Wizard)
const StepIndicator = ({ step, title, isActive }: { step: number, title: string, isActive: boolean }) => (
    <View style={tw`items-center mx-3`}>
        <View style={tw`w-6 h-6 rounded-full ${isActive ? 'bg-blue-800' : 'bg-gray-300'} items-center justify-center mb-1`}>
            <Text style={tw`text-white text-xs font-bold`}>{step}</Text>
        </View>
        <Text style={tw`text-xs ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{title}</Text>
    </View>
);

export const NovaOcorrenciaScreen: React.FC = () => {
    const navigation = useNavigation<AppNavigationProp>();
    // Simulação do passo atual
    const [currentStep, setCurrentStep] = useState(1); 

    const handleNext = () => {
        // Lógica de validação da Etapa 1 aqui
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            // Se for a última etapa, chama o registro final
            // handleRegistrarOcorrencia();
        }
    };

    const renderStepContent = () => {
        // Renderiza apenas a Etapa 1 (Classificação da Ocorrência)
        if (currentStep === 1) {
            return (
                <View>
                    <Text style={tw`text-xl font-bold text-slate-800 mt-4 mb-4`}>Classificação da Ocorrência</Text>
                    <Select placeholder="Natureza" />
                    <Select placeholder="Grupo" />
                    <Select placeholder="Subgrupo" />
                    
                    {/* Alerta de Modo Offline */}
                    <View style={tw`p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4 flex-row justify-between items-center`}>
                        <Text style={tw`text-yellow-800 text-sm`}>
                            ⚡ Modo Offline: Registro será salvo localmente.
                        </Text>
                        <Text style={tw`text-yellow-800 font-bold ml-4`}>×</Text>
                    </View>
                </View>
            );
        }
        // As Etapas 2 (Local) e 3 (Detalhes) viriam aqui
        return <Text style={tw`text-center text-slate-500`}>Conteúdo da Etapa {currentStep}...</Text>;
    };

    return (
        <ScreenWrapper>
            <Header title="Nova Ocorrência" showBack={true} /> 
            
            {/* Indicador de Etapas (Wizard) */}
            <View style={tw`flex-row justify-center items-center py-4 bg-white border-b border-gray-100`}>
                <StepIndicator step={1} title="Tipo" isActive={currentStep === 1} />
                <View style={tw`w-8 h-px bg-gray-300`} />
                <StepIndicator step={2} title="Local" isActive={currentStep === 2} />
                <View style={tw`w-8 h-px bg-gray-300`} />
                <StepIndicator step={3} title="Detalhes" isActive={currentStep === 3} />
            </View>

            <KeyboardAvoidingView 
                style={tw`flex-1`}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={tw`p-4`}>
                    {renderStepContent()}
                </ScrollView>
            </KeyboardAvoidingView>
            
            {/* Botão Próximo */}
            <View style={tw`p-4 border-t border-gray-100 bg-white`}>
                <TouchableOpacity 
                    style={tw`py-4 rounded-lg bg-slate-900 items-center`}
                    onPress={handleNext}
                >
                    <Text style={tw`text-white text-base font-bold`}>PRÓXIMO ›</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};