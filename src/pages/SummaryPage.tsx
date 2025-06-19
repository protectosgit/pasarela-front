import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setCurrentStep, setTransactionInfo, resetEverything } from '../redux/paymentSlice';
import { WompiService } from '../services/wompiService';

const SummaryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    cartItems, 
    customer, 
    creditCard, 
    delivery, 
    fees,
    cartTotal
  } = useAppSelector((state) => state.payment);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // ... existing code ...
  }, []);

  const handleNewPayment = () => {
    dispatch(resetEverything());
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const safeBaseFee = fees?.baseFee || 0;
      const safeDeliveryFee = fees?.deliveryFee || 0;
      const totalAmount = cartTotal + safeBaseFee + safeDeliveryFee;
      const customerEmail = customer?.email || 'cliente@test.com';

      WompiService.initialize();
      
      const wompiFormData = await WompiService.processPayment(totalAmount, customerEmail);
      
      const pendingTransaction = {
        transactionId: wompiFormData.reference,
        status: 'pending' as const,
        wompiTransactionId: '',
        reference: wompiFormData.reference,
        amount: totalAmount
      };
      
      dispatch(setTransactionInfo(pendingTransaction));

    } catch (error) {
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay productos en el carrito
          </h2>
          <button
            onClick={() => dispatch(setCurrentStep(1))}
            className="text-blue-600 hover:text-blue-700"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const safeBaseFee = fees?.baseFee || 0;
  const safeDeliveryFee = fees?.deliveryFee || 0;
  const totalAmount = cartTotal + safeBaseFee + safeDeliveryFee;

  return (
    <>
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 animate-fadeIn" />
      
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-white">
            
              <h1 className="text-3xl font-bold mb-2">Resumen de Compra</h1>
              <p className="text-neutral-300 text-lg">
                Revisa tu pedido antes de continuar
              </p>
            </div>
          </div>

          <div className="bg-white rounded-t-3xl shadow-strong max-h-[70vh] overflow-hidden animate-slideUp flex flex-col">
            <div className="p-6 border-b border-neutral-200 flex-shrink-0">
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-center">Confirmar Pago</h2>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🛍️</span>
                  Tu Pedido
                </h3>
                
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item.product.id} 
                      className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">{item.product.name}</h4>
                        <p className="text-sm text-neutral-600">
                          ${item.product.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-neutral-50 rounded-xl space-y-3">
                  <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    Desglose de Costos
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal productos:</span>
                      <span className="font-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Tarifa base:</span>
                      <span className="font-medium">${safeBaseFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Costo de envío:</span>
                      <span className="font-medium">${safeDeliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-primary-600">${totalAmount.toFixed(2)} COP</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      Información del Cliente
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Nombre:</span>
                        <span className="font-medium">{customer?.firstName} {customer?.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Email:</span>
                        <span className="font-medium">{customer?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Teléfono:</span>
                        <span className="font-medium">{customer?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">💳</span>
                      Información de Pago
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Tarjeta:</span>
                        <span className="font-medium">****{creditCard?.cardNumber?.slice(-4) || '****'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Titular:</span>
                        <span className="font-medium">{creditCard?.cardHolder || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl md:col-span-2">
                    <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">🚚</span>
                      Información de Entrega
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Dirección:</span>
                          <span className="font-medium">{delivery?.address || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Ciudad:</span>
                          <span className="font-medium">{delivery?.city || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Departamento:</span>
                          <span className="font-medium">{delivery?.department || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Código postal:</span>
                          <span className="font-medium">{delivery?.postalCode || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-neutral-200 flex-shrink-0 space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={handleNewPayment}
                  className="flex-1 py-4 px-6 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Nuevo Pago
                </button>
                
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-2 py-4 px-8 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : (
                    `Pagar $${totalAmount.toFixed(2)} COP`
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                <span className="text-green-600">🔒</span>
                Pago seguro con Wompi - Todos tus datos están protegidos
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryPage; 