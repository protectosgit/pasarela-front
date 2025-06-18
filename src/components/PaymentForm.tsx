import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreditCardDisplay from './CreditCardDisplay';

interface PaymentFormProps {
  onSubmit: (formData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  }) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const [cardType, setCardType] = useState<'visa' | 'mastercard' | null>(null);

  // Validar si el formulario está completo
  const isFormValid = () => {
    return (
      formData.cardNumber.replace(/\s/g, '').length === 16 &&
      formData.cardHolder.length >= 3 &&
      formData.expiryDate.length === 5 &&
      formData.cvv.length >= 3
    );
  };

  // Detectar tipo de tarjeta
  useEffect(() => {
    const number = formData.cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) {
      setCardType('visa');
    } else if (
      (number.startsWith('5') && ['1', '2', '3', '4', '5'].includes(number[1])) ||
      (number.startsWith('2') && 
        parseInt(number.substring(0, 4)) >= 2221 && 
        parseInt(number.substring(0, 4)) <= 2720)
    ) {
      setCardType('mastercard');
    } else {
      setCardType(null);
    }
  }, [formData.cardNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(formData);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatCardNumber(value),
    }));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setFormData(prev => ({
      ...prev,
      expiryDate: value,
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Visualización de la tarjeta */}
      <div className="mb-8">
        <CreditCardDisplay
          cardNumber={formData.cardNumber}
          cardHolder={formData.cardHolder}
          expiryDate={formData.expiryDate}
          cardType={cardType}
        />
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Volver a la tienda</span>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800 flex-1 text-center">Información de Pago</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Tarjeta
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={19}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Titular
            </label>
            <input
              type="text"
              value={formData.cardHolder}
              onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
              placeholder="Como aparece en la tarjeta"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={4}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full py-3 px-4 rounded-lg text-white text-lg font-medium transition-colors
                ${isFormValid() 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Pagar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm; 