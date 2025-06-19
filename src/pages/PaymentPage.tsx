import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreditCardModal from '../components/CreditCardModal';
import PaymentForm from '../components/PaymentForm';
import { useAppSelector } from '../hooks/useRedux';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal } = useAppSelector((state) => state.payment);
  const [showModal, setShowModal] = useState(false);

  if (!cartItems?.length) {
    navigate('/');
    return null;
  }

  const handlePaymentSubmit = () =>
    setShowModal(true);


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumen de Compra</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <PaymentForm onSubmit={handlePaymentSubmit} />
        </div>
      </div>

      <CreditCardModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default PaymentPage; 