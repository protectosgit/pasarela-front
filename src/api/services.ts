import api from './axiosConfig';
import type { Product, CustomerInfo, DeliveryInfo } from '../types';

export const productService = {
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

export const paymentService = {
  processPayment: async (data: {
    productId: string;
    cardToken: string;
    customerInfo: CustomerInfo;
    deliveryInfo: DeliveryInfo;
  }) => {
    const response = await api.post('/payments/process', data);
    return response.data;
  },
}; 