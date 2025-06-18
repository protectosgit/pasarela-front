import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setProduct } from '../redux/paymentSlice';

const ProductPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { product } = useAppSelector((state) => state.payment);

  useEffect(() => {
    // Simular carga de producto desde API
    const mockProduct = {
      id: '1',
      name: 'Producto de Ejemplo',
      description: 'Este es un producto de ejemplo para la pasarela de pago',
      price: 99.99,
      stock: 10
    };
    dispatch(setProduct(mockProduct));
  }, [dispatch]);

  const handlePayment = () => {
    navigate('/payment');
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h2>
      <p className="text-lg text-gray-600 mb-6">{product.description}</p>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">Stock disponible: {product.stock} unidades</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={product.stock === 0}
      >
        Pagar con tarjeta de crédito
      </button>
    </div>
  );
};

export default ProductPage; 