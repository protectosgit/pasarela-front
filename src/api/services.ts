import api from './axiosConfig';
import type { Product, CustomerInfo, DeliveryInfo } from '../types';

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const productService = {
  // Obtener todos los productos
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<ApiResponse<Product[]>>('/products');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener los productos');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  },

  // Obtener un producto específico por ID
  getProduct: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener el producto');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  },

  // Obtener productos por página (paginación)
  getProductsByPage: async (page: number = 1, limit: number = 10): Promise<{
    products: Product[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<{
        products: Product[];
        total: number;
        currentPage: number;
        totalPages: number;
      }>>(`/products?page=${page}&limit=${limit}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener los productos paginados');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos paginados');
    }
  },
};

// DESHABILITADO - Este servicio usa la API de transacciones que requiere firma en JSON
// Usar WompiService en su lugar que usa formulario directo
export const paymentService = {
  processPayment: async (data: {
    productId: string;
    cardToken: string;
    customerInfo: CustomerInfo;
    deliveryInfo: DeliveryInfo;
  }) => {
    // DESHABILITADO: Este método usa la API de transacciones problemática
    throw new Error('❌ PaymentService deshabilitado. Usar WompiService.processPayment() en su lugar');
    
    /*
    try {
      const response = await api.post<ApiResponse<any>>('/api/payments/process', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al procesar el pago');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al procesar pago');
    }
    */
  },
}; 