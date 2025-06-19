import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setCurrentStep, resetPaymentFlow, clearCart, setTransactionInfo, resetEverything } from '../redux/paymentSlice';
import ProcessingPage from './ProcessingPage';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { fees, cartTotal } = useAppSelector((state) => state.payment);
  
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | 'pending'>('processing');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [showProcessing, setShowProcessing] = useState(true);

  useEffect(() => {
    // Obtener parámetros de respuesta de Wompi
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const reference = searchParams.get('reference');
    
    // Si hay parámetros de Wompi, procesar el resultado
    if (id && status) {
      // Mostrar ProcessingPage por 3 segundos como en el flujo original
      setTimeout(() => {
        const safeTotalAmount = cartTotal + (fees?.baseFee || 0) + (fees?.deliveryFee || 0);
        
        if (status === 'APPROVED') {
          setPaymentStatus('success');
          setTransactionDetails({
            id,
            status,
            reference,
            amount: safeTotalAmount,
          });
          dispatch(clearCart());
        } else if (status === 'DECLINED' || status === 'ERROR') {
          setPaymentStatus('failed');
          setTransactionDetails({
            id,
            status,
            reference,
          });
        } else {
          setPaymentStatus('pending');
          setTransactionDetails({
            id,
            status,
            reference,
          });
        }

        // Actualizar información de transacción en Redux
        const transactionInfo = {
          transactionId: reference || `TXN-${Date.now()}`,
          status: status.toLowerCase() as any,
          wompiTransactionId: id,
          reference: reference || '',
          amount: safeTotalAmount
        };
        dispatch(setTransactionInfo(transactionInfo));
        
        setShowProcessing(false);
      }, 3000);
    } else {
      // Si no hay parámetros de Wompi, redirigir al inicio
      navigate('/');
    }
  }, [searchParams, fees, cartTotal, dispatch, navigate]);

  // Mostrar ProcessingPage mientras se verifica el resultado
  if (showProcessing) {
    return <ProcessingPage />;
  }

  const handleBackToProducts = () => {
    dispatch(resetPaymentFlow());
    dispatch(setCurrentStep(1));
    navigate('/');
  };

  const handleNewPayment = () => {
    dispatch(resetEverything());
    navigate('/');
  };

  const handleTryAgain = () => {
    dispatch(setCurrentStep(3)); // Volver al summary
    navigate('/');
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verificando Pago
            </h1>
            <p className="text-gray-600">
              Estamos confirmando tu transacción con Wompi...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Pago Exitoso!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Tu compra se ha procesado correctamente
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Detalles de la Transacción
                </h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-green-700">ID de Transacción:</span>
                    <span className="font-medium text-green-900">{transactionDetails?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Referencia:</span>
                    <span className="font-medium text-green-900">{transactionDetails?.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Estado:</span>
                    <span className="font-medium text-green-900">APROBADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Monto:</span>
                    <span className="text-xl font-bold text-green-900">
                      ${transactionDetails?.amount?.toLocaleString()} COP
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">📧 Próximos Pasos</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Recibirás un email de confirmación</li>
                  <li>• Tu pedido será procesado en 24-48 horas</li>
                  <li>• El envío llegará según la dirección proporcionada</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleBackToProducts}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    🛍️ Seguir Comprando
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    🖨️ Imprimir Recibo
                  </button>
                </div>
                <button
                  onClick={handleNewPayment}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  🔄 Hacer Otro Pago
                </button>
              </div>
            </div>
          )}

          {/* Failed State */}
          {paymentStatus === 'failed' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Pago No Procesado
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Hubo un problema procesando tu pago
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">
                  Información del Error
                </h3>
                <div className="space-y-2 text-left">
                  {transactionDetails?.id && (
                    <div className="flex justify-between">
                      <span className="text-red-700">ID de Transacción:</span>
                      <span className="font-medium text-red-900">{transactionDetails.id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-red-700">Estado:</span>
                    <span className="font-medium text-red-900">{transactionDetails?.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Motivo:</span>
                    <span className="font-medium text-red-900">
                      {transactionDetails?.status === 'DECLINED' ? 'Transacción rechazada' : 'Error en el procesamiento'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Posibles Soluciones</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Verifica los datos de tu tarjeta</li>
                  <li>• Confirma que tengas fondos suficientes</li>
                  <li>• Intenta con otra tarjeta</li>
                  <li>• Contacta a tu banco si persiste el problema</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleTryAgain}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    🔄 Intentar de Nuevo
                  </button>
                  <button
                    onClick={handleBackToProducts}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    🛍️ Volver a Productos
                  </button>
                </div>
                <button
                  onClick={handleNewPayment}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  🔄 Hacer Otro Pago
                </button>
              </div>
            </div>
          )}

          {/* Pending State */}
          {paymentStatus === 'pending' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Pago Pendiente
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Tu pago está siendo procesado
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                  Estado de la Transacción
                </h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-yellow-700">ID de Transacción:</span>
                    <span className="font-medium text-yellow-900">{transactionDetails?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Estado:</span>
                    <span className="font-medium text-yellow-900">PENDIENTE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Mensaje:</span>
                    <span className="font-medium text-yellow-900">Pago en verificación</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">⏳ Qué esperar</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• La verificación puede tomar hasta 24 horas</li>
                  <li>• Recibirás un email cuando se confirme</li>
                  <li>• Puedes verificar el estado con el ID de transacción</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    🔄 Verificar Estado
                  </button>
                  <button
                    onClick={handleBackToProducts}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    🛍️ Continuar Comprando
                  </button>
                </div>
                <button
                  onClick={handleNewPayment}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  🔄 Hacer Otro Pago
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? Contacta nuestro soporte técnico
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Procesado por Wompi - Pago seguro garantizado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage; 