import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// --- Definição de Tipos ---
interface Occurrence {
  id: string;
  title: string;
  location: string;
  status: 'Em Andamento' | 'Aguardando';
  time?: string; // Ocorrência Em Andamento tem um tempo
}

// --- Dados Mock (Simulados) ---
const currentOccurrence: Occurrence = {
  id: '#AV-2048',
  title: 'Incêndio em Residência',
  location: 'Boa Viagem • Rua dos Navegantes, 450',
  status: 'Em Andamento',
  time: '14:35',
};

const pendingOccurrences: Occurrence[] = [
  {
    id: '#AV-2047',
    title: 'Resgate de Animal',
    location: 'Setúbal',
    status: 'Aguardando',
  },
  {
    id: '#AV-2046',
    title: 'Vazamento de Gás',
    location: 'Pina',
    status: 'Aguardando',
  },
  {
    id: '#AV-2045',
    title: 'Acidente de Trânsito',
    location: 'Boa Viagem',
    status: 'Aguardando',
  },
  {
    id: '#AV-2044',
    title: 'Queda de Árvore',
    location: 'Recife Antigo',
    status: 'Aguardando',
  },
];

// --- Componente de Item da Fila (clicável) ---
const PendingItem: React.FC<{ item: Occurrence; onPress: (item: Occurrence) => void }> = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.pendingCardContainer}>
    <View style={styles.pendingCardLeftBar} />
    <View style={styles.pendingCardContent}>
      <Text style={styles.pendingCardId}>{item.id}</Text>
      <Text style={styles.pendingCardTitle}>{item.title}</Text>
      <Text style={styles.pendingCardLocation}>{item.location}</Text>
      <View style={styles.statusPill}>
        <Text style={styles.statusPillText}>AGUARDANDO</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// --- Componente Principal da Tela ---
const MyOccurrencesScreen: React.FC = () => {
  // Hook de navegação
  const navigation = useNavigation<NavigationProp<any>>();

  const handleDetailsPress = () => {
    console.log('Navegar para detalhes da ocorrência atual...');
  };

  const handleAddPress = () => {
    console.log('Abrir tela para adicionar nova ocorrência...');
  };

  const handlePendingItemPress = (item: Occurrence) => {
    navigation.navigate('DetalhesOcorrencia', { id: item.id, titulo: item.title });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* --- Header da Tela --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Minhas Ocorrências</Text>
          <TouchableOpacity style={styles.profileIcon} accessibilityLabel="Perfil" accessibilityRole="button">
            <Text style={styles.iconMedium}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* --- Em Andamento (Atual) --- */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>EM ANDAMENTO (ATUAL)</Text>
        </View>
        <View style={styles.currentCard}>
          <View style={styles.currentCardHeader}>
            <Text style={styles.currentCardId}>{currentOccurrence.id}</Text>
            {currentOccurrence.time && (
              <View style={styles.timeContainer}>
                <Text style={styles.iconSmall}>⏰</Text>
                <Text style={styles.currentCardTime}>{currentOccurrence.time}</Text>
              </View>
            )}
          </View>
          <Text style={styles.currentCardTitle}>{currentOccurrence.title}</Text>
          <Text style={styles.currentCardLocation}>{currentOccurrence.location}</Text>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleDetailsPress}
          >
            <Text style={styles.detailsButtonText}>VER DETALHES / ATUALIZAR</Text>
          </TouchableOpacity>
        </View>

        {/* --- Fila de Espera (Pendentes) --- */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>FILA DE ESPERA (PENDENTES)</Text>
        </View>
        <View style={styles.pendingList}>
          {pendingOccurrences.map((item) => (
            <PendingItem key={item.id} item={item} onPress={handlePendingItemPress} />
          ))}
        </View>
      </ScrollView>

      {/* --- Botão Flutuante (Add) --- */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddPress} accessibilityLabel="Adicionar ocorrência" accessibilityRole="button">
        <Text style={styles.iconAdd}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Estilos (Styles) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Cor de fundo da tela
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#eee', // Simula o círculo cinza
  },
  
  // Estilos Comuns de Títulos de Seção
  sectionTitleContainer: {
    marginBottom: 10,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },

  // --- Estilos do Cartão "Em Andamento" ---
  currentCard: {
    backgroundColor: '#ffedd5', // Cor de fundo laranja claro
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  currentCardId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCardTime: {
    marginLeft: 4,
    fontSize: 14,
    color: '#000',
  },
  currentCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  currentCardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  detailsButton: {
    backgroundColor: '#f97316', // Laranja forte
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // --- Estilos da Lista Pendente ---
  pendingList: {
    marginBottom: 100, // Espaço para o botão flutuante
  },
  pendingCardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingCardLeftBar: {
    width: 6,
    backgroundColor: '#dc2626', // Barra vermelha
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  pendingCardContent: {
    padding: 15,
    flex: 1,
  },
  pendingCardId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  pendingCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  pendingCardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusPill: {
    alignSelf: 'flex-start', // Para a "pílula" não ocupar a largura total
    backgroundColor: '#fee2e2', // Vermelho bem claro
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
  },
  statusPillText: {
    color: '#dc2626', // Vermelho
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // --- Botão Flutuante ---
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6', // Cor azul
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconSmall: {
    fontSize: 14,
    color: '#000',
  },
  iconMedium: {
    fontSize: 24,
    color: '#000',
  },
  iconAdd: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 30,
    textAlign: 'center',
  },
});

export default MyOccurrencesScreen;