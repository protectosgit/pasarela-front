import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product, CustomerInfo, DeliveryInfo, TransactionInfo, CartItem } from '../types';

interface PaymentState {
  product: Product | null;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  transaction: TransactionInfo;
  loading: boolean;
  error: string | null;
  cartItems: CartItem[];
  cartTotal: number;
}

const initialState: PaymentState = {
  product: null,
  customer: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  delivery: {
    address: '',
    city: '',
    department: '',
    postalCode: '',
    recipientName: '',
    recipientPhone: '',
  },
  transaction: {
    transactionId: '',
    status: 'pending',
    message: '',
    productNewStock: 0,
    wompiTransactionId: '',
  },
  loading: false,
  error: null,
  cartItems: [],
  cartTotal: 0,
};

const calculateTotal = (items: CartItem[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<Product>) => {
      state.product = action.payload;
    },
    setCustomerInfo: (state, action: PayloadAction<CustomerInfo>) => {
      state.customer = action.payload;
    },
    setDeliveryInfo: (state, action: PayloadAction<DeliveryInfo>) => {
      state.delivery = action.payload;
    },
    setTransactionInfo: (state, action: PayloadAction<TransactionInfo>) => {
      state.transaction = action.payload;
    },
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
      state.cartTotal = calculateTotal(state.cartItems);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      if (!Array.isArray(state.cartItems)) {
        state.cartItems = [];
        return;
      }
      state.cartItems = state.cartItems.filter(item => item.product.id !== action.payload);
      state.cartTotal = calculateTotal(state.cartItems);
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
      state.cartTotal = calculateTotal(state.cartItems);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.cartTotal = 0;
    },
  },
});

export const {
  setProduct,
  setCustomerInfo,
  setDeliveryInfo,
  setTransactionInfo,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} = paymentSlice.actions;

export default paymentSlice.reducer; 