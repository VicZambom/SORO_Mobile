import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

// Aceita qualquer props do Navigation para compatibilidade com React Navigation
const DetalhesOcorrenciaScreen: React.FC<any> = ({ route }) => {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const { id, titulo } = (route && route.params) || { id: 'N/A', titulo: 'Sem título' };

  useEffect(() => {
    try {
      console.log('[DetalhesOcorrencia] route.params =', route && route.params);
      // Simula preparação de dados (ex: fetch por ID) — aqui só marcamos como pronto
      setReady(true);
    } catch (err: any) {
      console.error('[DetalhesOcorrencia] erro ao inicializar:', err);
      setError(err?.message || String(err));
    }
  }, [route]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red' }}>Erro ao carregar detalhes: {error}</Text>
      </SafeAreaView>
    );
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Carregando detalhes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.idText}>{id}</Text>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.placeholder}>Aqui você pode renderizar os detalhes completos da ocorrência.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  card: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 10 },
  idText: { fontSize: 12, color: '#666', marginBottom: 6 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  placeholder: { color: '#444' },
});

export default DetalhesOcorrenciaScreen;
