// Servicio alternativo usando fetch nativo para bypasear axios
const API_BASE_URL = 'https://back-pasarela.onrender.com';

export const fetchService = {
  async get(endpoint: string) {
    console.log(`🌐 Fetch GET: ${API_BASE_URL}${endpoint}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      console.log(`✅ Fetch Response: ${response.status}`, {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      console.error('❌ Fetch Error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
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