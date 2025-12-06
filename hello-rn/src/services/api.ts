// src/services/api.ts
import axios from 'axios';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

console.log('🔗 API URL Configurada:', apiUrl);

if (!apiUrl) {
  console.warn('API_URL não definida no app.config.ts!');
}

const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000, 
});

// Interceptador para debug
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // O servidor respondeu com um status de erro (ex: 401, 404, 500)
      console.log(' Erro na API (Response):', error.response.status, error.response.data);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta 
      console.log(' Erro de Conexão (Sem resposta):', error.message);
    } else {
      console.log(' Erro Config:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;