import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setProduct, addToCart } from '../redux/paymentSlice';
import { productService } from '../api/services';
import type { Product } from '../types';
import FloatingCart from '../components/FloatingCart';

const ProductPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { product, cartItems, cartTotal } = useAppSelector((state) => state.payment);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await productService.getAllProducts();
        setProducts(fetchedProducts);
        
        // Si hay productos, seleccionar el primero como producto actual
        if (fetchedProducts.length > 0) {
          dispatch(setProduct(fetchedProducts[0]));
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los productos');
        console.error('Error al cargar productos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [dispatch]);

  const handleAddToCart = (prod: Product) => {
    dispatch(addToCart(prod));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    dispatch({ type: 'payment/updateCartItemQuantity', payload: { productId, quantity: newQuantity } });
  };

  const handleRemoveItem = (productId: string) => {
    dispatch({ type: 'payment/removeFromCart', payload: productId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">No hay productos disponibles</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mt-8 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Productos Disponibles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div 
              key={prod.id}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{prod.name}</h2>
              <p className="text-gray-600 mb-6">{prod.description}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">${prod.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">Stock: {prod.stock} unidades</span>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(prod)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={prod.stock === 0}
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      </div>

      <FloatingCart
        items={cartItems}
        total={cartTotal}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
};

export default ProductPage; 