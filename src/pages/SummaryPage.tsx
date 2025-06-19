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

  // Log cuando se carga la página
  useEffect(() => {
    console.log('🟢 SummaryPage cargada');
    console.log('🟢 URL actual:', window.location.href);
    console.log('🟢 Estado del carrito:', { cartItems, customer, creditCard, delivery, fees, cartTotal });
  }, []);

  const handleNewPayment = () => {
    console.log('🔴 Reseteando todo...');
    dispatch(resetEverything());
  };

  const handlePayment = async () => {
    console.log('🔴 BOTÓN DE PAGO CLICKEADO');
    console.log('🔴 Estado actual:', { cartItems, customer, creditCard, delivery, fees, cartTotal });
    
    setIsProcessing(true);
    
    try {
      console.log('🔴 Iniciando proceso de pago...');
      
      const safeBaseFee = fees?.baseFee || 0;
      const safeDeliveryFee = fees?.deliveryFee || 0;
      const totalAmount = cartTotal + safeBaseFee + safeDeliveryFee;
      const customerEmail = customer?.email || 'cliente@test.com';
      
      console.log('🔴 Datos calculados:', {
        safeBaseFee,
        safeDeliveryFee,
        totalAmount,
        customerEmail
      });

      // Inicializar WompiService con logs
      WompiService.initialize();
      
      console.log('🔴 Llamando a WompiService.processPayment...');
      
      // Procesar pago usando el método tradicional de formulario
      const wompiFormData = await WompiService.processPayment(totalAmount, customerEmail);
      
      console.log('🔴 Respuesta de WompiService:', wompiFormData);
      
      // Guardar información de la transacción pendiente en Redux antes de ir a Wompi
      const pendingTransaction = {
        transactionId: wompiFormData.reference,
        status: 'pending' as const,
        wompiTransactionId: '',
        reference: wompiFormData.reference,
        amount: totalAmount
      };
      
      console.log('🔴 Guardando transacción en Redux:', pendingTransaction);
      dispatch(setTransactionInfo(pendingTransaction));
      
      console.log('🔴 Proceso completado, debería redirigir a Wompi...');

    } catch (error) {
      console.error('🔴 ERROR en handlePayment:', error);
      console.error('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      // En caso de error, mostrar mensaje
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      setIsProcessing(false);
    }
    // No quitamos setIsProcessing(false) porque la página se redirige a Wompi
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

  // Valores seguros para evitar errores de undefined
  const safeBaseFee = fees?.baseFee || 0;
  const safeDeliveryFee = fees?.deliveryFee || 0;
  const totalAmount = cartTotal + safeBaseFee + safeDeliveryFee;

  return (
    <>
      {/* Backdrop - Material Design 2 Component */}
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 animate-fadeIn" />
      
      {/* Backdrop Content Layer */}
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Main Content - Takes most of screen */}
        <div className="w-full h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📋</div>
              <h1 className="text-3xl font-bold mb-2">Resumen de Compra</h1>
              <p className="text-neutral-300 text-lg">
                Revisa tu pedido antes de continuar
              </p>
            </div>
          </div>

          {/* Backdrop Component - Bottom Sheet Style */}
          <div className="bg-white rounded-t-3xl shadow-strong max-h-[70vh] overflow-hidden animate-slideUp flex flex-col">
            {/* Header with handle */}
            <div className="p-6 border-b border-neutral-200 flex-shrink-0">
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-center">Confirmar Pago</h2>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* Order Items */}
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

                {/* Cost Breakdown */}
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

                {/* Customer & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Customer Info */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      Información Personal
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Nombre:</span> {customer?.firstName} {customer?.lastName}</p>
                      <p><span className="font-medium">Email:</span> {customer?.email}</p>
                      <p><span className="font-medium">Teléfono:</span> {customer?.phone}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">💳</span>
                      Método de Pago
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Tarjeta:</span> **** **** **** {creditCard?.cardNumber?.slice(-4)}</p>
                      <p><span className="font-medium">Titular:</span> {creditCard?.cardHolder}</p>
                      <p><span className="font-medium">Tipo:</span> {creditCard?.cardType?.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="p-4 bg-purple-50 rounded-xl md:col-span-2">
                    <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      Dirección de Entrega
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p><span className="font-medium">Dirección:</span> {delivery?.address}</p>
                      <p><span className="font-medium">Ciudad:</span> {delivery?.city}</p>
                      <p><span className="font-medium">Departamento:</span> {delivery?.department}</p>
                      <p><span className="font-medium">Código Postal:</span> {delivery?.postalCode}</p>
                      <p><span className="font-medium">Destinatario:</span> {delivery?.recipientName}</p>
                      <p><span className="font-medium">Teléfono:</span> {delivery?.recipientPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Payment Buttons */}
            <div className="border-t border-neutral-200 p-6 bg-white flex-shrink-0 space-y-4">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-xl text-xl font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isProcessing
                    ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-strong hover:shadow-mega'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="spinner w-6 h-6 border-white"></div>
                    <span>Conectando con Wompi...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Pagar con Wompi ${totalAmount.toFixed(2)} COP</span>
                  </div>
                )}
              </button>

              {/* New Payment Button */}
              <button
                onClick={handleNewPayment}
                disabled={isProcessing}
                className="w-full py-3 px-6 rounded-xl text-lg font-medium transition-all duration-200 border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Hacer Otro Pago</span>
                </div>
              </button>

              {/* Security Notice */}
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Serás redirigido a la plataforma segura de Wompi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryPage; 