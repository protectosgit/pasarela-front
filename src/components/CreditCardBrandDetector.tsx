import { useEffect, useState } from 'react';

interface CreditCardBrandDetectorProps {
  cardNumber: string;
}

const CreditCardBrandDetector: React.FC<CreditCardBrandDetectorProps> = ({ cardNumber }) => {
  const [brand, setBrand] = useState<'visa' | 'mastercard' | null>(null);

  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    if (cleanNumber.length < 1) {
      setBrand(null);
      return;
    }

    // VISA: Starts with 4 (prioritize this check)
    if (cleanNumber.charAt(0) === '4') {
      setBrand('visa');
      return;
    }

    // MasterCard: Traditional range 5[1-5]
    if (cleanNumber.length >= 2) {
      const first2 = parseInt(cleanNumber.substring(0, 2));
      if (first2 >= 51 && first2 <= 55) {
        setBrand('mastercard');
        return;
      }
    }

    // MasterCard: New range 2221-2720
    if (cleanNumber.length >= 4) {
      const first4 = parseInt(cleanNumber.substring(0, 4));
      if (first4 >= 2221 && first4 <= 2720) {
        setBrand('mastercard');
        return;
      }
    }

    // Early detection for new MasterCard range starting with 22-27
    if (cleanNumber.length >= 2) {
      const first2 = parseInt(cleanNumber.substring(0, 2));
      if (first2 >= 22 && first2 <= 27) {
        setBrand('mastercard');
        return;
      }
    }

    setBrand(null);
  }, [cardNumber]);

  if (!brand) return null;

  return (
    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
      {brand === 'visa' && (
        <div className="flex items-center bg-white rounded-md px-2 py-1 shadow-lg border border-gray-200">
          <img
            src="/visa-logo.svg"
            alt="Visa"
            className="h-4 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-blue-600 font-bold text-xs">VISA</span>';
            }}
          />
        </div>
      )}
      {brand === 'mastercard' && (
        <div className="flex items-center bg-white rounded-md px-2 py-1 shadow-lg border border-gray-200">
          <img
            src="/mastercard-logo.svg"
            alt="Mastercard"
            className="h-4 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-red-600 font-bold text-xs">MC</span>';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CreditCardBrandDetector; 