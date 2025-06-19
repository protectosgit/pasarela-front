import React from 'react';
import { useAppSelector } from '../hooks/useRedux';

interface WompiPaymentButtonSimpleProps {
  onPaymentComplete?: (transactionId: string) => void;
  onPaymentError?: (error: any) => void;
  className?: string;
}

const WompiPaymentButtonSimple: React.FC<WompiPaymentButtonSimpleProps> = ({
  className = '',
}) => {
  const { cartTotal } = useAppSelector((state) => state.payment);

  const publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
  const currency = 'COP';
  const amountInCents = Math.round(cartTotal * 100);
  const reference = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const redirectUrl = `${window.location.origin}/payment-result`;

  return (
    <form 
      action="https://checkout.wompi.co/p/" 
      method="GET"
      className="w-full"
    >
      {/* Campos requeridos por Wompi */}
      <input type="hidden" name="public-key" value={publicKey} />
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="amount-in-cents" value={amountInCents} />
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="redirect-url" value={redirectUrl} />
      
      {/* Campos opcionales para mejor UX */}
      <input type="hidden" name="collect-shipping" value="false" />
      <input type="hidden" name="tax-in-cents" value="0" />
      
      <button
        type="submit"
        className={`
          w-full bg-gradient-to-r from-blue-600 to-purple-600 
          text-white font-semibold py-4 px-6 rounded-lg 
          hover:from-blue-700 hover:to-purple-700 
          transform hover:scale-105 transition-all duration-200
          shadow-lg hover:shadow-xl
          flex items-center justify-center gap-3
          ${className}
        `}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        
        <span>Pagar con Wompi</span>
        
        <div className="bg-white bg-opacity-20 rounded px-2 py-1 text-sm">
          ${cartTotal.toLocaleString()}
        </div>
      </button>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          🔒 Pago seguro procesado por Wompi
        </p>
        <p className="text-xs text-gray-400">
          Acepta tarjetas de crédito y débito
        </p>
      </div>
    </form>
  );
};

export default WompiPaymentButtonSimple; 