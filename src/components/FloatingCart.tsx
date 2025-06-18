import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../types';

interface FloatingCartProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({
  items = [],
  total = 0,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigate('/payment');
    }, 300);
  };

  const safeItems = Array.isArray(items) ? items : [];
  
  const shouldBounce = safeItems.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleCart}
        className={`bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 
          transition-all duration-300 relative transform 
          ${shouldBounce ? 'animate-bounce' : ''} 
          hover:scale-110 active:scale-95`}
        style={{ animationDuration: '1s', animationIterationCount: 'infinite' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {safeItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {safeItems.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>

      <div
        className={`absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 
          transition-all duration-300 transform origin-bottom-right
          ${isOpen 
            ? 'scale-100 translate-x-0 opacity-100' 
            : 'scale-95 translate-x-full opacity-0 pointer-events-none'}`}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Carrito de Compras</h3>
          
          {safeItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                {safeItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        ${item.product.price.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 ml-2 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold">${total.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                    hover:bg-blue-700 transition-all duration-300 transform 
                    hover:scale-105 active:scale-95 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Proceder al pago
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingCart; 