// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

// Customer types
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Delivery types
export interface DeliveryInfo {
  address: string;
  city: string;
  department: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
}

// Transaction types
export interface TransactionInfo {
  transactionId?: string;
  status?: 'pending' | 'success' | 'failed';
  message?: string;
  productNewStock?: number;
  wompiTransactionId?: string;
}

// Payment State type
export interface PaymentState {
  product: Product | null;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  transaction: TransactionInfo;
  loading: boolean;
  error: string | null;
} 