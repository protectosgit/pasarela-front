import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../hooks/useRedux';
import {
  setCreditCardInfo,
  setCurrentStep,
  setCustomerInfo,
  setDeliveryInfo
} from '../redux/paymentSlice';
import CreditCardBrandDetector from './CreditCardBrandDetector';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState({
    // Customer info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Credit card info
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    
    // Delivery info
    address: '',
    city: '',
    department: '',
    postalCode: '',
    recipientName: '',
    recipientPhone: '',
  });

  const [currentTab, setCurrentTab] = useState<'personal' | 'card' | 'delivery'>('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | null>(null);

  useEffect(() => {
    if (!formData.cardNumber) {
      setCardType(null);
      return;
    }
    
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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const handleCardNumberChange = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 16) cleaned = cleaned.slice(0, 16);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatCardNumber(cleaned),
    }));
  };

  const handleExpiryDateChange = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    setFormData(prev => ({
      ...prev,
      expiryDate: cleaned,
    }));
  };

  const handlePhoneChange = (value: string, field: 'phone' | 'recipientPhone') => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    setFormData(prev => ({
      ...prev,
      [field]: limited,
    }));
  };

  const validateCurrentTab = () => {
    const newErrors: Record<string, string> = {};

    if (currentTab === 'personal') {
      if (!formData.firstName.trim()) newErrors.firstName = 'Nombre requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'Apellido requerido';
      if (!formData.email.includes('@')) newErrors.email = 'Email inválido';
      if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    } else if (currentTab === 'card') {
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Número de tarjeta debe tener 16 dígitos';
      }
      if (!formData.cardHolder.trim()) newErrors.cardHolder = 'Nombre del titular requerido';
      if (formData.expiryDate.length !== 5) newErrors.expiryDate = 'Fecha inválida (MM/YY)';
      if (formData.cvv.length !== 3) newErrors.cvv = 'CVV debe tener 3 dígitos';
    } else if (currentTab === 'delivery') {
      if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
      if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
      if (!formData.department.trim()) newErrors.department = 'Departamento requerido';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Código postal requerido';
      if (!formData.recipientName.trim()) newErrors.recipientName = 'Nombre del destinatario requerido';
      if (!formData.recipientPhone.trim()) newErrors.recipientPhone = 'Teléfono del destinatario requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentTab()) return;

    if (currentTab === 'personal') {
      setCurrentTab('card');
    } else if (currentTab === 'card') {
      setCurrentTab('delivery');
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentTab()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      dispatch(setCustomerInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }));

      dispatch(setCreditCardInfo({
        cardNumber: formData.cardNumber,
        cardHolder: formData.cardHolder,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        cardType,
      }));

      dispatch(setDeliveryInfo({
        address: formData.address,
        city: formData.city,
        department: formData.department,
        postalCode: formData.postalCode,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
      }));

      dispatch(setCurrentStep(2));
      onClose();
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'personal', 
      title: 'Personal', 
      icon: '👤',
      description: 'Información personal'
    },
    { 
      id: 'card', 
      title: 'Tarjeta', 
      icon: '💳',
      description: 'Datos de la tarjeta'
    },
    { 
      id: 'delivery', 
      title: 'Entrega', 
      icon: '📦',
      description: 'Dirección de entrega'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-strong w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-scaleIn">
          {/* Header */}
          <div className="relative bg-gradient-primary text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Información de Pago</h2>
              <p className="text-primary-100">Completa los datos para proceder</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-neutral-200 bg-neutral-50">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
                    currentTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{tab.title}</div>
                      <div className="text-xs text-neutral-500">{tab.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {currentTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Información Personal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                      placeholder="Tu nombre"
                    />
                    {errors.firstName && <p className="text-error-600 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                      placeholder="Tu apellido"
                    />
                    {errors.lastName && <p className="text-error-600 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-error-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value, 'phone')}
                    className={`input-field ${errors.phone ? 'input-error' : ''}`}
                    placeholder="3001234567"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-error-600 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            )}

            {currentTab === 'card' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Datos de la Tarjeta</h3>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Número de Tarjeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className={`input-field pr-16 ${errors.cardNumber ? 'input-error' : ''}`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    <CreditCardBrandDetector cardNumber={formData.cardNumber} />
                  </div>
                  {errors.cardNumber && <p className="text-error-600 text-sm mt-1">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    value={formData.cardHolder}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                    className={`input-field ${errors.cardHolder ? 'input-error' : ''}`}
                    placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                  />
                  {errors.cardHolder && <p className="text-error-600 text-sm mt-1">{errors.cardHolder}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => handleExpiryDateChange(e.target.value)}
                      className={`input-field ${errors.expiryDate ? 'input-error' : ''}`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiryDate && <p className="text-error-600 text-sm mt-1">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      className={`input-field ${errors.cvv ? 'input-error' : ''}`}
                      placeholder="123"
                      maxLength={3}
                    />
                    {errors.cvv && <p className="text-error-600 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'delivery' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Información de Entrega</h3>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`input-field ${errors.address ? 'input-error' : ''}`}
                    placeholder="Calle 123 #45-67"
                  />
                  {errors.address && <p className="text-error-600 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`input-field ${errors.city ? 'input-error' : ''}`}
                      placeholder="Medellín"
                    />
                    {errors.city && <p className="text-error-600 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className={`input-field ${errors.department ? 'input-error' : ''}`}
                      placeholder="Antioquia"
                    />
                    {errors.department && <p className="text-error-600 text-sm mt-1">{errors.department}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    className={`input-field ${errors.postalCode ? 'input-error' : ''}`}
                    placeholder="05001"
                  />
                  {errors.postalCode && <p className="text-error-600 text-sm mt-1">{errors.postalCode}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre del Destinatario
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                      className={`input-field ${errors.recipientName ? 'input-error' : ''}`}
                      placeholder="Nombre completo"
                    />
                    {errors.recipientName && <p className="text-error-600 text-sm mt-1">{errors.recipientName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Teléfono del Destinatario
                    </label>
                    <input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => handlePhoneChange(e.target.value, 'recipientPhone')}
                      className={`input-field ${errors.recipientPhone ? 'input-error' : ''}`}
                      placeholder="3001234567"
                      maxLength={10}
                    />
                    {errors.recipientPhone && <p className="text-error-600 text-sm mt-1">{errors.recipientPhone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-neutral-200 p-4 sm:p-6 bg-neutral-50 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  if (currentTab === 'personal') {
                    onClose();
                  } else if (currentTab === 'card') {
                    setCurrentTab('personal');
                  } else {
                    setCurrentTab('card');
                  }
                }}
                className="btn-outline px-6 py-3 flex-shrink-0 order-2 sm:order-1"
              >
                {currentTab === 'personal' ? 'Cancelar' : 'Anterior'}
              </button>

              <button
                onClick={handleNext}
                disabled={isLoading}
                className={`btn-primary px-8 py-3 flex-shrink-0 order-1 sm:order-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner w-4 h-4" />
                    <span>Procesando...</span>
                  </div>
                ) : currentTab === 'delivery' ? (
                  <span>Continuar al Resumen</span>
                ) : (
                  <span>Siguiente</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditCardModal; 