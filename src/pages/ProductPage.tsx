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
    return <div>Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="mb-4">
        <p className="text-lg font-semibold">Precio: ${product.price}</p>
        <p className="text-sm text-gray-500">Stock disponible: {product.stock} unidades</p>
      </div>
      <button
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        disabled={product.stock === 0}
      >
        Pagar con tarjeta de crédito
      </button>
    </div>
  );
};

export default ProductPage; 