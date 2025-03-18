import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import customFetch from "../axios/custom";
import { formatDate } from "../utils/formatDate";

export const loader = async () => {
  try {
    const response = await customFetch.get("/orders");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};

const OrderHistory = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const ordersData = useLoaderData();
  const orders = Array.isArray(ordersData) ? ordersData : [];
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      toast.error("Please login to view this page");
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="max-w-screen-2xl mx-auto pt-20 px-5">
      <h1 className="text-3xl font-bold mb-8">Histórico de Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg mb-4">Você ainda não tem pedidos.</p>
          <Link 
            to="/shop" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Voltar às compras
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b">ID do Pedido</th>
                <th className="py-3 px-4 border-b">Data</th>
                <th className="py-3 px-4 border-b">Total</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(order => order?.user && order.user.id === user.id)
                .map((order) => (
                <tr key={order.id}>
                  <td className="py-3 px-4 border-b text-center">{order.id}</td>
                  <td className="py-3 px-4 border-b text-center">{formatDate(order.orderDate)}</td>
                  <td className="py-3 px-4 border-b text-center">
                    R$ {(order.subtotal + 5 + (order.subtotal / 5)).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    {order.orderStatus === 'Processing' ? 'Em processamento' : order.orderStatus}
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <Link
                      to={`/order-history/${order.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
