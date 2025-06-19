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

    // VISA: Starts with 4, length 13, 16, or 19 digits
    if (cleanNumber.startsWith('4')) {
      setBrand('visa');
      return;
    }

    // MasterCard: More comprehensive detection
    // - 5[1-5] (51-55): Traditional MasterCard
    // - 2[2-7] (2221-2720): New MasterCard range (started 2017)
    if (cleanNumber.length >= 4) {
      const first4 = parseInt(cleanNumber.substring(0, 4));
      const first2 = parseInt(cleanNumber.substring(0, 2));
      
      // Traditional MasterCard range: 5100-5599
      if (first2 >= 51 && first2 <= 55) {
        setBrand('mastercard');
        return;
      }
      
      // New MasterCard range: 2221-2720
      if (first4 >= 2221 && first4 <= 2720) {
        setBrand('mastercard');
        return;
      }
    }

    // For cards with less than 4 digits, check simplified rules
    if (cleanNumber.length >= 2) {
      const first2 = parseInt(cleanNumber.substring(0, 2));
      
      // Early detection for traditional MasterCard
      if (first2 >= 51 && first2 <= 55) {
        setBrand('mastercard');
        return;
      }
      
      // Early detection for new MasterCard range (22-27)
      if (first2 >= 22 && first2 <= 27) {
        setBrand('mastercard');
        return;
      }
    }

    setBrand(null);
  }, [cardNumber]);

  if (!brand) return null;

  return (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
      {brand === 'visa' && (
        <div className="flex items-center bg-white rounded-md px-2 py-1 shadow-soft border">
          <img
            src="/visa-logo.svg"
            alt="Visa"
            className="h-5 w-auto"
          />
        </div>
      )}
      {brand === 'mastercard' && (
        <div className="flex items-center bg-white rounded-md px-2 py-1 shadow-soft border">
          <img
            src="/mastercard-logo.svg"
            alt="Mastercard"
            className="h-5 w-auto"
          />
        </div>
      )}
    </div>
  );
};

export default CreditCardBrandDetector; 