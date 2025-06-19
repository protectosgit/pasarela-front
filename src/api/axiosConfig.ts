import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Debug: Log de configuración
const API_URL = import.meta.env.VITE_API_URL || 'https://back-pasarela.onrender.com';
console.log('🔧 Axios Config Debug:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  finalApiUrl: API_URL,
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD
});

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentar timeout para Amplify
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Debug: Log de cada petición
    console.log('📡 Axios Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      headers: config.headers
    });
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Axios Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug: Log de respuestas exitosas
    console.log('✅ Axios Response:', {
      status: response.status,
      url: response.config.url,
      corsHeaders: {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods']
      }
    });
    return response;
  },
  async (error: AxiosError) => {
    // Debug: Log detallado de errores
    console.error('❌ Axios Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.response?.headers,
      corsError: error.message.includes('CORS') || error.message.includes('Access'),
      networkError: !error.response
    });

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Retry logic para 429 y errores de red
    if ((error.response?.status === 429 || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      const delay = error.response?.status === 429 ? 2000 : 1000;
      console.log(`🔄 Retrying request in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 