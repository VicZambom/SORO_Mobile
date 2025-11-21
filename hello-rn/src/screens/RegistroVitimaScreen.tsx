// src/screens/RegistroVitimaScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import tw from 'twrnc';

// Componentes Requeridos (Caminhos ajustados de '../../' para '../')
import { ScreenWrapper } from '../components/ScreenWrapper'; 
import { Input } from '../components/Input'; 
import api from '../services/api';
import { RootStackParamList, AppNavigationProp } from '../types/navigation';

// --- Tipagem de Rota ---
type RegistroVitimaRouteProp = RouteProp<RootStackParamList, 'RegistroVitima'>;

// --- Componentes Auxiliares (Botões de Classificação) ---
type VictimStatus = 'LEVE' | 'MODERADO' | 'GRAVE' | 'ÓBITO' | null;

const StatusButton: React.FC<{ status: VictimStatus, currentStatus: VictimStatus, onPress: (s: VictimStatus) => void }> = ({ status, currentStatus, onPress }) => {
    if (!status) return null;

    let bgColor = 'bg-gray-400';
    if (status === 'LEVE') bgColor = 'bg-green-500';
    if (status === 'MODERADO') bgColor = 'bg-yellow-500';
    if (status === 'GRAVE') bgColor = 'bg-red-500';
    if (status === 'ÓBITO') bgColor = 'bg-slate-700';

    const isSelected = status === currentStatus;
    // Opacidade para simular o estado não selecionado, conforme o protótipo
    const opacityClass = isSelected ? 'opacity-100' : 'opacity-40';

    return (
        <TouchableOpacity
            style={tw`flex-1 mx-1 my-1 p-3 rounded-lg items-center ${bgColor} ${opacityClass}`}
            onPress={() => onPress(status)}
        >
            <Text style={tw`text-white font-bold text-sm`}>{status}</Text>
        </TouchableOpacity>
    );
};

// --- TELA PRINCIPAL: RegistroVitimaScreen ---
export const RegistroVitimaScreen: React.FC = () => {
    const navigation = useNavigation<AppNavigationProp>();
    const route = useRoute<RegistroVitimaRouteProp>();
    
    const { ocorrenciaId } = route.params; 

    // Estados do Formulário
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState('');
    const [sexo, setSexo] = useState('');
    const [status, setStatus] = useState<VictimStatus>(null);
    const [destino, setDestino] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        // Validação Mínima
        if (!idade || !sexo || !status || !destino) {
            Alert.alert('Erro', 'Preencha os campos obrigatórios: Idade, Sexo, Classificação e Destino.');
            return;
        }

        const dadosVitima = {
            ocorrenciaId,
            nome: nome || 'Vítima Não Identificada',
            idade: Number(idade),
            sexo,
            status,
            destino,
            observacoes,
        };

        try {
            setLoading(true);
            // Simulação da chamada API
            // await api.post(`/ocorrencias/${ocorrenciaId}/vitimas`, dadosVitima);
            
            Alert.alert('Sucesso', 'Vítima registrada com sucesso!');
            navigation.goBack(); 
        } catch (error) {
            Alert.alert('Erro', 'Falha ao registrar a vítima.');
        } finally {
            setLoading(false);
        }
    };
    
    // Header customizado (seta + título + botão Cancelar)
    const renderHeader = () => (
        <View style={tw`flex-row justify-between items-center px-4 pt-4 pb-2 bg-slate-50 border-b border-gray-100`}>
            {/* Seta para Voltar */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
                <ArrowLeft size={24} color="#334155" />
            </TouchableOpacity>
            
            {/* Título Centralizado (Não centralizado, mas sim float à esquerda do Cancelar) */}
            <Text style={tw`text-xl font-bold text-slate-800`}>Nova Vítima</Text>
            
            {/* Botão Cancelar Vermelho */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
                <Text style={tw`text-red-500 font-semibold text-lg`}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenWrapper>
            
            {renderHeader()}
            
            <KeyboardAvoidingView 
                style={tw`flex-1`}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={tw`p-4`}>
                    
                    {/* Nome Completo (Opcional) */}
                    <Input 
                        label="Nome Completo (Opcional)" 
                        placeholder="Digite o nome da vítima"
                        value={nome}
                        onChangeText={setNome}
                    />

                    {/* Idade e Sexo (Inputs lado a lado) */}
                    <View style={tw`flex-row justify-between`}>
                        <View style={tw`w-[48%]`}>
                            <Input
                                label="Idade"
                                placeholder="45"
                                value={idade}
                                onChangeText={setIdade}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={tw`w-[48%]`}>
                            <Input
                                label="Sexo"
                                placeholder="Masc. ou Fem."
                                value={sexo}
                                onChangeText={setSexo}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Classificação (Botões de Toque) */}
                    <Text style={tw`text-slate-900 font-bold mb-2 text-base`}>Classificação (Toque para selecionar)</Text>
                    <View style={tw`flex-row flex-wrap justify-between mb-4`}>
                        <StatusButton status="LEVE" currentStatus={status} onPress={setStatus} />
                        <StatusButton status="MODERADO" currentStatus={status} onPress={setStatus} />
                        <StatusButton status="GRAVE" currentStatus={status} onPress={setStatus} />
                        <StatusButton status="ÓBITO" currentStatus={status} onPress={setStatus} />
                    </View>
                    
                    {/* Destino / Unidade de Saúde */}
                    <Input
                        label="Destino / Unidade de Saúde"
                        placeholder="Nome do Hospital, UPA ou Atendimento"
                        value={destino}
                        onChangeText={setDestino}
                    />
                    
                    {/* Observações / Lesões (Textarea/Multiline Input) */}
                    <View style={tw`mb-4`}>
                        <Input
                            label="Observações / Lesões"
                            placeholder="Descreva lesões, condições ou observações"
                            value={observacoes}
                            onChangeText={setObservacoes}
                            multiline={true}
                            numberOfLines={4}
                            style={tw`h-32 pt-2`}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
            
            {/* Rodapé - Botão Registrar Vítima */}
            <View style={tw`p-4 border-t border-gray-100 bg-white`}>
                <TouchableOpacity 
                    style={tw`py-4 rounded-lg bg-green-600 items-center ${loading ? 'opacity-70' : ''}`}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                         <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={tw`text-white text-base font-bold`}>REGISTRAR VÍTIMA</Text>
                    )}
                </TouchableOpacity>
            </View>
            
        </ScreenWrapper>
    );
};
