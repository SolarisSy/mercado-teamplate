import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import customFetch from "../axios/custom";
import { nanoid } from "nanoid";
import { formatDate } from "../utils/formatDate";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const { id } = params;
    const response = await customFetch(`orders/${id}`);
    return response.data || {};
  } catch (error) {
    console.error("Error fetching order:", error);
    return {};
  }
};

const SingleOrderHistory = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const navigate = useNavigate();
  const singleOrderData = useLoaderData();
  const singleOrder = singleOrderData || {};
  const products = Array.isArray(singleOrder.products) ? singleOrder.products : [];

  useEffect(() => {
    if (!user?.id) {
      toast.error("Please login to view this page");
      navigate("/login");
    }
  }, [user, navigate]);

  if (!singleOrder.id) {
    return (
      <div className="max-w-screen-2xl mx-auto pt-20 px-5">
        <h1 className="text-3xl font-bold mb-8">Detalhes do Pedido</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg mb-4">Pedido não encontrado.</p>
          <button 
            onClick={() => navigate('/order-history')}
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Voltar para Histórico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto pt-20 px-5">
      <h1 className="text-3xl font-bold mb-8">Detalhes do Pedido</h1>
      <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Pedido: #{singleOrder.id}
        </h2>
        <p className="mb-2">Data: {formatDate(singleOrder.orderDate || '')}</p>
        <p className="mb-2">Subtotal: R$ {singleOrder.subtotal?.toFixed(2) || '0.00'}</p>
        <p className="mb-2">Frete: R$ 5.00</p>
        <p className="mb-2">Impostos: R$ {(singleOrder.subtotal / 5)?.toFixed(2) || '0.00'}</p>
        <p className="mb-2 font-bold">
          Total: R$ {((singleOrder.subtotal || 0) + 5 + (singleOrder.subtotal || 0) / 5).toFixed(2)}
        </p>
        <p className="mb-2">Status: {singleOrder.orderStatus === 'Processing' ? 'Em processamento' : singleOrder.orderStatus}</p>
        
        <h3 className="text-xl font-semibold mt-6 mb-4">Itens</h3>
        
        {products.length === 0 ? (
          <p>Nenhum item encontrado no pedido.</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b">Produto</th>
                <th className="py-3 px-4 border-b">Quantidade</th>
                <th className="py-3 px-4 border-b">Preço</th>
                <th className="py-3 px-4 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={nanoid()}>
                  <td className="py-3 px-4 border-b">{product?.title || 'Produto não identificado'}</td>
                  <td className="py-3 px-4 border-b text-center">
                    {product?.quantity || 0}
                  </td>
                  <td className="py-3 px-4 border-b text-right">
                    R$ {product?.price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-3 px-4 border-b text-right">
                    R$ {((product?.price || 0) * (product?.quantity || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="mt-6">
          <button 
            onClick={() => navigate('/order-history')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Voltar para Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleOrderHistory;
