import axios from 'axios';

// Cria uma instância do axios com configurações padrão
const customFetch = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar o header de contagem total quando necessário
customFetch.interceptors.response.use(
  (response) => {
    // Não modificamos os dados retornados pelo servidor
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default customFetch; 