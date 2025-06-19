import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { setCurrentStep, resetEverything } from '../redux/paymentSlice';
import { useStore } from 'react-redux';
import { RootState } from '../redux/store';

interface PaymentData {
  id: number;
  reference: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentToken: string;
  wompiTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
  };
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
  };
}

const PaymentResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const store = useStore();
  
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const queryAttempts = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const INITIAL_DELAY = 3000;
  const RETRY_INTERVAL = 8000;
  const [waitingMessage, setWaitingMessage] = useState('Esperando confirmación de Wompi...');

  const urlParams = new URLSearchParams(location.search);
  const transactionId = urlParams.get('id');
  const reference = urlParams.get('reference');

  const fetchPaymentStatus = useCallback(async (): Promise<string> => {
    try {
      const referenceToUse = reference || transactionId;
      if (!referenceToUse) {
        setPaymentStatus('ERROR_NO_REFERENCE');
        return 'ERROR_NO_REFERENCE';
      }

      const response = await fetch(`https://back-pasarela.onrender.com/api/payments/${referenceToUse}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Consultar directamente en Wompi API
          try {
            const wompiResponse = await fetch(`https://back-pasarela.onrender.com/api/payments/${referenceToUse}/check-wompi`, {
              headers: {
                'ngrok-skip-browser-warning': 'true',
              }
            });

            if (wompiResponse.ok) {
              const wompiData = await wompiResponse.json();
              if (wompiData.success && wompiData.data) {
                setPaymentData({
                  id: Date.now(),
                  reference: referenceToUse,
                  amount: wompiData.data.amount_in_cents / 100,
                  status: mapWompiStatusToInternal(wompiData.data.status),
                  createdAt: wompiData.data.created_at,
                  updatedAt: wompiData.data.updated_at || wompiData.data.created_at,
                  paymentMethod: 'Tarjeta de Crédito',
                  paymentToken: wompiData.data.id,
                  wompiTransactionId: wompiData.data.id,
                  customer: getCustomerFromRedux(),
                  product: getProductFromRedux()
                });
                setPaymentStatus(mapWompiStatusToInternal(wompiData.data.status));
                return mapWompiStatusToInternal(wompiData.data.status);
              }
            }
          } catch (wompiError) {
            // Si falla consulta directa, intentar crear transacción
          }

          const state = store.getState() as RootState;
          
          const amountFromUrl = urlParams.get('amount_in_cents') 
            ? (parseInt(urlParams.get('amount_in_cents')!) / 100)
            : 0;
          
          const totalAmount = amountFromUrl > 0 ? amountFromUrl : state.payment.cartTotal;

          const transactionData = {
            reference: referenceToUse,
            amount: totalAmount.toString(),
            customer: state.payment.customer || {
              firstName: 'Cliente',
              lastName: 'Wompi',
              email: urlParams.get('customer-email') || 'no-email@example.com',
              phone: '0000000000'
            },
            delivery: state.payment.delivery || null,
            cartItems: state.payment.cartItems || [],
            creditCard: state.payment.creditCard || null,
            paymentMethod: urlParams.get('payment_method_type') || 'CARD'
          };
          
          const createResponse = await fetch(`https://back-pasarela.onrender.com/api/payments/create-transaction`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify(transactionData)
          });
          
          if (createResponse.ok) {
            const createdData = await createResponse.json();
            
            if (createdData.success) {
              setPaymentData({
                id: createdData.data.id,
                reference: createdData.data.reference || referenceToUse,
                amount: totalAmount,
                status: createdData.data.status,
                createdAt: createdData.data.createdAt,
                updatedAt: createdData.data.updatedAt,
                paymentMethod: createdData.data.paymentMethod || 'Tarjeta de Crédito',
                paymentToken: createdData.data.paymentToken,
                customer: state.payment.customer ? {
                  id: 0,
                  firstName: state.payment.customer.firstName,
                  lastName: state.payment.customer.lastName,
                  email: state.payment.customer.email,
                  phone: state.payment.customer.phone,
                  documentType: '',
                  documentNumber: ''
                } : undefined,
                product: state.payment.cartItems?.[0]?.product ? {
                  id: parseInt(state.payment.cartItems[0].product.id.toString()),
                  name: state.payment.cartItems[0].product.name,
                  description: state.payment.cartItems[0].product.description,
                  price: parseFloat(state.payment.cartItems[0].product.price.toString()),
                  stock: state.payment.cartItems[0].product.stock
                } : undefined,
                wompiTransactionId: createdData.data.wompiTransactionId
              });
              setPaymentStatus(createdData.data.status);
              return createdData.data.status;
            }
          } else {
            // const errorData = await createResponse.text();
          }
        }
        
        setPaymentStatus('ERROR_CONSULTA');
        return 'ERROR_CONSULTA';
      }

      const result = await response.json();

      if (result.success && result.data) {
        const paymentInfo = result.data;
        
        const state = store.getState() as RootState;
        
        setPaymentData({
          id: paymentInfo.id,
          reference: paymentInfo.reference || referenceToUse,
          amount: paymentInfo.amount > 0 ? paymentInfo.amount : state.payment.cartTotal,
          status: paymentInfo.status,
          createdAt: paymentInfo.createdAt,
          updatedAt: paymentInfo.updatedAt,
          paymentMethod: paymentInfo.paymentMethod || 'Tarjeta de Crédito',
          paymentToken: paymentInfo.paymentToken,
          customer: paymentInfo.customer || (state.payment.customer ? {
            id: 0,
            firstName: state.payment.customer.firstName,
            lastName: state.payment.customer.lastName,
            email: state.payment.customer.email,
            phone: state.payment.customer.phone,
            documentType: '',
            documentNumber: ''
          } : undefined),
          product: paymentInfo.product || (state.payment.cartItems?.[0]?.product ? {
            id: parseInt(state.payment.cartItems[0].product.id.toString()),
            name: state.payment.cartItems[0].product.name,
            description: state.payment.cartItems[0].product.description,
            price: parseFloat(state.payment.cartItems[0].product.price.toString()),
            stock: state.payment.cartItems[0].product.stock
          } : undefined),
          wompiTransactionId: paymentInfo.wompiTransactionId
        });
        
        setPaymentStatus(paymentInfo.status);
        return paymentInfo.status;
      } else {
        setPaymentStatus(result?.status || 'ERROR_CONSULTA');
        return result?.status || 'ERROR_CONSULTA';
      }

    } catch (error) {
      setPaymentStatus('ERROR_NETWORK');
      return 'ERROR_NETWORK';
    }
  }, [reference, transactionId, store]);

  // Función auxiliar para mapear estado de Wompi
  const mapWompiStatusToInternal = (wompiStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'APPROVED': 'APPROVED',
      'PENDING': 'PENDING', 
      'DECLINED': 'DECLINED',
      'VOIDED': 'FAILED',
      'ERROR': 'FAILED',
      'FAILED': 'FAILED'
    };
    return statusMap[wompiStatus] || 'PENDING';
  };

  // Función auxiliar para obtener cliente del Redux
  const getCustomerFromRedux = () => {
    const state = store.getState() as RootState;
    return state.payment.customer ? {
      id: 0,
      firstName: state.payment.customer.firstName,
      lastName: state.payment.customer.lastName,
      email: state.payment.customer.email,
      phone: state.payment.customer.phone,
      documentType: '',
      documentNumber: ''
    } : undefined;
  };

  // Función auxiliar para obtener producto del Redux
  const getProductFromRedux = () => {
    const state = store.getState() as RootState;
    return state.payment.cartItems?.[0]?.product ? {
      id: parseInt(state.payment.cartItems[0].product.id.toString()),
      name: state.payment.cartItems[0].product.name,
      description: state.payment.cartItems[0].product.description,
      price: parseFloat(state.payment.cartItems[0].product.price.toString()),
      stock: state.payment.cartItems[0].product.stock
    } : undefined;
  };

  useEffect(() => {
    let isMounted = true;
    
    if (queryAttempts.current === 0) {
      setLoading(true);
    }

    const consultAndSchedule = async () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

      queryAttempts.current += 1;
      
      if (queryAttempts.current % 15 === 0) {
        setWaitingMessage(`Aún esperando confirmación de Wompi... (${Math.floor(queryAttempts.current / 7.5)} minutos)`);
      }

      if (isMounted) setUpdatingStatus(true);

      const statusObtained = await fetchPaymentStatus();

      if (!isMounted) return;

      if (loading) setLoading(false);

      if (statusObtained === 'PENDING') {
        timeoutRef.current = window.setTimeout(consultAndSchedule, RETRY_INTERVAL);
      } else {
        setUpdatingStatus(false);
      }
    };

    queryAttempts.current = 0;
    timeoutRef.current = window.setTimeout(consultAndSchedule, INITIAL_DELAY);

    return () => {
      isMounted = false;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setUpdatingStatus(false);
    };
  }, [fetchPaymentStatus, loading]);

  const formatCurrency = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '$ 0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusInfo = () => {
    switch (paymentStatus) {
      case 'COMPLETED':
      case 'APPROVED':
        return {
          icon: '✅',
          title: '¡Pago Exitoso!',
          message: 'Tu compra ha sido procesada correctamente.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'PENDING':
      case 'PROCESSING':
        return {
          icon: '⏰',
          title: 'Pago en Proceso',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'FAILED':
      case 'REJECTED':
      case 'DECLINED':
        return {
          icon: '❌',
          title: 'Pago Rechazado',
          message: 'Tu pago fue rechazado. Por favor, intenta con otro método o contacta a tu banco.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: '❓',
          title: 'Estado del Pago',
          message: `No se pudo confirmar el estado final de tu pago. Referencia: ${reference || transactionId}. Contacta a soporte si el problema persiste.`,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const handleBackToStore = () => {
    dispatch(resetEverything());
    dispatch(setCurrentStep(1));
    navigate('/');
  };

  if (loading && !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando tu pago...</h2>
          <p className="text-gray-600">Por favor espera mientras confirmamos el estado de tu transacción.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  if (!paymentData && !loading && paymentStatus !== 'PENDING' && paymentStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h2 className={`text-2xl font-bold ${statusInfo.color} mb-4`}>{statusInfo.title}</h2>
          <p className="text-gray-600 mb-6">{statusInfo.message}</p>
          <button
            onClick={handleBackToStore}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className={`p-6 text-center border-b ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex justify-center items-center mb-4">
              <div className="text-6xl">{statusInfo.icon}</div>
              {updatingStatus && paymentStatus === 'PENDING' && (
                <div className="ml-4 animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
              )}
            </div>
            <h1 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>{statusInfo.title}</h1>
            <p className="text-gray-600 text-lg">{statusInfo.message}</p>
            {updatingStatus && paymentStatus === 'PENDING' && (
              <p className="mt-3 text-sm text-yellow-600 font-medium">
                {waitingMessage}
              </p>
            )}
          </div>

          {paymentData && (
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  📄 Información de la Transacción
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Referencia</p>
                    <p className="font-semibold text-gray-900">{paymentData.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Wompi</p>
                    <p className="font-semibold text-gray-900">{paymentData.wompiTransactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-semibold text-gray-900">
                      {paymentData.createdAt ? new Date(paymentData.createdAt).toLocaleString('es-CO') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de Pago</p>
                    <p className="font-semibold text-gray-900">{paymentData.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {paymentData.customer && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    👤 Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-semibold text-gray-900">
                        {paymentData.customer.firstName} {paymentData.customer.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{paymentData.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-semibold text-gray-900">{paymentData.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Documento</p>
                      <p className="font-semibold text-gray-900">
                        {paymentData.customer.documentType} {paymentData.customer.documentNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentData.product && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    🛍️ Producto Comprado
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{paymentData.product.name}</h4>
                        <p className="text-gray-600 mt-1">{paymentData.product.description}</p>
                        <p className="text-sm text-gray-500 mt-2">Cantidad: 1</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(paymentData.product.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-gray-700">TOTAL PAGADO:</span>
                  <span className="text-blue-600">{formatCurrency(paymentData.amount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 border-t flex justify-center">
            <button
              onClick={handleBackToStore}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage; 