import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { setCurrentStep } from '../redux/paymentSlice';
import ProductPage from './ProductPage';
import SummaryPage from './SummaryPage';

const CheckoutFlow: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStep, cartItems } = useAppSelector((state) => state.payment);

  useEffect(() => {
    if (cartItems.length === 0 && currentStep > 1) {
      dispatch(setCurrentStep(1));
    }
  }, [cartItems.length, currentStep, dispatch]);

  const getStepIcon = (step: number, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return (
        <div className="w-8 h-8 bg-success-500 text-white rounded-full flex items-center justify-center shadow-soft">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
    if (isCurrent) {
      return (
        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-soft animate-pulse-slow">
          <span className="text-sm font-bold">{step}</span>
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 bg-neutral-300 text-neutral-600 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium">{step}</span>
      </div>
    );
  };

  const steps = [
    { number: 1, title: 'Productos', description: 'Selecciona y compra' },
    { number: 2, title: 'Pagar', description: 'Confirmar con Wompi' },
  ];

  const renderProgressBar = () => (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-100 via-primary-50 to-transparent opacity-30 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  {getStepIcon(step.number, isCompleted, isCurrent)}
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isCurrent ? 'text-primary-700' : 
                      isCompleted ? 'text-success-700' : 
                      'text-neutral-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-neutral-500 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-success-300' : 'bg-neutral-200'
                  } transition-colors duration-300`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProductPage />;
      case 2:
        return <SummaryPage />;
      default:
        return <ProductPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {renderProgressBar()}
          <div className="mt-8">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow; 