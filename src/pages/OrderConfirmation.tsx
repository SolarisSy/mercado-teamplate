import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { clearCart } from '../features/cart/cartSlice';
import { PaymentStatus } from '../services/paymentService';

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

interface OrderData {
  items: CartItem[];
  total: number;
  paymentStatus: PaymentStatus;
  orderNumber?: string;
  orderDate?: string;
  estimatedDelivery?: string;
}

const OrderConfirmation = () => {
  const [orderData, setOrderData] = useState<OrderData>({
    items: [],
    total: 0,
    paymentStatus: PaymentStatus.PENDING
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
      const storedPaymentStatus = localStorage.getItem('paymentStatus');
      const storedOrderNumber = localStorage.getItem('orderNumber');
      
      // Limpar o hash da transação após o carregamento dos dados
      localStorage.removeItem('transactionHash');
      
      // Calcular data estimada de entrega (3 dias úteis a partir de hoje)
      const today = new Date();
      const estimatedDelivery = new Date(today);
      estimatedDelivery.setDate(today.getDate() + 3); // Adicionar 3 dias à data atual
      
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          setOrderData({
            items: Array.isArray(parsedItems) ? parsedItems : [],
            total: storedTotal ? parseFloat(storedTotal) : 0,
            paymentStatus: (storedPaymentStatus as PaymentStatus) || PaymentStatus.PAID,
            orderNumber: storedOrderNumber || `PED-${Math.floor(Math.random() * 10000)}`,
            orderDate: today.toISOString(),
            estimatedDelivery: estimatedDelivery.toISOString()
          });
          
          // Limpar os dados do localStorage após uso
          localStorage.removeItem('orderItems');
          localStorage.removeItem('orderTotal');
          localStorage.removeItem('paymentStatus');
          localStorage.removeItem('orderNumber');
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
  
  // Formatar data em formato legível
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Pedido Confirmado!</h1>
          <p className="text-gray-600">
            Obrigado por seu pedido. Você receberá um e-mail de confirmação em breve.
          </p>
        </div>
        
        {/* Informações do pedido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Detalhes do Pedido</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-3">
                <p className="text-sm text-gray-600">Número do Pedido</p>
                <p className="font-medium">{orderData.orderNumber}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-600">Data do Pedido</p>
                <p className="font-medium">{formatDate(orderData.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Entrega Estimada</p>
                <p className="font-medium">{formatDate(orderData.estimatedDelivery)}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Status do Pedido</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {/* Status do pagamento */}
              <div className="mb-3">
                <p className="text-sm text-gray-600">Pagamento</p>
                <div className="flex items-center mt-1">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    orderData.paymentStatus === PaymentStatus.PAID ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className="font-medium">
                    {orderData.paymentStatus === PaymentStatus.PAID ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
              </div>
              
              {/* Status do processamento */}
              <div className="mb-3">
                <p className="text-sm text-gray-600">Processamento</p>
                <div className="flex items-center mt-1">
                  <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                  <span className="font-medium">Concluído</span>
                </div>
              </div>
              
              {/* Status da entrega */}
              <div>
                <p className="text-sm text-gray-600">Entrega</p>
                <div className="flex items-center mt-1">
                  <span className="inline-block w-3 h-3 rounded-full mr-2 bg-blue-500"></span>
                  <span className="font-medium">Em preparação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Resumo do pedido */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Itens do Pedido</h2>
          <div className="border rounded-md overflow-hidden">
            {/* Cabeçalho */}
            <div className="bg-gray-50 p-4 grid grid-cols-12 gap-2 font-medium text-gray-700 hidden md:grid">
              <div className="col-span-6">Produto</div>
              <div className="col-span-2 text-center">Preço</div>
              <div className="col-span-2 text-center">Qtd</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {/* Lista de itens */}
            {dataLoaded && Array.isArray(orderData.items) && orderData.items.length > 0 ? (
              <div className="divide-y">
                {orderData.items.map((item) => (
                  <div key={item.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-6">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-md overflow-hidden hidden md:block">
                          <img 
                            src={item.image || '/placeholder-product.jpg'} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-0 md:ml-4">
                          <h3 className="font-medium">{item.title}</h3>
                          {item.size && <p className="text-sm text-gray-500">Tamanho: {item.size.toUpperCase()}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 text-left md:text-center">
                      <span className="md:hidden text-gray-500 mr-2">Preço:</span>
                      <span>R$ {item.price.toFixed(2)}</span>
                    </div>
                    <div className="md:col-span-2 text-left md:text-center">
                      <span className="md:hidden text-gray-500 mr-2">Quantidade:</span>
                      <span>{item.quantity}</span>
                    </div>
                    <div className="md:col-span-2 text-left md:text-right font-medium">
                      <span className="md:hidden text-gray-500 mr-2">Total:</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {dataLoaded ? "Detalhes do pedido não disponíveis" : "Carregando detalhes do pedido..."}
              </div>
            )}
            
            {/* Totais */}
            <div className="bg-gray-50 p-4">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>R$ {orderData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Frete:</span>
                <span>Grátis</span>
              </div>
              <div className="flex justify-between py-2 font-bold">
                <span>Total:</span>
                <span>R$ {orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/shop" 
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-200 transition duration-300 text-center"
          >
            Continuar comprando
          </Link>
          <Link 
            to="/order-history" 
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition duration-300 text-center"
          >
            Ver Histórico de Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
