// src/components/VictimList.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import tw from 'twrnc';
import { Edit } from 'lucide-react-native';

// --- Tipagem e Mock de Dados (Para este componente) ---
interface Victim {
    id: string;
    name: string;
    age: number;
    gender: 'Masc.' | 'Fem.';
    status: 'GRAVE' | 'LEVE' | 'ÓBITO';
    destination: string;
}

interface VictimListProps {
    data: Victim[]; // Dados da lista
    onEditVictim: (victim: Victim) => void;
    totalVictims: number; // Conta mostrada no título
}

// --- Componente de Card Individual da Vítima ---
const VictimCard: React.FC<{ victim: Victim, onEdit: (victim: Victim) => void }> = ({ victim, onEdit }) => {
    
    // Define cores com base no status (GRAVE = Vermelho, LEVE = Verde)
    const isGrave = victim.status === 'GRAVE';
    const statusBgColor = isGrave ? 'bg-red-500' : 'bg-green-500';
    const statusTextColor = 'text-white';
    const borderColor = isGrave ? 'border-red-500' : 'border-green-500';

    return (
        <View 
            // Estilo do Card: Borda lateral colorida (vermelho para Grave, verde para Leve)
            style={tw`bg-white p-4 rounded-xl shadow-sm border border-l-4 ${borderColor} mb-4`}
        >
            
            {/* Linha 1: Nome e Botão Editar */}
            <View style={tw`flex-row justify-between items-start mb-2`}>
                <Text style={tw`text-lg font-bold text-slate-900`}>{victim.name}</Text>
                
                {/* Ícone de Edição (Lápis) */}
                <TouchableOpacity 
                    onPress={() => onEdit(victim)}
                    style={tw`p-1`}
                >
                    <Edit size={18} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Linha 2: Idade, Gênero e Status */}
            <View style={tw`flex-row items-center mb-3`}>
                <Text style={tw`text-sm text-slate-600`}>
                    {victim.age} anos • {victim.gender}
                </Text>
                
                {/* Tag de Status */}
                <View style={tw`ml-2 px-2 py-0.5 rounded-lg ${statusBgColor}`}>
                    <Text style={tw`text-xs font-semibold ${statusTextColor} uppercase`}>{victim.status}</Text>
                </View>
            </View>

            {/* Linha 3: Destino */}
            <View>
                <Text style={tw`text-xs font-semibold text-slate-500 uppercase mb-0.5`}>Destino</Text>
                <Text style={tw`text-base text-slate-800`}>{victim.destination}</Text>
            </View>
        </View>
    );
};

// --- Lista Principal ---
export const VictimList: React.FC<VictimListProps> = ({ data, onEditVictim, totalVictims }) => {
    
    return (
        <View style={tw`flex-1`}>
            {/* Título: Vítimas Registradas (2) */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-base font-bold text-slate-800`}>
                    Vítimas Registradas ({totalVictims})
                </Text>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <VictimCard victim={item} onEdit={onEditVictim} />
                )}
                ListEmptyComponent={
                    <Text style={tw`text-center text-slate-500 mt-10`}>Nenhuma vítima registrada nesta ocorrência.</Text>
                }
                contentContainerStyle={tw`pb-20`}
            />
        </View>
    );
};
