// src/screens/Ocorrencias/OcorrenciaDetalheScreen.tsx
import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'; // Adicionado useNavigation
import { Clock, MapPin, AlertTriangle, BookOpen } from 'lucide-react-native';
import tw from 'twrnc';

// Componentes Requeridos (Kit Lego)
import { ScreenWrapper } from '../components/ScreenWrapper'; 
import { Header } from '../components/Header'; 
import { Card } from '../components/Card'; 
// NOVO IMPORT: O Toast de Sucesso
import { SuccessToast } from '../components/SuccessToast'; 

import api from '../services/api'; 
import { RootStackParamList, AppNavigationProp } from '../types/navigation'; 

// --- 1. Tipagem ---
interface OcorrenciaDetalhe {
    id: string;
    codigo: string;
    natureza: string;
    subgrupo: string;
    formoAviso: string;
    numeroAviso: string;
    enderecoRua: string;
    enderecoNumero: string; 
    enderecoDetalhe: string; 
    vitimas: number;
    midias: number;
    status: 'PENDENTE' | 'EM ANDAMENTO' | 'FINALIZADA'; // Adicionado FINALIZADA
    dataHoraOcorrencia: string;
    linhaTempo: { hora: string; evento: string; viatura?: string }[];
}

type OcorrenciaDetalheRouteProp = RouteProp<RootStackParamList, 'OcorrenciaDetalhe'>;

// --- 2. Componentes Auxiliares de UI ---
const InfoBlock: React.FC<{ title: string, value: string | number }> = ({ title, value }) => (
    <View style={tw`mb-3 w-1/2`}>
        <Text style={tw`text-xs font-semibold text-slate-500 uppercase`}>{title}</Text>
        <Text style={tw`text-base text-slate-800 font-bold`}>{value}</Text>
    </View>
);

const TimelineItem: React.FC<{ hora: string, evento: string, viatura?: string, isFirst?: boolean }> = ({ hora, evento, viatura, isFirst }) => (
    <View style={tw`flex-row mb-4`}>
        <View style={tw`w-6 items-center`}>
            <View style={tw`w-2.5 h-2.5 rounded-full ${isFirst ? 'bg-orange-600' : 'bg-gray-400'}`} />
            <View style={tw`w-px bg-gray-300 flex-1 my-1`} />
        </View>
        <View style={tw`ml-3 flex-1 -mt-1`}>
            <Text style={tw`text-sm font-semibold text-slate-900`}>{hora} - {evento}</Text>
            {viatura && <Text style={tw`text-xs text-slate-500 mt-0.5`}>Viatura {viatura}</Text>}
        </View>
    </View>
);

// --- 3. TELA PRINCIPAL ---

export const OcorrenciaDetalheScreen: React.FC = () => {
    const route = useRoute<OcorrenciaDetalheRouteProp>();
    const navigation = useNavigation<AppNavigationProp>();
    const { id } = route.params;

    const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'geral' | 'midia' | 'vitimas'>('geral');
    
    // NOVOS ESTADOS PARA O MODAL
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    
    // Simulação de dados para o ID 1
    const mockData: OcorrenciaDetalhe = {
        id: '1',
        codigo: '#AV-2023-091',
        natureza: 'Incêndio',
        subgrupo: 'Em Edificação',
        formoAviso: 'Rádio 193',
        numeroAviso: '091',
        enderecoRua: 'Rua dos Navegantes',
        enderecoNumero: 'N°450',
        enderecoDetalhe: 'Boa Viagem, Recife - PE',
        vitimas: 2,
        midias: 2,
        status: 'EM ANDAMENTO',
        dataHoraOcorrencia: '14:35',
        linhaTempo: [
            { hora: '14:45', evento: 'Chegada ao Local', viatura: 'ABT-01' },
            { hora: '14:35', evento: 'Deslocamento Iniciado' },
            { hora: '14:30', evento: 'Ocorrência Gerada' },
        ]
    };

    const fetchDetalhes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Simulação da chamada
            if (id === '1') { 
                setOcorrencia(mockData);
            } else {
                 setOcorrencia(null);
                 setError('Ocorrência não encontrada.');
            }
        } catch (err) {
            console.error('Erro ao buscar detalhes da ocorrência:', err);
            setError('Falha ao carregar os detalhes da ocorrência.');
        } finally {
            setLoading(false);
        }
    };

    // NOVA FUNÇÃO: Lógica para Finalizar a Ocorrência
    const handleFinalizarOcorrencia = async () => {
        // Você poderia adicionar um modal de confirmação antes deste bloco
        
        try {
            setIsFinalizing(true);
            // Simulação de chamada de API:
            // await api.post(`/ocorrencias/${id}/finalizar`); 
            
            // Simulação de tempo de processamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 1. Exibe o Toast de sucesso
            setShowSuccessToast(true);
            
            // 2. Atualiza o status da ocorrência localmente para FINALIZADA (UI feedback)
            setOcorrencia(prev => prev ? { ...prev, status: 'FINALIZADA' } : null);
            
            // 3. (Opcional) Navegar de volta para a lista após o toast:
            // setTimeout(() => navigation.goBack(), 3000); 
            
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível finalizar a ocorrência. Tente novamente.');
        } finally {
            setIsFinalizing(false);
        }
    };

    useEffect(() => {
        fetchDetalhes();
    }, [id]);
    
    // ... Renderização de Status (Loading / Erro) ...

    if (loading) { return (<ScreenWrapper><Header title="Detalhes" showBack={true} /><View style={tw`flex-1 justify-center items-center`}><ActivityIndicator size="large" color="#2563eb" /></View></ScreenWrapper>);}
    if (error || !ocorrencia) { return (<ScreenWrapper><Header title="Detalhes" showBack={true} /><View style={tw`flex-1 justify-center items-center px-4`}><AlertTriangle color="#ef4444" size={32} /><Text style={tw`text-lg font-semibold text-red-500 mt-4 text-center`}>{error || 'Ocorrência não encontrada.'}</Text></View></ScreenWrapper>);}

    // Função para renderizar o conteúdo da aba selecionada
    const renderContent = () => {
        // ... (Corpo da função renderContent é o mesmo do passo anterior)
        switch (activeTab) {
            case 'geral':
                return (
                    <View>
                        <Card style={tw`mb-4 p-4`}>
                            <Text style={tw`text-base font-bold text-slate-800 mb-4`}>Informações</Text>
                            <View style={tw`flex-row flex-wrap`}>
                                <InfoBlock title="Natureza" value={ocorrencia!.natureza} />
                                <InfoBlock title="Subgrupo" value={ocorrencia!.subgrupo} />
                                <InfoBlock title="Formo" value={ocorrencia!.formoAviso} />
                                <InfoBlock title="Nº do Aviso" value={ocorrencia!.numeroAviso} />
                            </View>
                        </Card>
                        <Card style={tw`mb-4 p-4`}>
                            <Text style={tw`text-base font-bold text-slate-800 mb-4`}>Linha do Tempo</Text>
                            {ocorrencia!.linhaTempo.slice().reverse().map((item, index) => (
                                <TimelineItem 
                                    key={index} 
                                    {...item} 
                                    isFirst={index === 0}
                                />
                            ))}
                        </Card>
                    </View>
                );
            case 'midia':
                return (
                    <View style={tw`items-center justify-center py-10`}>
                        <Text style={tw`text-slate-500`}>Aba MÍDIA: Aqui será exibida a galeria de fotos e vídeos.</Text>
                        <Text style={tw`text-xl font-bold text-slate-900 mt-2`}>Total de Anexos: {ocorrencia!.midias}</Text>
                    </View>
                );
            case 'vitimas':
                return (
                    <View style={tw`items-center justify-center py-10`}>
                        <Text style={tw`text-slate-500`}>Aba VÍTIMAS: Aqui será feita a gestão das vítimas.</Text>
                        <Text style={tw`text-4xl font-bold text-slate-900 mt-4`}>{ocorrencia!.vitimas}</Text>
                        <Text style={tw`text-slate-600`}>Vítimas Envolvidas</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    // --- UI Final ---
    const isFinished = ocorrencia.status === 'FINALIZADA';
    
    return (
        <ScreenWrapper>
            <Header title="" showBack={true} /> 
            
            <ScrollView style={tw`flex-1 -mt-6`}>
                
                {/* TOP BOX COM ENDEREÇO E STATUS */}
                <View style={tw`bg-white px-4 py-4 rounded-xl shadow-lg border border-slate-100 mx-1`}>
                    
                    {/* Status e Código */}
                    <View style={tw`flex-row justify-between items-center mb-4`}>
                        <View style={tw`flex-row items-center`}>
                            <Clock size={16} color={isFinished ? "#10b981" : "#f97316"} style={tw`mr-2`} />
                            <Text style={tw`text-sm font-bold ${isFinished ? 'text-green-600' : 'text-orange-500'} uppercase`}>
                                {isFinished ? 'FINALIZADA' : ocorrencia.status} • {ocorrencia.dataHoraOcorrencia}
                            </Text>
                        </View>
                        <Text style={tw`text-xs font-bold text-slate-500`}>{ocorrencia.codigo}</Text>
                    </View>
                    
                    {/* Endereço e Mapa Simulado */}
                    <View style={tw`flex-row justify-between items-start`}>
                        <View style={tw`flex-1 pr-4`}>
                            <Text style={tw`text-xl font-bold text-slate-900`}>
                                {ocorrencia.enderecoRua},{'\n'}
                                <Text style={tw`text-2xl font-bold text-slate-900`}>{ocorrencia.enderecoNumero}</Text>
                            </Text>
                            <Text style={tw`text-sm text-slate-600 mt-1`}>{ocorrencia.enderecoDetalhe}</Text>
                        </View>
                        
                        <View style={tw`w-16 h-16 bg-gray-200 rounded-lg items-center justify-center border border-gray-300`}>
                            <MapPin size={24} color="#0f172a" />
                        </View>
                    </View>
                </View>

                {/* NAVEGAÇÃO DE ABAS (TABS) */}
                <View style={tw`flex-row justify-between border-b border-gray-200 mt-4 px-1`}>
                    {[
                        { key: 'geral', title: 'GERAL', count: null },
                        { key: 'midia', title: 'MÍDIA', count: ocorrencia.midias },
                        { key: 'vitimas', title: 'VÍTIMAS', count: ocorrencia.vitimas },
                    ].map((tab) => (
                        <TouchableOpacity 
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as 'geral' | 'midia' | 'vitimas')}
                            style={tw`flex-1 items-center pb-3 ${activeTab === tab.key ? 'border-b-2 border-slate-900' : ''}`}
                        >
                            <Text style={tw`text-sm font-bold ${activeTab === tab.key ? 'text-slate-900' : 'text-slate-500'}`}>
                                {tab.title} {tab.count !== null ? `(${tab.count})` : ''}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                {/* CONTEÚDO DA ABA */}
                <View style={tw`mt-4 px-1`}>
                    {renderContent()}
                </View>
                
            </ScrollView>
            
            {/* FAB para Ações (Opções) */}
            <TouchableOpacity 
                style={tw`absolute bottom-20 right-6 bg-slate-900 w-14 h-14 rounded-full items-center justify-center shadow-lg z-40`}
                onPress={() => setIsModalVisible(true)} 
                disabled={isFinished || isFinalizing}
            >
                <View style={tw`w-1 h-1 bg-white rounded-full my-0.5`} />
                <View style={tw`w-1 h-1 bg-white rounded-full my-0.5`} />
                <View style={tw`w-1 h-1 bg-white rounded-full my-0.5`} />
            </TouchableOpacity>

            {/* Rodapé - Botão Fixo "Finalizar Ocorrência" */}
            <View style={tw`p-4 border-t border-gray-100 bg-white`}>
                <TouchableOpacity 
                    // Desabilita o botão se já estiver finalizada ou estiver finalizando
                    disabled={isFinished || isFinalizing} 
                    style={tw`py-4 rounded-lg items-center ${isFinished ? 'bg-gray-400' : 'bg-green-600'} ${isFinalizing ? 'opacity-70' : ''}`}
                    onPress={handleFinalizarOcorrencia} // NOVO: Chama a função de finalização
                >
                    {isFinalizing ? (
                         <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={tw`text-white text-base font-bold`}>
                            {isFinished ? 'OCORRÊNCIA FINALIZADA' : 'FINALIZAR OCORRÊNCIA'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
            
            {/* Modal de Opções (Simulado) */}
            {isModalVisible && (
                <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-50`}>
                    <View style={tw`bg-white p-6 rounded-lg w-4/5`}>
                        <Text style={tw`text-lg font-bold mb-4`}>Opções da Ocorrência</Text>
                        <TouchableOpacity onPress={() => { setIsModalVisible(false); Alert.alert('Ação', 'Iniciar atendimento em rota...'); }}>
                            <Text style={tw`text-slate-800 py-2`}>Iniciar Atendimento em Rota</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsModalVisible(false); Alert.alert('Ação', 'Abrir modal de Anexos'); }}>
                            <Text style={tw`text-slate-800 py-2`}>Anexar Mídia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsModalVisible(false); Alert.alert('Ação', 'Abrir modal de Vítimas'); }}>
                            <Text style={tw`text-slate-800 py-2`}>Cadastrar Vítima</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={tw`mt-4`}>
                            <Text style={tw`text-red-600 py-2 font-bold`}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
            {/* NOVO: Componente Toast de Sucesso */}
            <SuccessToast
                isVisible={showSuccessToast}
                message="Ocorrência Finalizada com Sucesso!" //
                onClose={() => setShowSuccessToast(false)} 
            />

        </ScreenWrapper>
    );
};