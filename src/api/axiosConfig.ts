import axios from 'axios';
import { ResilienceMiddleware } from './resilience';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Cabeceras de seguridad recomendadas por OWASP
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://checkout.wompi.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://checkout.wompi.co",
  },
});

// Configurar middleware de resiliencia
new ResilienceMiddleware(api);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Error de respuesta del servidor
      console.error('API Error:', error.response.data);
      
      // Manejar errores específicos
      switch (error.response.status) {
        case 401:
          // Manejar error de autenticación
          break;
        case 403:
          // Manejar error de autorización
          break;
        case 429:
          // Manejar rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          return api(error.config);
      }
    } else if (error.request) {
      // Error de red
      console.error('Network Error:', error.request);
    } else {
      // Otros errores
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor para asegurar HTTPS en producción
api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'production' && !config.url?.startsWith('https')) {
    config.url = `https://${config.url?.replace('http://', '')}`;
  }
  return config;
});

export default api; 