// src/services/api.ts
import axios from 'axios';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

if (!apiUrl) {
  console.warn('API_URL não definida no app.config.ts!');
}

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// Interceptador para debug (opcional, mas ajuda muito a ver erros)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Erro na API:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (error.request) {
      console.log('Erro de conexão: Sem resposta do servidor');
    } else {
      console.log('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;