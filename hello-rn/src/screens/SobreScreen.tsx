import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from '@expo/vector-icons'; // Assumindo o uso de @expo/vector-icons

// --- Componente principal da Tela ---
const PerfilEConfiguracoesScreen = () => {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [temaEscuroAtivo, setTemaEscuroAtivo] = useState(false);

  // Dados fictícios baseados na imagem
  const usuario = {
    nome: 'CB Operador Silva',
    local: 'Cabo',
    matricula: '200003-C',
    email: 'op.silva.qcg@bombeiros.pe.gov.br',
  };

  const statusSincronizacao = {
    pendente: true,
    ocorrencias: 3,
  };

  const handleSincronizar = () => {
    // Lógica para forçar a sincronização
    console.log('Sincronização forçada!');
  };

  const handleSairDaConta = () => {
    // Lógica para deslogar
    console.log('Saindo da conta...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER (Barra superior) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => console.log('Voltar')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil e Configurações</Text>
      </View>
      <View style={styles.content}>
        {/* SEÇÃO 1: PERFIL */}
        <View style={styles.card}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>CO</Text>
            </View>
            <View>
              <Text style={styles.name}>{usuario.nome}</Text>
              <Text style={styles.location}>{usuario.local}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={20} color="#777" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Matrícula</Text>
              <Text style={styles.detailValue}>{usuario.matricula}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="email-outline" size={20} color="#777" />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{usuario.email}</Text>
            </View>
          </View>
        </View>

        {/* SEÇÃO 2: STATUS DO SISTEMA */}
        <Text style={styles.sectionTitle}>STATUS DO SISTEMA</Text>
        <View style={[styles.card, styles.syncCard]}>
          <View style={styles.syncStatus}>
            <Feather
              name="cloud-off"
              size={30}
              color="#007BFF" // Azul claro similar ao do protótipo
              style={styles.syncIcon}
            />
            <View>
              <Text style={styles.syncTitle}>Sincronização Pendente</Text>
              <Text style={styles.syncDetails}>
                {statusSincronizacao.ocorrencias} Ocorrências aguardando envio.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSincronizar}
          >
            <Text style={styles.syncButtonText}>FORÇAR SINCRONIZAÇÃO</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO 3: PREFERÊNCIAS */}
        <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
        <View style={styles.card}>
          {/* Item 1: Notificações */}
          <View style={styles.preferenceItem}>
            <View style={styles.prefLeft}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
              <Text style={styles.preferenceLabel}>Notificações</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }} // Cores padrão ou customizadas
              thumbColor={notificacoesAtivas ? '#007BFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setNotificacoesAtivas}
              value={notificacoesAtivas}
            />
          </View>
          {/* Item 2: Tema Escuro */}
          <View style={styles.preferenceItem}>
            <View style={styles.prefLeft}>
              <Ionicons name="moon-outline" size={24} color="#000" />
              <Text style={styles.preferenceLabel}>Tema Escuro</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={temaEscuroAtivo ? '#007BFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setTemaEscuroAtivo}
              value={temaEscuroAtivo}
            />
          </View>
          {/* Item 3: Sobre o S.O.R.O. */}
          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => console.log('Abrir Sobre o S.O.R.O.')}
          >
            <View style={styles.prefLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#000" />
              <Text style={styles.preferenceLabel}>Sobre o S.O.R.O.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Informação do Sistema */}
        <View style={styles.sistemInfoContainer}>
          <Text style={styles.sistemInfoText}>
            S.O.R.O. - Sistema Operacional para Registros de Ocorrências
          </Text>
        </View>

        {/* Botão Sair da Conta */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSairDaConta}
        >
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Cor de fundo da tela
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  content: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 30, // Espaço extra para o botão de logoff no final
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Estilos da Seção Perfil
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007BFF', // Cor de fundo do avatar (Azul)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  location: {
    fontSize: 14,
    color: '#777',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailTextContainer: {
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#777',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
  },

  // Estilos da Seção Status do Sistema
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#777',
    marginBottom: 10,
    marginTop: 5,
  },
  syncCard: {
    padding: 0, // Remover padding do card para o conteúdo ficar mais ajustado
    overflow: 'hidden',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  syncIcon: {
    marginRight: 15,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  syncDetails: {
    fontSize: 14,
    color: '#777',
  },
  syncButton: {
    backgroundColor: '#007BFF', // Cor do botão principal (Azul)
    paddingVertical: 15,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Estilos da Seção Preferências
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    // Estilo para simular o separador (exceto o último)
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    marginLeft: 15,
    color: '#000',
  },
  // Remover borderBottom para o último item
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  // Ajuste para simular o separador (precisa ser aplicado condicionalmente na prática)
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  // Estilo específico para o último item sem borda de separação
  lastPreferenceItem: {
    borderBottomWidth: 0,
  },

  // Estilos da Informação do Sistema
  sistemInfoContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sistemInfoText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },

  // Estilos do Botão Sair da Conta
  logoutButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF4500', // Uma cor de destaque para 'sair' (Laranja/Vermelho)
    fontWeight: 'bold',
  },
});

export default PerfilEConfiguracoesScreen;