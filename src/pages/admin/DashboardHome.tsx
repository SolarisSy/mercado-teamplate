import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import customFetch from '../../axios/custom';
import { 
  HiOutlineShoppingBag, 
  HiOutlineUsers, 
  HiOutlineCash, 
  HiOutlineClipboardCheck,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineEye,
  HiOutlinePencilAlt
} from 'react-icons/hi';

// Componente de gráfico simplificado
const SimpleBarChart = ({ data, title }: { data: {label: string, value: number}[], title: string }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-secondaryBrown h-2 rounded-full" 
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    activeProducts: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<{label: string, value: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products
        const productsResponse = await customFetch.get('/products');
        const products = productsResponse.data;
        
        // Fetch orders
        const ordersResponse = await customFetch.get('/orders');
        const orders = ordersResponse.data;
        
        // Fetch users
        const usersResponse = await customFetch.get('/users');
        const users = usersResponse.data;
        
        // Calculate stats
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const totalUsers = users.length;
        const pendingOrders = orders.filter((order: any) => order.orderStatus === 'pending').length;
        const activeProducts = products.filter((product: any) => product.stock > 0).length;
        
        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum: number, order: { totalAmount: string }) => {
          return sum + (parseFloat(order.totalAmount) || 0);
        }, 0);
        
        // Get recent products (last 5)
        const sortedProducts = [...products].sort((a: Product, b: Product) => {
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        });
        
        // Get recent orders (last 5)
        const sortedOrders = [...orders].sort((a: any, b: any) => {
          return new Date(b.orderDate || '').getTime() - new Date(a.orderDate || '').getTime();
        });
        
        // Calculate category statistics
        const categoryCounts: Record<string, number> = {};
        products.forEach((product: any) => {
          if (product.category) {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
          }
        });
        
        const categoryStatsData = Object.entries(categoryCounts)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);
        
        setStats({
          totalProducts,
          totalOrders,
          totalRevenue,
          totalUsers,
          pendingOrders,
          activeProducts
        });
        
        setRecentProducts(sortedProducts.slice(0, 5));
        setRecentOrders(sortedOrders.slice(0, 5));
        setCategoryStats(categoryStatsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondaryBrown"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Visão Geral</h2>
        <Link 
          to="/"
          className="text-secondaryBrown hover:text-secondaryBrown hover:underline flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HiOutlineEye className="mr-1" />
          Ver Loja
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <HiOutlineShoppingBag className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total de Produtos</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold">{stats.totalProducts}</p>
                <span className="text-sm ml-2 text-green-500 flex items-center">
                  <HiOutlineArrowUp className="mr-1" />
                  {Math.round(stats.activeProducts / stats.totalProducts * 100)}% ativos
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <HiOutlineClipboardCheck className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total de Pedidos</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold">{stats.totalOrders}</p>
                {stats.pendingOrders > 0 && (
                  <span className="text-sm ml-2 text-yellow-500 flex items-center">
                    {stats.pendingOrders} pendentes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <HiOutlineCash className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Receita Total</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                <span className="text-sm ml-2 text-green-500 flex items-center">
                  <HiOutlineArrowUp className="mr-1" />
                  {stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : 0} ticket médio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Stats */}
        <div className="lg:col-span-1">
          <SimpleBarChart 
            data={categoryStats} 
            title="Produtos por Categoria" 
          />
        </div>
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Pedidos Recentes</h3>
            <Link 
              to="/admin/orders" 
              className="text-secondaryBrown hover:underline text-sm flex items-center"
            >
              Ver Todos
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.email || order.data?.email || 'Cliente não identificado'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(parseFloat(order.totalAmount || '0'))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus === 'completed' ? 'Concluído' : 
                         order.orderStatus === 'pending' ? 'Pendente' : 
                         order.orderStatus === 'cancelled' ? 'Cancelado' : order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Produtos Recentes</h3>
          <Link 
            to="/admin/products" 
            className="text-secondaryBrown hover:underline text-sm flex items-center"
          >
            Ver Todos
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden transition transform hover:shadow-md">
              <div className="h-40 overflow-hidden bg-gray-200">
                <img 
                  src={product.images && product.images.length > 0 
                    ? (product.images.find(img => img.isPrimary)?.url || product.images[0]?.url) 
                    : product.image} 
                  alt={product.title} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.svg';
                  }}
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium truncate">{product.title}</h4>
                <p className="text-gray-500 text-sm">{product.category}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-secondaryBrown">{formatCurrency(product.price)}</span>
                  <Link to={`/admin/products/edit/${product.id}`} className="text-gray-500 hover:text-secondaryBrown">
                    <HiOutlinePencilAlt />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {recentProducts.length === 0 && (
            <div className="col-span-4 py-8 text-center text-gray-500">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 