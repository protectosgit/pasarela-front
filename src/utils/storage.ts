import type { PaymentState } from '../types';

const STORAGE_KEY = 'payment_state';

// Estado inicial por defecto
const defaultState: PaymentState = {
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

export const saveState = (state: PaymentState): void => {
  try {
    // Asegurarnos de que cartItems sea un array antes de guardar
    const safeState = {
      ...state,
      cartItems: Array.isArray(state.cartItems) ? state.cartItems : [],
      cartTotal: typeof state.cartTotal === 'number' ? state.cartTotal : 0,
    };
    const serializedState = JSON.stringify(safeState);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

export const loadState = (): PaymentState | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return undefined;
    
    const parsedState = JSON.parse(serializedState);
    
    // Asegurarnos de que el estado cargado tenga la estructura correcta
    return {
      ...defaultState,
      ...parsedState,
      cartItems: Array.isArray(parsedState.cartItems) ? parsedState.cartItems : [],
      cartTotal: typeof parsedState.cartTotal === 'number' ? parsedState.cartTotal : 0,
    };
  } catch (err) {
    console.error('Error loading state:', err);
    return undefined;
  }
};

export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing state:', err);
  }
}; 