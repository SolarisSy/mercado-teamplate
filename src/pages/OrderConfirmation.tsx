import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { clearCart } from '../features/cart/cartSlice';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  size?: string;
  color?: string;
}

const OrderConfirmation = () => {
  const [orderData, setOrderData] = useState<{items: CartItem[], total: number}>({
    items: [],
    total: 0
  });
  
  const [dataLoaded, setDataLoaded] = useState(false);
  const dispatch = useAppDispatch();
  
  // Obter dados do pedido do localStorage
  useEffect(() => {
    try {
      // Garantir que o carrinho seja limpo primeiro
      dispatch(clearCart());
      
      // Recuperar dados do localStorage
      const storedItems = localStorage.getItem('orderItems');
      const storedTotal = localStorage.getItem('orderTotal');
      
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          setOrderData({
            items: Array.isArray(parsedItems) ? parsedItems : [],
            total: storedTotal ? parseFloat(storedTotal) : 0
          });
          
          // Limpar os dados do localStorage após uso
          localStorage.removeItem('orderItems');
          localStorage.removeItem('orderTotal');
        } catch (error) {
          console.error('Erro ao processar dados do pedido:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar página de confirmação:', error);
    } finally {
      setDataLoaded(true);
    }
  }, [dispatch]);
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Pedido Confirmado!</h1>
        <p className="text-gray-600 mb-8">
          Obrigado por seu pedido. Você receberá um e-mail de confirmação em breve.
        </p>
        
        {/* Resumo do pedido */}
        <div className="mb-8 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-left">Resumo do Pedido</h2>
          <div className="border rounded-md p-4">
            {dataLoaded && Array.isArray(orderData.items) && orderData.items.length > 0 ? (
              <div className="space-y-2 mb-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.title} x{item.quantity}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {dataLoaded ? "Detalhes do pedido não disponíveis" : "Carregando detalhes do pedido..."}
              </p>
            )}
            
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total:</span>
              <span>R$ {orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-200 transition duration-300"
          >
            Voltar para a Home
          </Link>
          <Link 
            to="/order-history" 
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300"
          >
            Ver Histórico de Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
