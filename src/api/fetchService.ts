// Servicio alternativo usando fetch nativo para bypasear axios
const API_BASE_URL = 'https://back-pasarela.onrender.com';

export const fetchService = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};

export const productServiceFetch = {
  async getAllProducts() {
    const response = await fetchService.get('/api/products');
    
    if (!response.success) {
      throw new Error(response.message || 'Error al obtener los productos');
    }
    
    return response.data;
  }
}; 