import { useEffect, useState } from 'react';

interface CreditCardBrandDetectorProps {
  cardNumber: string;
}

const CreditCardBrandDetector: React.FC<CreditCardBrandDetectorProps> = ({ cardNumber }) => {
  const [brand, setBrand] = useState<'visa' | 'mastercard' | null>(null);

  useEffect(() => {
    // Eliminar espacios y caracteres no numéricos
    const cleanNumber = cardNumber.replace(/\D/g, '');

    if (cleanNumber.length < 2) {
      setBrand(null);
      return;
    }

    // Visa comienza con 4
    if (cleanNumber.startsWith('4')) {
      setBrand('visa');
      return;
    }

    // Mastercard comienza con 51-55 o 2221-2720
    if (
      (cleanNumber.startsWith('5') && ['1', '2', '3', '4', '5'].includes(cleanNumber[1])) ||
      (cleanNumber.startsWith('2') && 
        parseInt(cleanNumber.substring(0, 4)) >= 2221 && 
        parseInt(cleanNumber.substring(0, 4)) <= 2720)
    ) {
      setBrand('mastercard');
      return;
    }

    setBrand(null);
  }, [cardNumber]);

  if (!brand) return null;

  return (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      {brand === 'visa' && (
        <img
          src="/visa-logo.svg"
          alt="Visa"
          className="h-6 w-auto"
        />
      )}
      {brand === 'mastercard' && (
        <img
          src="/mastercard-logo.svg"
          alt="Mastercard"
          className="h-6 w-auto"
        />
      )}
    </div>
  );
};

export default CreditCardBrandDetector; 