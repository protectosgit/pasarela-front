import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../hooks/useRedux';

// Declaración de tipos para Wompi
declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

interface WompiPaymentButtonRobustProps {
  onPaymentComplete?: (transactionId: string) => void;
  onPaymentError?: (error: any) => void;
  className?: string;
}

const WompiPaymentButtonRobust: React.FC<WompiPaymentButtonRobustProps> = ({
  onPaymentComplete,
  onPaymentError,
  className = '',
}) => {
  const { cartTotal } = useAppSelector((state) => state.payment);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
  const amountInCents = Math.round(cartTotal * 100);
  const reference = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const cleanup = () => {
    try {
      if (window.WidgetCheckout) {
        delete window.WidgetCheckout;
      }
      
      const scripts = document.querySelectorAll('script[src*="wompi"], script[src*="checkout"]');
      scripts.forEach(script => {
        try {
          script.remove();
        } catch (error) {
          // Silent fail
        }
      });

      const wompiElements = document.querySelectorAll('[id*="wompi"], [class*="wompi"]');
      wompiElements.forEach(element => {
        try {
          element.remove();
        } catch (error) {
          // Silent fail
        }
      });

      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
        } catch (error) {
          // Silent fail
        }
      }

      try {
        const existingScripts = document.querySelectorAll('script[src*="checkout.wompi.co"]');
        existingScripts.forEach(script => {
          try {
            script.remove();
          } catch (error) {
            // Silent fail
        }
      });
      } catch (error) {
        // Silent fail
      }
    } catch (error) {
      // Silent fail
    }
  };

  const loadWompiWidget = async () => {
    if (isLoadingRef.current || cartTotal <= 0) {
      return;
    }

    isLoadingRef.current = true;

    try {
      cleanup();

      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.id = 'wompi-widget-script';

      const loadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => {
          setTimeout(() => {
            if (window.WidgetCheckout) {
              resolve();
            } else {
              reject(new Error('Widget no disponible'));
            }
          }, 500);
        };
        script.onerror = () => reject(new Error('Error cargando script'));
      });

      document.head.appendChild(script);
      await loadPromise;

      if (!containerRef.current) return;

      containerRef.current.innerHTML = `
        <div id="wompi-widget-container">
          <div class="wompi-widget" 
            data-render="button"
            data-public-key="${publicKey}"
               data-currency="COP" 
            data-amount-in-cents="${amountInCents}"
               data-reference="${reference}">
          </div>
        </div>
      `;

        isLoadingRef.current = false;
    } catch (error) {
      isLoadingRef.current = false;
      onPaymentError?.(error);
    }
  };

  useEffect(() => {
    if (cartTotal > 0) {
      // Delay para evitar múltiples cargas
      const timeoutId = setTimeout(() => {
        loadWompiWidget();
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [cartTotal, loadWompiWidget]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleWompiMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://checkout.wompi.co') return;

      try {
        if (event.data.type === 'PAYMENT_APPROVED') {
          onPaymentComplete?.(event.data.transaction?.id);
        } else if (event.data.type === 'PAYMENT_ERROR' || event.data.type === 'PAYMENT_DECLINED') {
          onPaymentError?.(event.data);
        } else if (event.data.type === 'PAYMENT_CANCELLED') {
          onPaymentError?.('Pago cancelado por el usuario');
        }
      } catch (error) {
        // Silent fail
      }
    };

    window.addEventListener('message', handleWompiMessage);
    return () => window.removeEventListener('message', handleWompiMessage);
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

      {/* Container para el widget - sin manipulación directa */}
      <div 
        ref={containerRef}
        className="wompi-widget-container"
        style={{ minHeight: '60px' }}
      >
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando sistema de pagos...</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Pago seguro procesado por Wompi</p>
        <p>Ambiente de pruebas - No se realizarán cargos reales</p>
      </div>
    </div>
  );
};

export default WompiPaymentButtonRobust; 