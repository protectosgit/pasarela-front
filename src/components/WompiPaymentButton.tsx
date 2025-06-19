import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../hooks/useRedux';

interface WompiPaymentButtonProps {
  onPaymentComplete?: (transactionId: string) => void;
  onPaymentError?: (error: any) => void;
  className?: string;
}

const WompiPaymentButton: React.FC<WompiPaymentButtonProps> = ({
  onPaymentComplete,
  onPaymentError,
  className = '',
}) => {
  const { cartTotal } = useAppSelector((state) => state.payment);
  const formRef = useRef<HTMLFormElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
  const currency = 'COP';
  const amountInCents = Math.round(cartTotal * 100);
  const reference = `ORDER-${Date.now()}`;
  
  const generateSignature = () => {
    const data = `${reference}${amountInCents}${currency}${publicKey}`;
    return btoa(data).slice(0, 32);
  };

  const loadWompiWidget = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const existingScripts = document.querySelectorAll('script[src*="checkout.wompi.co"]');
    existingScripts.forEach(script => script.remove());

    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.setAttribute('data-render', 'button');
    script.setAttribute('data-public-key', publicKey);
    script.setAttribute('data-currency', 'COP');
    script.setAttribute('data-amount-in-cents', amountInCents.toString());
    script.setAttribute('data-reference', reference);
    script.async = true;

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      setError('Error al cargar el sistema de pagos');
      setIsLoading(false);
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://checkout.wompi.co') return;

      if (event.data.type === 'transaction.approved') {
        onPaymentComplete?.(event.data.transaction.id);
      } else if (event.data.type === 'transaction.error' || event.data.type === 'transaction.declined') {
        onPaymentError?.(event.data.error || 'Transacción rechazada');
      } else if (event.data.type === 'widget.error') {
        onPaymentError?.('Error en el sistema de pagos');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      const scripts = document.querySelectorAll('script[src*="checkout.wompi.co"]');
      scripts.forEach(script => script.remove());
    };
  }, [onPaymentComplete, onPaymentError]);

  if (cartTotal <= 0) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        El carrito está vacío
      </div>
    );
  }

  return (
    <div className={`wompi-payment-container ${className}`}>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Resumen del Pago
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-blue-600">Total a pagar:</span>
          <span className="text-xl font-bold text-blue-800">
            ${cartTotal.toFixed(2)} COP
          </span>
        </div>
        <div className="text-sm text-blue-600 mt-1">
          Referencia: {reference}
        </div>
      </div>

      <form ref={formRef} className="text-center">
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Pago seguro procesado por Wompi</p>
        <p>Ambiente de pruebas - No se realizarán cargos reales</p>
      </div>
    </div>
  );
};

export default WompiPaymentButton; 