// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Customer types
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Credit Card types
export interface CreditCardInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType?: 'visa' | 'mastercard' | null;
}

// Delivery types - REQUERIDO POR LA PRUEBA
export interface DeliveryInfo {
  address: string;
  city: string;
  department: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
}

// Fees types - REQUERIDO POR LA PRUEBA
export interface FeesInfo {
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
}

// Transaction types
export interface TransactionInfo {
  transactionId?: string;
  status?: 'pending' | 'success' | 'failed';
  message?: string;
  productNewStock?: number;
  wompiTransactionId?: string;
  reference?: string;
  amount?: number;
}

// Payment State type
export interface PaymentState {
  // Step navigation
  currentStep: 1 | 2 | 3 | 4 | 5; // 1: Product, 2: Payment Info, 3: Summary, 4: Processing, 5: Result
  
  // Data
  product: Product | null;
  customer: CustomerInfo;
  creditCard: CreditCardInfo;
  delivery: DeliveryInfo;
  fees: FeesInfo;
  transaction: TransactionInfo;
  
  // UI State
  loading: boolean;
  error: string | null;
  cartItems: CartItem[];
  cartTotal: number;
}

// Step types for better navigation control
export type PaymentStep = 
  | 'product'      // 1. Product page
  | 'payment-info' // 2. Credit Card/Delivery info
  | 'summary'      // 3. Summary
  | 'processing'   // 4. Payment processing
  | 'result';      // 5. Final status 