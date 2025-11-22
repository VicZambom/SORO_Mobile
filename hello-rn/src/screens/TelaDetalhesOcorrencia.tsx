import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Definição de Tipos e Parâmetros ---
type DetalhesRouteParams = {
  id: string; 
  titulo: string;
  subtitulo: string;
  descricao: string;
};
type DetalhesRouteProp = RouteProp<Record<string, DetalhesRouteParams>, 'DetalhesOcorrencia'>;

// Componente Chave de Detalhe (para Natureza, Prioridade, etc.)
const ItemInformacao: React.FC<{ rotulo: string; valor: string }> = ({ rotulo, valor }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{rotulo}</Text>
    <Text style={styles.infoValue}>{valor}</Text>
  </View>
);

// --- Componente Principal da Tela ---
const TelaDetalhesOcorrencia: React.FC = () => {
  const route = useRoute<DetalhesRouteProp>();
  const navigation = useNavigation();
  const { id, titulo, subtitulo, descricao } = route.params || {};
  const insets = useSafeAreaInsets();

  // Dados Mockados
  const dadosMock = {
    id: id || '#AV-2023-092',
    titulo: titulo || 'Resgate de Animal',
    subtitulo: subtitulo || 'Gato preso em árvore (Risco de Queda)',
    descricao: descricao || 'Solicitante informa que o animal está a 10m de altura, próximo à fiação elétrica.',
    
    natureza: 'Resgate',
    prioridade: 'Média',
    horario: '15:20',
    forma: 'Telefone',
    endereco: {
      rua: 'Rua Sá e Souza, 1200',
      cidade: 'Setúbal, Recife - PE',
      referencia: 'Ref: Próximo ao Parque Dona Lindu',
    }
  };

  const handleIniciarDeslocamento = () => {
    console.log('Iniciando Deslocamento...');
  };

  const handleNavegarMapa = () => {
    console.log('Abrindo mapa para navegação...');
  };

  return (
    <View style={styles.screenView}> 
      
      {/* 🔝 CONTAINER PRINCIPAL DO TOPO (Fundo Rosa Claro) */}
      <View style={[styles.topBarContainer, { paddingTop: insets.top }]}>
        
        {/* 1. Header Bar: Botão de voltar e ID da Ocorrência */}
        <View style={styles.headerBar}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton} 
          >
            <Text style={[styles.iconPlaceholder, { fontSize: 26 }]}>←</Text> 
          </TouchableOpacity>
          <Text style={styles.headerId}>{dadosMock.id}</Text> 
          <View style={{ width: 24 }} /> 
        </View>

        {/* 2. Status Bar: Pílula Vermelha */}
        <View style={styles.statusBar}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              <Text style={styles.dot}>●</Text> PENDENTE • AGUARDANDO EQUIPE
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {/* --- Card de Detalhes da Ocorrência --- */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>{dadosMock.titulo}</Text>
          <Text style={styles.detailsSubtitle}>{dadosMock.subtitulo}</Text>
          <Text style={styles.detailsDescription}>{dadosMock.descricao}</Text>

          {/* Grid de Informações Chave */}
          <View style={styles.infoGrid}>
            <ItemInformacao rotulo="Natureza" valor={dadosMock.natureza} />
            <ItemInformacao rotulo="Prioridade" valor={dadosMock.prioridade} />
            <ItemInformacao rotulo="Horário" valor={dadosMock.horario} />
            <ItemInformacao rotulo="Forma" valor={dadosMock.forma} />
          </View>
        </View>

        {/* --- Card de Localização --- */}
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              {/* Círculo rosa de fundo para o pin VERMELHO */}
              <View style={styles.locationIconBackground}> 
                <Text style={[styles.iconPlaceholder, { color: '#ef4444', fontSize: 22 }]}>📍</Text> 
              </View>
              <View style={{ flex: 1, marginLeft: 0 }}>
                <Text style={styles.locationStreet}>{dadosMock.endereco.rua}</Text>
                <Text style={styles.locationCity}>{dadosMock.endereco.cidade}</Text>
                <Text style={styles.locationRef}>{dadosMock.endereco.referencia}</Text>
              </View>
            </View>
          
            <TouchableOpacity style={styles.mapButton} onPress={handleNavegarMapa} activeOpacity={0.8}>
              {/* Pin AZUL para o botão (Corrigido para o padrão do protótipo) */}
              <Text style={[styles.iconPlaceholder, { color: styles.mapButtonTextFinal.color, fontSize: 20, marginRight: 8 }]}>📍</Text>
              <Text style={styles.mapButtonTextFinal}>Ir para o mapa</Text>
            </TouchableOpacity>
        </View>
        
        {/* Espaço extra para o botão do rodapé */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- Rodapé Fixo (Botão Iniciar Deslocamento) --- */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleIniciarDeslocamento} activeOpacity={0.9}>
            <Text style={[styles.iconPlaceholder, { color: '#fff', fontSize: 20, marginRight: 12 }]}>➤</Text>
            <Text style={styles.actionButtonText}>INICIAR DESLOCAMENTO</Text>
          </TouchableOpacity>
        </View>
        
      {/* SafeAreaView para a área inferior (notch) */}
      <SafeAreaView style={{ backgroundColor: '#061C43' }} edges={['bottom']} />
    </View>
  );
};

// --- Estilos (Styles) ---
const styles = StyleSheet.create({
  screenView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  
  // 1. AJUSTES DO TOPO (HEADER/STATUS)
  topBarContainer: {
    backgroundColor: '#FECACA',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  headerBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 2,
  },
  headerId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  backButton: { 
    position: 'absolute',
    left: 15,
    top: 10,
    padding: 5,
    zIndex: 10,
  },
  
  statusBar: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    width: '100%',
    marginTop: 0, 
    backgroundColor: 'transparent',
  },
  
  statusPill: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: '90%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  statusPillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  
  iconPlaceholder: {
      fontSize: 24, 
      lineHeight: 24,
      textAlignVertical: 'center',
  },
  dot: {
      fontSize: 10,
      marginRight: 4,
  },
  
  // 2. AJUSTES DO CORPO (CARDS)
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -10,
  },
  
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 22,
    marginTop: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  
  // 3. AJUSTES DO LOCATION CARD
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  locationIconBackground: {
      backgroundColor: '#fee2e2',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  locationStreet: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  locationCity: {
    fontSize: 14,
    color: '#666',
  },
  locationRef: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  mapButton: {
    backgroundColor: '#f0f9ff',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: '#bfdbfe',
    flexDirection: 'row',
    justifyContent: 'center', // Centralizado
    alignItems: 'center',
  },
  mapButtonTextFinal: {
    color: '#3b82f6', 
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 5,
  },
  
  // 4. AJUSTES DO RODAPÉ (FOOTER)
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingVertical: 18,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#061C43',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default TelaDetalhesOcorrencia;