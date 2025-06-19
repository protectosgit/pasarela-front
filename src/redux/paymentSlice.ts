import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { 
  Product, 
  CustomerInfo, 
  CreditCardInfo,
  DeliveryInfo, 
  FeesInfo,
  TransactionInfo, 
  CartItem,
  PaymentState 
} from '../types';

const calculateFees = (cartTotal: number): FeesInfo => {
  const baseFee = 2500;
  const deliveryFee = cartTotal >= 50000 ? 0 : 5000;
  
  return {
    productAmount: cartTotal,
    baseFee,
    deliveryFee,
    totalAmount: cartTotal + baseFee + deliveryFee,
  };
};

const calculateCartTotal = (items: CartItem[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

const initialState: PaymentState = {
  // Step navigation
  currentStep: 1,
  
  // Data
  product: null,
  customer: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  creditCard: {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    cardType: null,
  },
  delivery: {
    address: '',
    city: '',
    department: '',
    postalCode: '',
    recipientName: '',
    recipientPhone: '',
  },
  fees: {
    productAmount: 0,
    baseFee: 2500,
    deliveryFee: 5000,
    totalAmount: 7500,
  },
  transaction: {
    transactionId: '',
    status: 'pending',
    message: '',
    productNewStock: 0,
    wompiTransactionId: '',
    reference: '',
    amount: 0,
  },
  
  // UI State
  loading: false,
  error: null,
  cartItems: [],
  cartTotal: 0,
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Step navigation
    setCurrentStep: (state, action: PayloadAction<1 | 2 | 3 | 4 | 5>) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      if (state.currentStep < 5) {
        state.currentStep = (state.currentStep + 1) as 1 | 2 | 3 | 4 | 5;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep = (state.currentStep - 1) as 1 | 2 | 3 | 4 | 5;
      }
    },
    
    // Data setters
    setProduct: (state, action: PayloadAction<Product>) => {
      state.product = action.payload;
    },
    
    setCustomerInfo: (state, action: PayloadAction<CustomerInfo>) => {
      state.customer = action.payload;
    },
    
    setCreditCardInfo: (state, action: PayloadAction<CreditCardInfo>) => {
      state.creditCard = action.payload;
    },
    
    setDeliveryInfo: (state, action: PayloadAction<DeliveryInfo>) => {
      state.delivery = action.payload;
    },
    
    setTransactionInfo: (state, action: PayloadAction<TransactionInfo>) => {
      state.transaction = action.payload;
    },
    
    // Cart management
    addToCart: (state, action: PayloadAction<Product>) => {
      if (!Array.isArray(state.cartItems)) {
        state.cartItems = [];
      }
      
      const existingItem = state.cartItems.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({ product: action.payload, quantity: 1 });
      }
      
      // Recalcular totales y fees
      state.cartTotal = calculateCartTotal(state.cartItems);
      state.fees = calculateFees(state.cartTotal);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      if (!Array.isArray(state.cartItems)) {
        state.cartItems = [];
        return;
      }
      state.cartItems = state.cartItems.filter(item => item.product.id !== action.payload);
      state.cartTotal = calculateCartTotal(state.cartItems);
      state.fees = calculateFees(state.cartTotal);
    },
    
    updateCartItemQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      if (!Array.isArray(state.cartItems)) {
        state.cartItems = [];
        return;
      }
      const item = state.cartItems.find(item => item.product.id === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.cartItems = state.cartItems.filter(i => i.product.id !== action.payload.productId);
        }
      }
      state.cartTotal = calculateCartTotal(state.cartItems);
      state.fees = calculateFees(state.cartTotal);
    },
    
    clearCart: (state) => {
      state.cartItems = [];
      state.cartTotal = 0;
      state.fees = calculateFees(0);
    },
    
    // UI State
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Reset para nueva transacción
    resetPaymentFlow: (state) => {
      state.currentStep = 1;
      state.customer = initialState.customer;
      state.creditCard = initialState.creditCard;
      state.delivery = initialState.delivery;
      state.transaction = initialState.transaction;
      state.loading = false;
      state.error = null;
      // Mantener carrito y producto seleccionado
    },

    // Reset completo del sistema
    resetEverything: () => {
      return { ...initialState };
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  setProduct,
  setCustomerInfo,
  setCreditCardInfo,
  setDeliveryInfo,
  setTransactionInfo,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setLoading,
  setError,
  resetPaymentFlow,
  resetEverything,
} = paymentSlice.actions;

export default paymentSlice.reducer; 