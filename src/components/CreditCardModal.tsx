import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setTransactionInfo, clearCart } from '../redux/paymentSlice';

interface CreditCardModalProps {
  onClose: () => void;
}

declare global {
  interface Window {
    WidgetCheckout: new (config: any) => any;
  }
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cartItems, cartTotal } = useAppSelector((state) => state.payment);
  const checkoutRef = useRef<any>(null);

  useEffect(() => {
    // Cargar el script de Wompi
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (cartItems.length > 0) {
        const checkout = new window.WidgetCheckout({
          currency: 'COP',
          amountInCents: Math.round(cartTotal * 100),
          reference: `CART-${Date.now()}`,
          publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
          redirectUrl: window.location.origin + '/payment-result',
        });

        checkoutRef.current = checkout;
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [cartItems, cartTotal]);

  const handlePayment = () => {
    if (checkoutRef.current) {
      checkoutRef.current.open((result: any) => {
        const transactionInfo = {
          transactionId: result.transaction.id,
          status: result.transaction.status,
          wompiTransactionId: result.transaction.id,
        };
        
        dispatch(setTransactionInfo(transactionInfo));
        dispatch(clearCart()); // Limpiar el carrito después de un pago exitoso
        navigate('/payment-result');
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Pago con Tarjeta de Crédito</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-t border-b py-4">
            <h4 className="font-medium mb-2">Resumen del Carrito</h4>
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Serás redirigido al procesador de pagos seguro de Wompi para completar tu compra.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handlePayment}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              disabled={cartItems.length === 0}
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardModal; 