import { HiTrash as TrashIcon } from "react-icons/hi2";
import { Button } from "../components";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearCart } from "../features/cart/cartSlice";
import customFetch from "../axios/custom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import pixelService from "../services/pixelService";

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
    } else {
      // Rastrear evento de início de checkout
      const checkoutProducts = cartItems.map(item => ({
        id: item.id,
        name: item.title,
        category: item.category,
        price: item.price,
        quantity: item.quantity
      }));
      
      pixelService.trackInitiateCheckout({
        products: checkoutProducts,
        value: totalAmount
      });
    }
  }, [hasItems, navigate, cartItems, totalAmount]);

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
        // Rastrear evento de compra finalizada
        const purchaseProducts = cartItems.map(item => ({
          id: item.id,
          name: item.title,
          category: item.category,
          price: item.price,
          quantity: item.quantity
        }));
        
        pixelService.trackPurchase({
          products: purchaseProducts,
          value: totalAmount
        });
        
        // Salvar informações para a página de confirmação
        localStorage.setItem('orderItems', JSON.stringify(cartItems));
        localStorage.setItem('orderTotal', totalAmount.toString());
        localStorage.setItem('orderNumber', `PED-${Date.now().toString().substring(7)}`);
        
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
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
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
                  ? 'bg-green-600 text-white' 
                  : currentStep > step.id 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <span className="ml-2 text-sm hidden sm:block">{step.name}</span>
              {step.id !== steps.length && (
                <div className="w-12 h-1 mx-2 bg-gray-200">
                  <div className={`h-full ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Sobrenome</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <div>
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">Complemento</label>
                <input
                  type="text"
                  id="apartment"
                  name="apartment"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">CEP</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    placeholder="00000-000"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione a forma de pagamento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="relative">
                    <input
                      type="radio"
                      id={method.id}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={method.id}
                      className={`cursor-pointer block border rounded-md p-4 ${
                        paymentMethod === method.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <span className="flex items-center">
                        <span className={`w-5 h-5 mr-2 rounded-full border ${
                          paymentMethod === method.id
                            ? 'border-green-600'
                            : 'border-gray-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <span className="block w-3 h-3 m-1 rounded-full bg-green-600"></span>
                          )}
                        </span>
                        <span className="text-sm font-medium">{method.title}</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Campos específicos para cartão de crédito */}
            {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">Nome no Cartão</label>
                  <input
                    type="text"
                    id="nameOnCard"
                    name="nameOnCard"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Número do Cartão</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    pattern="[0-9]*"
                    maxLength={16}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Data de Validade</label>
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      placeholder="MM/AA"
                      pattern="[0-9]{2}/[0-9]{2}"
                      maxLength={5}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      pattern="[0-9]*"
                      maxLength={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Informações PIX */}
            {paymentMethod === 'pix' && (
              <div className="p-4 border rounded-md bg-gray-50">
                <p className="text-gray-700 mb-2">
                  Ao finalizar a compra, você receberá um QR Code para pagamento via PIX.
                </p>
                <p className="text-sm text-gray-500">
                  O pagamento deve ser realizado em até 30 minutos, ou seu pedido será cancelado.
                </p>
              </div>
            )}
            
            {/* Boleto */}
            {paymentMethod === 'boleto' && (
              <div className="p-4 border rounded-md bg-gray-50">
                <p className="text-gray-700 mb-2">
                  Ao finalizar a compra, você poderá imprimir seu boleto bancário.
                </p>
                <p className="text-sm text-gray-500">
                  O pedido será processado após a confirmação do pagamento (1-3 dias úteis).
                </p>
              </div>
            )}
            
            {/* Resumo do pedido */}
            <div className="mt-8 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium text-lg mb-3">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>Grátis</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-300"
            >
              Voltar
            </button>
          )}
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="ml-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
            >
              Continuar
            </button>
          ) : (
            <button
              type="submit"
              className="ml-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
            >
              Finalizar Pedido
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Checkout;
