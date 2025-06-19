import React from 'react';

interface CreditCardDisplayProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | null;
}

const CreditCardDisplay: React.FC<CreditCardDisplayProps> = ({
  cardNumber,
  cardHolder,
  expiryDate,
  cardType
}) => {
  // Formatear el número de tarjeta en grupos de 4
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  // Mostrar los últimos 4 dígitos si hay número de tarjeta, o asteriscos si no hay
  const displayNumber = cardNumber 
    ? formatCardNumber(cardNumber)
    : '**** **** **** ****';

  const displayName = cardHolder || 'NOMBRE DEL TITULAR';
  const displayExpiry = expiryDate || 'MM/YY';

  const bgColor = cardType === 'mastercard' ? 'bg-black' : 'bg-[#1434CB]';

  return (
    <div className="w-[420px] h-[240px] rounded-[20px] relative text-white p-8">
      {/* Fondo según tipo de tarjeta */}
      <div className={`absolute inset-0 ${bgColor} rounded-[20px]`} />

      {/* Contenido de la tarjeta */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Parte superior: Chip y Logo */}
        <div className="flex justify-between items-start mb-8">
          {/* Chip */}
          <div className="w-12 h-9 bg-[#F4B425] rounded-[4px] overflow-hidden">
            <div className="h-full w-full grid grid-cols-2 gap-[2px] p-[2px]">
              <div className="bg-yellow-600/30 rounded-[1px]" />
              <div className="bg-yellow-600/30 rounded-[1px]" />
              <div className="bg-yellow-600/30 rounded-[1px]" />
              <div className="bg-yellow-600/30 rounded-[1px]" />
            </div>
          </div>

          {/* Logo */}
          {cardType === 'visa' && (
            <img src="/visa-logo.svg" alt="VISA" className="h-8" />
          )}
          {cardType === 'mastercard' && (
            <div className="flex items-center gap-2">
              <img src="/mastercard-logo.svg" alt="Mastercard" className="h-8" />
              <span className="text-white text-lg font-medium italic tracking-wide">
                MASTERCARD
              </span>
            </div>
          )}
        </div>

        {/* Número de tarjeta */}
        <div className="mb-8">
          <div className="text-[28px] font-light tracking-wider font-mono">
            {displayNumber}
          </div>
        </div>

        {/* Parte inferior: Nombre y Fecha */}
        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            <span className="text-sm opacity-80 mb-1">
              Titular de la Tarjeta
            </span>
            <span className="text-lg font-medium tracking-wider">
              {displayName}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm opacity-80 mb-1">
              Válida hasta
            </span>
            <span className="text-lg font-medium tracking-wider">
              {displayExpiry}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDisplay; 