import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuración más robusta para evitar errores de tipos
const getApiUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'https://back-pasarela.onrender.com';
  }
  return 'https://back-pasarela.onrender.com';
};

const API_URL = getApiUrl();

// Debug: Log de configuración (solo en desarrollo)
if (typeof window !== 'undefined') {
  console.log('🔧 Axios Config Debug:', {
    API_URL,
    env: typeof import.meta !== 'undefined' ? 'Vite' : 'Other'
  });
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Debug: Log de cada petición (solo en desarrollo)
    if (typeof window !== 'undefined' && window.console) {
      console.log('📡 Axios Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`
      });
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Axios Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug: Log de respuestas exitosas (solo en desarrollo)
    if (typeof window !== 'undefined' && window.console) {
      console.log('✅ Axios Response:', {
        status: response.status,
        url: response.config.url
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    // Debug: Log detallado de errores
    if (typeof window !== 'undefined' && window.console) {
      console.error('❌ Axios Response Error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Retry logic para 429 y errores de red
    if ((error.response?.status === 429 || !error.response) && !originalRequest._retry) {
      originalRequest._retry = true;
      const delay = error.response?.status === 429 ? 2000 : 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 