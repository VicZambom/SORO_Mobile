// src/components/MediaGallery.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Dimensions, Alert } from 'react-native';
import tw from 'twrnc';
import { Camera, Play } from 'lucide-react-native';

// --- Tipagem e Dados Mockados ---
interface MediaItem {
    id: string;
    type: 'photo' | 'video' | 'add';
    url: string; // URL da miniatura/imagem
}

interface MediaGalleryProps {
    data: MediaItem[]; 
    onAddPress: () => void; 
    onMediaPress: (item: MediaItem) => void; 
    midiaCount: number; 
}

const numColumns = 3;
const margin = 8; // Margem base

// --- Componente de Miniatura da Mídia ---
const MediaThumbnail: React.FC<{ item: MediaItem, onMediaPress: (item: MediaItem) => void }> = ({ item, onMediaPress }) => {
    
    // Estilo que simula a proporção de 1/3 da largura com margem
    const itemStyle = tw`w-1/3 aspect-square mb-2 pr-2`;
    
    // Se for o botão ADICIONAR
    if (item.type === 'add') {
        return (
            <View style={itemStyle}>
                <TouchableOpacity 
                    style={tw`flex-1 items-center justify-center border-2 border-dashed border-slate-300 rounded-lg`}
                    onPress={() => onMediaPress(item)}
                >
                    <Camera size={24} color="#334155" />
                    <Text style={tw`text-sm font-medium text-slate-700 mt-1`}>Adicionar</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    // Se for uma foto ou vídeo existente
    return (
        <View style={itemStyle}>
            <TouchableOpacity onPress={() => onMediaPress(item)} style={tw`flex-1 relative`}>
                <Image 
                    source={{ uri: item.url }} 
                    style={tw`w-full h-full rounded-lg`}
                    resizeMode="cover"
                />
                
                {/* Overlay e Ícone de Play para Vídeos */}
                {item.type === 'video' && (
                    <View style={tw`absolute inset-0 bg-black bg-opacity-30 rounded-lg items-center justify-center`}>
                        <Play size={32} color="white" />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

// --- Galeria Principal ---
export const MediaGallery: React.FC<MediaGalleryProps> = ({ data, onAddPress, onMediaPress, midiaCount }) => {

    // Adiciona o item "Adicionar" na primeira posição para o layout
    const listData: MediaItem[] = [
        { id: 'add', type: 'add' as const, url: '' }, 
        ...data.filter(item => item.id !== 'add')
    ];
    
    return (
        <View style={tw`flex-1`}>
            {/* Título e Botão Selecionar */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-base font-bold text-slate-800`}>
                    Evidências ({midiaCount} itens)
                </Text>
                <TouchableOpacity onPress={() => Alert.alert('Ação', 'Abrir seleção de mídias.')}>
                    <Text style={tw`text-blue-700 font-semibold text-base`}>Selecionar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={listData}
                keyExtractor={(item) => item.id}
                numColumns={numColumns} 
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} 
                renderItem={({ item }) => (
                     <MediaThumbnail 
                        item={item} 
                        onMediaPress={item.type === 'add' ? onAddPress : onMediaPress}
                    />
                )}
                // Estilo que garante que os itens fiquem alinhados em 3 colunas
                columnWrapperStyle={tw`justify-start`} 
            />
        </View>
    );
};
