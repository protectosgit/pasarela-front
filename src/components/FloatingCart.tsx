import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  clearCart,
  removeFromCart,
  updateCartItemQuantity
} from '../redux/paymentSlice';
import CreditCardModal from './CreditCardModal';

const FloatingCart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cartItems, cartTotal, fees } = useAppSelector((state) => state.payment);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);

  // Safety checks for fees
  const safeFees = {
    baseFee: fees?.baseFee || 2500,
    deliveryFee: fees?.deliveryFee || 5000,
    totalAmount: fees?.totalAmount || (cartTotal + (fees?.baseFee || 2500) + (fees?.deliveryFee || 5000)),
    productAmount: fees?.productAmount || cartTotal
  };

  const safeCartTotal = cartTotal || 0;

  if (cartItems.length === 0) {
    return null; // No mostrar si el carrito está vacío
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartItemQuantity({ productId, quantity }));
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-primary text-white rounded-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-strong hover:shadow-glow transition-all duration-300 hover:scale-110 group"
        >
          <div className="relative">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.6a1 1 0 001 1.4h9.2M7 13v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 1h10" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-error-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-soft">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Cart Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-strong animate-slideUp sm:animate-fadeIn">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.6a1 1 0 001 1.4h9.2M7 13v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 1h10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      Tu Carrito
                    </h2>
                    <p className="text-sm text-neutral-600">
                      {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-neutral-100 flex items-center justify-center transition-colors group"
                >
                  <svg className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item.product.id} 
                      className="card p-4 animate-slideUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📱</span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-neutral-600 mb-3">
                            ${item.product.price.toLocaleString()} c/u
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center transition-all hover:scale-105"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <span className="font-semibold text-sm px-2 py-1 bg-primary-50 text-primary-700 rounded-lg border border-primary-200 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                                  item.quantity >= item.product.stock
                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                                    : 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600'
                                }`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>

                            {/* Price and Remove */}
                            <div className="text-right">
                              <p className="font-bold text-primary-600 mb-1">
                                ${(item.product.price * item.quantity).toLocaleString()}
                              </p>
                              <button
                                onClick={() => dispatch(removeFromCart(item.product.id))}
                                className="text-error-600 hover:text-error-700 text-xs flex items-center gap-1 ml-auto"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clear Cart Button */}
                {cartItems.length > 1 && (
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="w-full mt-6 py-3 text-error-600 hover:text-error-700 text-sm font-medium border border-error-200 rounded-xl hover:bg-error-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Vaciar Carrito
                  </button>
                )}
              </div>

              {/* Footer with Summary and Checkout */}
              <div className="border-t border-neutral-200 p-6 bg-neutral-50 sticky bottom-0">
                {/* Cost Breakdown */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal productos:</span>
                    <span className="font-medium">${safeCartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tarifa base:</span>
                    <span className="font-medium">${safeFees.baseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Costo de envío:</span>
                    <span className="font-medium">
                      {safeFees.deliveryFee === 0 ? (
                        <span className="text-success-600 font-bold">GRATIS</span>
                      ) : (
                        `$${safeFees.deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-neutral-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-neutral-900">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${safeFees.totalAmount.toFixed(2)} COP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {safeFees.deliveryFee > 0 && (
                  <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-warning-600 text-lg">💡</div>
                      <div>
                        <p className="text-sm font-medium text-warning-800 mb-1">
                          ¡Casi tienes envío gratis!
                        </p>
                        <p className="text-xs text-warning-700">
                          Agrega ${Math.max(0, 50000 - safeCartTotal).toFixed(2)} más para envío gratuito
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay with Credit Card Button - REQUERIMIENTO WOMPI */}
                <button
                  onClick={() => setShowCreditCardModal(true)}
                  disabled={cartItems.length === 0}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    cartItems.length === 0
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-gradient-primary text-white shadow-soft hover:shadow-medium'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Pagar con Tarjeta de Crédito</span>
                  </div>
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-3 py-3 px-6 rounded-xl bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-50 transition-all duration-200 font-medium"
                >
                  Continuar Comprando
                </button>

                <div className="mt-3 text-center">
                  <p className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pago seguro con Wompi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Credit Card Modal */}
      <CreditCardModal 
        isOpen={showCreditCardModal}
        onClose={() => setShowCreditCardModal(false)}
      />
    </>
  );
};

export default FloatingCart; 