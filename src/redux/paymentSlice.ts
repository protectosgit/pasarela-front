import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PaymentState, Product, CustomerInfo, DeliveryInfo, TransactionInfo } from '../types';

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
  transaction: {},
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetPayment: (state) => {
      return initialState;
    },
  },
});

export const {
  setProduct,
  setCustomerInfo,
  setDeliveryInfo,
  setTransactionInfo,
  setLoading,
  setError,
  resetPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer; 