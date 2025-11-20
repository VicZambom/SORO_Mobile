// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  // URL encontrada na sua documentação PDF
  baseURL: 'https://api-bombeiros-s-o-r-o.onrender.com', 
  timeout: 10000, // 10 segundos antes de desistir
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