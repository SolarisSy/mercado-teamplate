import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { removeProductFromTheCart, updateProductQuantity } from "../features/cart/cartSlice";
import { ProductImage, PaymentModal } from "../components";
import { formatCategoryName } from "../utils/formatCategoryName";
import toast from "react-hot-toast";

// Removendo import do heroicons e usando SVG inline
const TrashIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const Cart = () => {
  const { cartItems, totalAmount } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const handleRemoveItem = (id: string) => {
    dispatch(removeProductFromTheCart(id));
    toast.success("Item removido do carrinho");
  };
  
  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateProductQuantity({ id, quantity }));
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>
        <p className="text-xl text-gray-600 mb-8">Seu carrinho está vazio.</p>
        <Link 
          to="/shop" 
          className="inline-block bg-secondaryBrown text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition duration-300"
        >
          Continuar Comprando
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Seu Carrinho</h1>
      
      {/* Mobile-optimized product cards */}
      <div className="space-y-4 md:hidden">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{formatCategoryName(item.category)}</p>
                {item.size && <p className="text-sm text-gray-500">Tamanho: {item.size.toUpperCase()}</p>}
                {item.color && <p className="text-sm text-gray-500">Cor: {item.color}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 touch-manipulation"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 touch-manipulation"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 p-2 touch-manipulation"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <p className="mt-2 font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="h-16 w-16 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCategoryName(item.category)}
                            </div>
                            {item.size && (
                              <div className="text-sm text-gray-500">
                                Tamanho: {item.size.toUpperCase()}
                              </div>
                            )}
                            {item.color && (
                              <div className="text-sm text-gray-500">
                                Cor: {item.color}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">R$ {item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            -
                          </button>
                          <span className="mx-2 text-gray-700">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-2"
                        >
                          <TrashIcon /> Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between mb-4">
              <span className="font-bold">Total</span>
              <span className="font-bold">R$ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <button 
                onClick={handleOpenPaymentModal}
                className="block w-full bg-green-600 text-white text-center px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Pagar com PIX
              </button>
              <Link 
                to="/checkout" 
                className="block w-full bg-secondaryBrown text-white text-center px-4 py-2 rounded-md hover:bg-opacity-90 transition duration-300"
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>R$ {totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/shop" 
            className="w-full sm:w-auto text-center bg-gray-100 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-200 transition duration-300 touch-manipulation"
          >
            Continuar Comprando
          </Link>
          <button
            onClick={handleOpenPaymentModal}
            className="w-full sm:w-auto bg-secondaryBrown text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition duration-300 touch-manipulation"
          >
            Finalizar Compra
          </button>
        </div>
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} />
    </div>
  );
};

export default Cart;
