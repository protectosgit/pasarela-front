import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const { transaction, product } = useAppSelector((state) => state.payment);

  useEffect(() => {
    if (!transaction.transactionId) {
      navigate('/');
    }
  }, [transaction, navigate]);

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = () => {
    switch (transaction.status) {
      case 'success':
        return '¡Pago realizado con éxito!';
      case 'failed':
        return 'El pago ha fallado';
      default:
        return 'Pago en proceso';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${getStatusColor()}`}>
          <span className="text-sm font-medium">{getStatusMessage()}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-t border-b border-gray-200 py-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Detalles de la Transacción</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">ID de Transacción</dt>
              <dd className="mt-1 text-sm text-gray-900">{transaction.transactionId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID de Transacción Wompi</dt>
              <dd className="mt-1 text-sm text-gray-900">{transaction.wompiTransactionId}</dd>
            </div>
            {product && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Producto</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monto</dt>
                  <dd className="mt-1 text-sm text-gray-900">${product.price}</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage; 