import axios from 'axios';

// Configuración de emergencia ultra simple para debug en Amplify
const axiosInstance = axios.create({
  baseURL: 'https://back-pasarela.onrender.com',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json'
  },
  // Configuración explícita para CORS
  withCredentials: false
});

// Log simple para debug
console.log('🚨 EMERGENCY CONFIG LOADED');

export default axiosInstance; 