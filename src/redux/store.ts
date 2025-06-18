import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from './paymentSlice';
import { loadState, saveState } from '../utils/storage';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
  },
  preloadedState: preloadedState ? { payment: preloadedState } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  saveState(store.getState().payment);
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 