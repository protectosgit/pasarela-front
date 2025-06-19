import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from './paymentSlice';
import { loadStateFromStorage, saveStateToStorage } from '../utils/storage';
import type { PaymentState } from '../types';

const preloadedState = loadStateFromStorage();

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
  },
  preloadedState: preloadedState ? { 
    payment: preloadedState as PaymentState 
  } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  saveStateToStorage(store.getState().payment);
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 