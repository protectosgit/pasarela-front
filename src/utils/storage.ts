import { PaymentState } from '../types';

const STORAGE_KEY = 'wompi_payment_state';

export const defaultState: Partial<PaymentState> = {
  currentStep: 1,
  cartItems: [],
  cartTotal: 0,
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
  loading: false,
  error: null,
};

export const saveStateToStorage = (state: Partial<PaymentState>): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    // Silent fail
  }
};

export const loadStateFromStorage = (): Partial<PaymentState> => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return defaultState;
    }
    
    const parsed = JSON.parse(serialized);
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (err) {
    return defaultState;
  }
};

export const clearStateFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // Silent fail
  }
}; 