import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { 
  addToCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  setProduct 
} from '../redux/paymentSlice';
import { productService } from '../api/services';
import type { Product } from '../types';
import FloatingCart from '../components/FloatingCart';

const ProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cartItems } = useAppSelector((state) => state.payment);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
    dispatch(setProduct(product));
  };

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    dispatch(updateCartItemQuantity({ productId, quantity }));
  };

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center">
        <div className="text-center animate-slideUp">
          <div className="relative mb-8">
            <div className="spinner w-16 h-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-primary-100/20 animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">
            Cargando productos increíbles...
          </h3>
          <p className="text-neutral-600">
            Preparando la mejor selección para ti
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-error-50/20 to-neutral-50 flex items-center justify-center">
        <div className="text-center animate-slideUp">
          <div className="text-6xl mb-6">😞</div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-4">
            Ups, algo salió mal
          </h3>
          <p className="text-neutral-600 mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={() => {
              const fetchProducts = async () => {
                try {
                  setLoading(true);
                  const data = await productService.getAllProducts();
                  setProducts(data);
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              };

              fetchProducts();
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative container-responsive py-16 sm:py-24 lg:py-32">
          <div className="text-center animate-slideUp">
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 floating">
              🛍️
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Descubre Productos
              <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Extraordinarios
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Tecnología de última generación, diseño excepcional y la mejor experiencia de compra
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm">Productos</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Soporte</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12 sm:h-16 lg:h-20 text-neutral-50"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0V60s360,60,600,0S1200,60,1200,60V0Z"
              className="fill-current"
            />
          </svg>
        </div>
      </div>

      {/* Products Section */}
      <div className="container-responsive py-16 sm:py-20 lg:py-24">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Nuestros Productos
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Cada producto ha sido cuidadosamente seleccionado para brindarte la mejor experiencia
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => {
            const quantity = getItemQuantity(product.id);
            const isLowStock = product.stock <= 5 && product.stock > 0;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                className="card-interactive group animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary-100 via-primary-50 to-neutral-100 rounded-t-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                      📱
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {isOutOfStock && (
                      <span className="badge-error">
                        Sin Stock
                      </span>
                    )}
                    {isLowStock && (
                      <span className="badge-warning">
                        ¡Solo {product.stock}!
                      </span>
                    )}
                    {!isOutOfStock && !isLowStock && (
                      <span className="badge-success">
                        {product.stock} disponibles
                      </span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-all duration-300"></div>
                </div>

                {/* Product Info */}
                <div className="p-5 sm:p-6">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary-700 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3 min-h-[4rem]">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-primary-600">
                        ${product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-neutral-500">COP</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {quantity === 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full ${
                        isOutOfStock
                          ? 'btn-outline opacity-50 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {isOutOfStock ? (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                          Agotado
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.6a1 1 0 001 1.4h9.2M7 13v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 1h10" />
                          </svg>
                          Agregar al Carrito
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between card p-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                            className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center transition-all hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="font-bold text-lg px-3 py-1 bg-primary-50 text-primary-700 rounded-lg border border-primary-200 min-w-[3rem] text-center">
                            {quantity}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stock}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${
                              quantity >= product.stock
                                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                                : 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Total</p>
                          <p className="font-bold text-primary-600">
                            ${(product.price * quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromCart(product.id)}
                        className="w-full text-error-600 hover:text-error-700 text-sm font-medium py-2 border border-error-200 rounded-xl hover:bg-error-50 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                {/* Low Stock Warning */}
                {isLowStock && (
                  <div className="px-5 pb-5">
                    <div className="text-xs text-warning-700 bg-warning-100 rounded-xl px-3 py-2 text-center font-medium border border-warning-200">
                      ⚠️ ¡Quedan pocas unidades!
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-20 animate-slideUp">
            <div className="text-8xl mb-8">🛍️</div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
              No hay productos disponibles
            </h3>
            <p className="text-neutral-600 text-lg mb-8 max-w-md mx-auto">
              Estamos preparando productos increíbles para ti. ¡Vuelve pronto!
            </p>
            <button
              onClick={() => {
                const fetchProducts = async () => {
                  try {
                    setLoading(true);
                    const data = await productService.getAllProducts();
                    setProducts(data);
                  } catch (err: any) {
                    setError(err.message);
                  } finally {
                    setLoading(false);
                  }
                };

                fetchProducts();
              }}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recargar Productos
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Component */}
      <FloatingCart />
    </div>
  );
};

export default ProductPage; 