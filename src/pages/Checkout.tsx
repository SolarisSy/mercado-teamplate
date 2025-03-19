import { HiTrash as TrashIcon } from "react-icons/hi2";
import { Button } from "../components";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearCart } from "../features/cart/cartSlice";
import customFetch from "../axios/custom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const paymentMethods = [
  { id: "credit-card", title: "Cartão de Crédito" },
  { id: "debit-card", title: "Cartão de Débito" },
  { id: "pix", title: "PIX" },
  { id: "boleto", title: "Boleto Bancário" },
];

const Checkout = () => {
  // Usar o selector com verificação explícita
  const cart = useAppSelector((state) => state?.cart);
  // Garantir que cartItems seja sempre um array
  const cartItems = Array.isArray(cart?.cartItems) ? cart.cartItems : [];
  const totalAmount = cart?.totalAmount || 0;
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Verificar se o carrinho tem produtos
  const hasItems = cartItems.length > 0;

  // Verificar se o carrinho está vazio ao carregar o componente
  useEffect(() => {
    if (!hasItems) {
      toast.error("Seu carrinho está vazio");
      navigate("/shop");
    }
  }, [hasItems, navigate]);

  const steps = [
    { id: 1, name: 'Informações de Contato' },
    { id: 2, name: 'Endereço de Entrega' },
    { id: 3, name: 'Pagamento' }
  ];

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!hasItems) {
      toast.error("Seu carrinho está vazio");
      navigate("/shop");
      return;
    }
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      const checkoutData = {
        data,
        products: cartItems,
        subtotal: totalAmount,
        paymentMethod: paymentMethod
      };

      // Validar campos obrigatórios
      if (!data.firstName || !data.lastName || !data.emailAddress || !data.phone) {
        toast.error("Por favor, preencha todos os campos de contato");
        setCurrentStep(1);
        return;
      }

      if (!data.address || !data.city || !data.postalCode) {
        toast.error("Por favor, preencha todos os campos de endereço");
        setCurrentStep(2);
        return;
      }

      // Criar pedido
      let response;
      const userStorage = localStorage.getItem("user");
      const user = userStorage ? JSON.parse(userStorage) : null;
      
      if (user && user.email) {
        response = await customFetch.post("/orders", {
          ...checkoutData,
          user: {
            email: user.email,
            id: user.id,
          },
          orderStatus: "Processing",
          orderDate: new Date().toISOString(),
        });
      } else {
        response = await customFetch.post("/orders", {
          ...checkoutData,
          orderStatus: "Processing",
          orderDate: new Date().toISOString(),
        });
      }

      if (response.status === 201) {
        toast.success("Pedido realizado com sucesso!");
        // Limpar o carrinho é feito na página de confirmação
        navigate("/order-confirmation");
      } else {
        toast.error("Ocorreu um erro. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao processar o pedido:", error);
      toast.error("Ocorreu um erro. Por favor, tente novamente.");
    }
  };
  
  if (!hasItems) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-16">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
          <p className="mb-6">Adicione produtos ao seu carrinho antes de finalizar a compra.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary transition"
          >
            Voltar às compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Finalizar Compra</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step.id 
                  ? 'bg-primary text-white' 
                  : currentStep > step.id 
                  ? 'bg-primary bg-opacity-80 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <span className="ml-2 text-sm hidden sm:block">{step.name}</span>
              {step.id !== steps.length && (
                <div className="w-12 h-1 mx-2 bg-gray-200">
                  <div className={`h-full ${currentStep > step.id ? 'bg-primary' : 'bg-gray-200'}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="space-y-8">
        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shipping Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Endereço de Entrega</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">Complemento</label>
                <input
                  type="text"
                  id="apartment"
                  name="apartment"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">CEP</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Método de Pagamento</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Escolha um método de pagamento abaixo:</p>
              
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center mb-2">
                  <input
                    id={method.id}
                    name="paymentMethod"
                    type="radio"
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    required
                  />
                  <label htmlFor={method.id} className="ml-3 block text-sm font-medium text-gray-700">
                    {method.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
          <div className="space-y-2 mb-4">
            <div className="max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div className="flex items-center">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {(item.price * (item.quantity || 1)).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-2 font-medium">
              <span>Subtotal</span>
              <span>
                {totalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                {totalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2">
              Concordo com os{" "}
              <a href="/terms" className="text-primary hover:underline">
                Termos e Condições
              </a>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Voltar
              </button>
            )}
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-dark focus:outline-none"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-secondary focus:outline-none"
              >
                Finalizar Compra
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-col items-start">
        <button
          onClick={() => {
            dispatch(clearCart());
            toast.success("Carrinho esvaziado");
            navigate("/shop");
          }}
          className="flex items-center text-secondary hover:text-red-700"
        >
          <TrashIcon className="h-5 w-5 mr-1" />
          <span>Esvaziar carrinho</span>
        </button>
      </div>
    </div>
  );
};

export default Checkout;
