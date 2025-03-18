import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import customFetch from '../../axios/custom';
import { HiOutlineShoppingBag, HiOutlineUsers, HiOutlineCash } from 'react-icons/hi';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
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
        
        // Calculate stats
        const totalProducts = products.length;
        const totalOrders = orders.length;
        
        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum: number, order: { totalAmount: string }) => {
          return sum + (parseFloat(order.totalAmount) || 0);
        }, 0);
        
        // Get recent products (last 5)
        const sortedProducts = [...products].sort((a: Product, b: Product) => {
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        });
        
        setStats({
          totalProducts,
          totalOrders,
          totalRevenue
        });
        
        setRecentProducts(sortedProducts.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <HiOutlineShoppingBag className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <HiOutlineUsers className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <HiOutlineCash className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Products</h3>
          <Link 
            to="/admin/products" 
            className="text-secondaryBrown hover:underline"
          >
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img 
                          src={product.images && product.images.length > 0 
                            ? (product.images.find(img => img.isPrimary)?.url || product.images[0]?.url) 
                            : product.image} 
                          alt={product.title} 
                          className="h-10 w-10 object-cover rounded-md"
                          onError={(e) => {
                            console.error("Error loading dashboard image:", e.currentTarget.src);
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${product.price}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
                </tr>
              ))}
              
              {recentProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 