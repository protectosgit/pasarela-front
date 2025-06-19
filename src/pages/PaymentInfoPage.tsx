import React, { useEffect, useState } from 'react';
import CreditCardBrandDetector from '../components/CreditCardBrandDetector';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import {
  nextStep,
  previousStep,
  setCreditCardInfo,
  setCustomerInfo,
  setDeliveryInfo
} from '../redux/paymentSlice';

const PaymentInfoPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customer, creditCard, delivery, cartItems, fees } = useAppSelector((state) => state.payment);
  
  const [formData, setFormData] = useState({
    // Customer info
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    
    // Credit card info
    cardNumber: creditCard?.cardNumber || '',
    cardHolder: creditCard?.cardHolder || '',
    expiryDate: creditCard?.expiryDate || '',
    cvv: creditCard?.cvv || '',
    
    // Delivery info
    address: delivery?.address || '',
    city: delivery?.city || '',
    department: delivery?.department || '',
    postalCode: delivery?.postalCode || '',
    recipientName: delivery?.recipientName || '',
    recipientPhone: delivery?.recipientPhone || '',
  });

  const [cardType, setCardType] = useState<'visa' | 'mastercard' | null>(creditCard?.cardType || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Detectar tipo de tarjeta
  useEffect(() => {
    if (!formData.cardNumber) return;
    
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Customer validation
    if (!formData.firstName.trim()) newErrors.firstName = 'Nombre requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'Apellido requerido';
    if (!formData.email.includes('@')) newErrors.email = 'Email inválido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';

    // Credit card validation
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Número de tarjeta debe tener 16 dígitos';
    }
    if (!formData.cardHolder.trim()) newErrors.cardHolder = 'Nombre del titular requerido';
    if (formData.expiryDate.length !== 5) newErrors.expiryDate = 'Fecha inválida (MM/YY)';
    if (formData.cvv.length < 3) newErrors.cvv = 'CVV inválido';

    // Delivery validation
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.department.trim()) newErrors.department = 'Departamento requerido';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Código postal requerido';
    if (!formData.recipientName.trim()) newErrors.recipientName = 'Nombre del destinatario requerido';
    if (!formData.recipientPhone.trim()) newErrors.recipientPhone = 'Teléfono del destinatario requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simular delay de validación
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Guardar en Redux
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

      // Ir al siguiente paso
      dispatch(nextStep());
    } catch (error) {
      // Handle submission error silently
    } finally {
      setIsLoading(false);
    }
  };

  if (!cartItems || !cartItems.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center">
        <div className="text-center animate-slideUp">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-neutral-600 mb-6">
            Agrega algunos productos increíbles antes de continuar
          </p>
          <button
            onClick={() => dispatch(previousStep())}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 py-8 sm:py-12">
      <div className="container-narrow">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-slideUp">
          <button
            onClick={() => dispatch(previousStep())}
            className="btn-ghost mb-6 mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a productos
          </button>
          
          <div className="text-5xl sm:text-6xl mb-6">💳</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Información de Pago
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Completa tus datos para finalizar la compra de forma segura
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Personal */}
              <div className="card-elevated p-6 sm:p-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">
                    Información Personal
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                      placeholder="Tu nombre"
                    />
                    {errors.firstName && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                      placeholder="Tu apellido"
                    />
                    {errors.lastName && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`input-field ${errors.email ? 'input-error' : ''}`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`input-field ${errors.phone ? 'input-error' : ''}`}
                      placeholder="+57 300 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Tarjeta */}
              <div className="card-elevated p-6 sm:p-8 animate-slideUp" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">
                    Información de Tarjeta
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`input-field pr-12 ${errors.cardNumber ? 'input-error' : ''}`}
                      />
                      <CreditCardBrandDetector cardNumber={formData.cardNumber} />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      value={formData.cardHolder}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                      placeholder="COMO APARECE EN LA TARJETA"
                      className={`input-field ${errors.cardHolder ? 'input-error' : ''}`}
                    />
                    {errors.cardHolder && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.cardHolder}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Vencimiento *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`input-field ${errors.expiryDate ? 'input-error' : ''}`}
                      />
                      {errors.expiryDate && (
                        <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                        }))}
                        placeholder="123"
                        maxLength={4}
                        className={`input-field ${errors.cvv ? 'input-error' : ''}`}
                      />
                      {errors.cvv && (
                        <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Entrega */}
              <div className="card-elevated p-6 sm:p-8 animate-slideUp" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">
                    Información de Entrega
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Calle 123 #45-67, Apartamento 8B"
                      className={`input-field ${errors.address ? 'input-error' : ''}`}
                    />
                    {errors.address && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Bogotá"
                      className={`input-field ${errors.city ? 'input-error' : ''}`}
                    />
                    {errors.city && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Cundinamarca"
                      className={`input-field ${errors.department ? 'input-error' : ''}`}
                    />
                    {errors.department && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="110111"
                      className={`input-field ${errors.postalCode ? 'input-error' : ''}`}
                    />
                    {errors.postalCode && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre del Destinatario *
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                      placeholder="Quien recibe el paquete"
                      className={`input-field ${errors.recipientName ? 'input-error' : ''}`}
                    />
                    {errors.recipientName && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Teléfono del Destinatario *
                    </label>
                    <input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                      placeholder="+57 300 123 4567"
                      className={`input-field ${errors.recipientPhone ? 'input-error' : ''}`}
                    />
                    {errors.recipientPhone && (
                      <p className="text-error-600 text-sm mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.recipientPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} bg-gradient-primary text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-soft hover:shadow-medium`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="spinner w-5 h-5 border-white"></div>
                      Validando información...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Continuar al Resumen
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-8 animate-slideUp" style={{ animationDelay: '500ms' }}>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Resumen del Pedido
              </h3>
              
              <div className="space-y-3 mb-6">
                {cartItems && cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm py-2 border-b border-neutral-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-neutral-600">
                        ${item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-neutral-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span className="font-medium">${(fees?.productAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tarifa base:</span>
                  <span className="font-medium">${(fees?.baseFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Envío:</span>
                  <span className="font-medium">
                    {(fees?.deliveryFee || 0) === 0 ? (
                      <span className="text-success-600 font-bold">GRATIS</span>
                    ) : (
                      `$${(fees?.deliveryFee || 0).toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-neutral-200">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    ${(fees?.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-xl">
                <div className="flex items-center gap-2 text-success-800">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-sm">Compra 100% Segura</p>
                    <p className="text-xs text-success-700">
                      Tus datos están protegidos con encriptación SSL
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoPage; 