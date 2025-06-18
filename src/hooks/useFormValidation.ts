import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => boolean;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((name: string, value: string): string => {
    const fieldRules = rules[name];
    if (!fieldRules) return '';

    if (fieldRules.required && !value) {
      return 'Este campo es requerido';
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      return 'Formato inválido';
    }

    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      return `Mínimo ${fieldRules.minLength} caracteres`;
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      return `Máximo ${fieldRules.maxLength} caracteres`;
    }

    if (fieldRules.custom && !fieldRules.custom(value)) {
      return 'Valor inválido';
    }

    return '';
  }, [rules]);

  const validateForm = useCallback((data: { [key: string]: string }): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, data[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  return {
    errors,
    validateField,
    validateForm,
  };
};

// Reglas de validación predefinidas
export const validationRules = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s-]{10,}$/,
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 100,
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  department: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  postalCode: {
    required: true,
    pattern: /^\d{5,6}$/,
  },
  recipientName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  recipientPhone: {
    required: true,
    pattern: /^\+?[\d\s-]{10,}$/,
  },
}; 