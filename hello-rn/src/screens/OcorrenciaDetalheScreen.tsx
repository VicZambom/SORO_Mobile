// src/screens/Ocorrencias/OcorrenciaDetalheScreen.tsx
import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Clock, MapPin, AlertTriangle } from 'lucide-react-native';
import tw from 'twrnc';

// Componentes Requeridos
import { ScreenWrapper } from '../components/ScreenWrapper'; 
import { Header } from '../components/Header'; 
import { Card } from '../components/Card'; 
import { SuccessToast } from '../components/SuccessToast'; 
import { ActionModal } from '../components/ActionModal'; 
import { MediaGallery } from '../components/MediaGallery'; 
import { MediaViewerModal } from '../components/MediaViewerModal'; 
// NOVO IMPORT: Lista de Vítimas
import { VictimList } from '../components/VictimList'; 

import api from '../services/api'; 
import { RootStackParamList, AppNavigationProp } from '../types/navigation'; 

// --- 1. Tipagem e Dados Mockados ---

// Tipagem para os itens de mídia
interface MediaItem { 
    id: string;
    type: 'photo' | 'video' | 'add';
    url: string; 
}

// Tipagem e MOCK para Vítimas
interface Victim {
    id: string;
    name: string;
    age: number;
    gender: 'Masc.' | 'Fem.';
    status: 'GRAVE' | 'LEVE' | 'ÓBITO';
    destination: string;
}

const mockVictims: Victim[] = [
    { id: 'v1', name: 'José da Silva', age: 45, gender: 'Masc.', status: 'GRAVE', destination: 'Hosp. da Restauração' },
    { id: 'v2', name: 'Maria Oliveira', age: 32, gender: 'Fem.', status: 'LEVE', destination: 'Atendida e Liberada' },
];

// Tipagem para os dados da Ocorrência
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
    status: 'PENDENTE' | 'EM ANDAMENTO' | 'FINALIZADA'; 
    dataHoraOcorrencia: string;
    linhaTempo: { hora: string; evento: string; viatura?: string }[];
}

type OcorrenciaDetalheRouteProp = RouteProp<RootStackParamList, 'OcorrenciaDetalhe'>;

// --- DADOS DE MÍDIA MOCKADOS (5 ITENS) ---
const mockMediaData: MediaItem[] = [
    { id: '1', type: 'photo', url: 'https://placehold.co/100x100/503d3c/503d3c.png' }, 
    { id: '2', type: 'photo', url: 'https://placehold.co/100x100/503d3c/503d3c.png' }, 
    { id: '3', type: 'video', url: 'https://placehold.co/100x100/000000/000000.png' }, 
    { id: '4', type: 'photo', url: 'https://placehold.co/100x100/181a18/181a18.png' }, 
    { id: '5', type: 'photo', url: 'https://placehold.co/100x100/181a18/181a18.png' }, 
];


// --- 2. Componentes Auxiliares de UI (InfoBlock e TimelineItem) ---
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

// --- 3. TELA PRINCIPAL: OcorrenciaDetalheScreen ---

export const OcorrenciaDetalheScreen: React.FC = () => {
    const route = useRoute<OcorrenciaDetalheRouteProp>();
    const navigation = useNavigation<AppNavigationProp>();
    const { id } = route.params;

    const [ocorrencia, setOcorrencia] = useState<OcorrenciaDetalhe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'geral' | 'midia' | 'vitimas'>('vitimas'); // Iniciar na aba Vítimas para testar
    
    // ESTADOS DE CONTROLE DE MODAIS/AÇÕES
    const [isActionModalVisible, setIsActionModalVisible] = useState(false); 
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    
    // ESTADOS PARA O MediaViewerModal
    const [isViewerModalVisible, setIsViewerModalVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null); 
    
    // Dados Mockados de Detalhe (Atualizado para o número de vítimas correto: 2)
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
        vitimas: mockVictims.length, // 2 vítimas registradas
        midias: mockMediaData.length, // 5 itens na galeria
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

    const handleFinalizarOcorrencia = async () => {
        try {
            setIsFinalizing(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setShowSuccessToast(true);
            setOcorrencia(prev => prev ? { ...prev, status: 'FINALIZADA' } : null);
            
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível finalizar a ocorrência. Tente novamente.');
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleMediaPress = (item: MediaItem) => {
        if (item.type !== 'add') {
             setSelectedMedia(item); 
             setIsViewerModalVisible(true); 
        }
    };
    
    const handleDeleteMedia = () => {
        if (selectedMedia) {
             Alert.alert('Sucesso', `Mídia ${selectedMedia.id} excluída (Simulação).`);
             setIsViewerModalVisible(false);
             setSelectedMedia(null);
        }
    };
    
    const handleEditVictim = (victim: Victim) => {
        // Lógica de Edição para a vítima
        Alert.alert('Ação', `Abrir formulário para editar a vítima: ${victim.name}`);
    };
    
    const handleActionSelect = (action: 'tirarFoto' | 'gravarVideo' | 'coletarAssinatura' | 'registrarVitima') => {
        setIsActionModalVisible(false);
        Alert.alert('Ação Selecionada', `Ação: ${action}`);
    };

    const handleAddMedia = () => {
        setIsActionModalVisible(true);
    };

    useEffect(() => {
        fetchDetalhes();
    }, [id]);
    
    // --- RENDERIZAÇÃO DE CONTEÚDO DA ABA ---
    const renderContent = () => {
        if (!ocorrencia) return null; 
        
        switch (activeTab) {
            case 'geral':
                return (
                    <View>
                        <Card style={tw`mb-4 p-4`}>
                            <Text style={tw`text-base font-bold text-slate-800 mb-4`}>Informações</Text>
                            <View style={tw`flex-row flex-wrap`}>
                                <InfoBlock title="Natureza" value={ocorrencia.natureza} />
                                <InfoBlock title="Subgrupo" value={ocorrencia.subgrupo} />
                                <InfoBlock title="Formo" value={ocorrencia.formoAviso} />
                                <InfoBlock title="Nº do Aviso" value={ocorrencia.numeroAviso} />
                            </View>
                        </Card>
                        <Card style={tw`mb-4 p-4`}>
                            <Text style={tw`text-base font-bold text-slate-800 mb-4`}>Linha do Tempo</Text>
                            {ocorrencia.linhaTempo.slice().reverse().map((item, index) => (
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
                    <MediaGallery
                        data={mockMediaData as MediaItem[]}
                        onAddPress={handleAddMedia}
                        onMediaPress={handleMediaPress}
                        midiaCount={ocorrencia.midias} 
                    />
                );
            case 'vitimas':
                return (
                    // NOVO: Renderiza a lista de vítimas
                    <VictimList
                        data={mockVictims} 
                        onEditVictim={handleEditVictim} 
                        totalVictims={ocorrencia.vitimas} 
                    />
                );
            default:
                return null;
        }
    };

    // --- UI Principal ---
    
    if (loading) { return (<ScreenWrapper><Header title="Detalhes" showBack={true} /><View style={tw`flex-1 justify-center items-center`}><ActivityIndicator size="large" color="#2563eb" /></View></ScreenWrapper>);}
    if (error || !ocorrencia) { return (<ScreenWrapper><Header title="Detalhes" showBack={true} /><View style={tw`flex-1 justify-center items-center px-4`}><AlertTriangle color="#ef4444" size={32} /><Text style={tw`text-lg font-semibold text-red-500 mt-4 text-center`}>{error || 'Ocorrência não encontrada.'}</Text></View></ScreenWrapper>);}
    
    const isFinished = ocorrencia.status === 'FINALIZADA';
    
    return (
        <ScreenWrapper>
            <Header title="" showBack={true} /> 
            
            <ScrollView style={tw`flex-1 -mt-6`}>
                
                {/* 1. TOP BOX COM ENDEREÇO E STATUS (Header Customizado) */}
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

                {/* 2. NAVEGAÇÃO DE ABAS (TABS) */}
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
                
                {/* 3. CONTEÚDO DA ABA */}
                <View style={tw`mt-4 px-1`}>
                    {renderContent()}
                </View>
                
            </ScrollView>
            
            {/* FAB para Ações (Opções) */}
            <TouchableOpacity 
                style={tw`absolute bottom-20 right-6 bg-slate-900 w-14 h-14 rounded-full items-center justify-center shadow-lg z-40`}
                onPress={() => setIsActionModalVisible(true)} 
                disabled={isFinished || isFinalizing}
            >
                <View style={tw`w-1 h-1 bg-white rounded-full my-0.5`} />
                <View style={tw`w-1 h-1 bg-white rounded-full my-0.5`} />
                <View style={tw`w-1 h-1 bg-white rounded-full my-0.5`} />
            </TouchableOpacity>

            {/* Rodapé - Botão Fixo "Finalizar Ocorrência" */}
            <View style={tw`p-4 border-t border-gray-100 bg-white`}>
                <TouchableOpacity 
                    disabled={isFinished || isFinalizing} 
                    style={tw`py-4 rounded-lg items-center ${isFinished ? 'bg-gray-400' : 'bg-green-600'} ${isFinalizing ? 'opacity-70' : ''}`}
                    onPress={handleFinalizarOcorrencia} 
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
            
            {/* MODAIS (Renderizados no final para ficarem sobre a tela) */}
            
            {/* Modal de Ações (FAB) */}
            <ActionModal
                isVisible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                onActionSelect={handleActionSelect}
            />

            {/* Componente Toast de Sucesso (Finalizar Ocorrência) */}
            <SuccessToast
                isVisible={showSuccessToast}
                message="Ocorrência Finalizada com Sucesso!" 
                onClose={() => setShowSuccessToast(false)} 
            />

            {/* Modal de Visualização de Mídia (Clicar na miniatura) */}
            {selectedMedia && (
                <MediaViewerModal
                    isVisible={isViewerModalVisible}
                    mediaUrl={selectedMedia.url}
                    mediaType={selectedMedia.type as 'photo' | 'video'} 
                    onClose={() => setIsViewerModalVisible(false)}
                    onDelete={handleDeleteMedia} 
                />
            )}

        </ScreenWrapper>
    );
};
