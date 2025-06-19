import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { nextStep } from '../redux/paymentSlice';

const ProcessingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { fees, cartTotal } = useAppSelector((state) => state.payment);

  // Safety checks for fees
  const safeTotalAmount = fees?.totalAmount || cartTotal + 2500 + 5000 || 7500;

  // Simular proceso de pago (en producción esto vendría del callback de Wompi)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(nextStep());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          {/* Loader */}
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Procesando tu Pago
          </h1>
          
          <p className="text-gray-600 mb-6">
            Estamos verificando tu transacción con Wompi. 
            No cierres esta ventana ni actualices la página.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total procesando:</span>
              <span className="text-xl font-bold text-blue-600">
                ${safeTotalAmount.toLocaleString()} COP
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Verificando información de pago</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Confirmando con el banco</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Actualizando inventario</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <p>🔒 Transacción segura</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage; 