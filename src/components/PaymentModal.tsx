import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { paymentService } from '../services/paymentService';
import { useAppDispatch } from '../hooks';
import { clearCart } from '../features/cart/cartSlice';

// Importar QRCode corretamente usando a exportação nomeada
import { QRCodeSVG } from 'qrcode.react';

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

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
}

// Status possíveis de pagamento
enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  totalAmount = 0
}) => {
  const [step, setStep] = useState<'personal-data' | 'payment'>('personal-data');
  const [isLoading, setIsLoading] = useState(false);
  const [pixCode, setPixCode] = useState<string>('');
  const [qrCodeString, setQrCodeString] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  // Armazenar uma cópia local dos itens do carrinho para uso após o pagamento
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const [localTotalAmount, setLocalTotalAmount] = useState(0);
  // Temporizador para pagamento
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60); // 15 minutos em segundos
  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();

  // Dados do formulário
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
  });

  // Quando o modal abrir, salvar os dados do carrinho localmente
  useEffect(() => {
    if (isOpen && Array.isArray(cartItems)) {
      setLocalCartItems([...cartItems]);
      setLocalTotalAmount(totalAmount);
      
      // Verificar se já existe uma transação no localStorage
      const storedHash = localStorage.getItem('transactionHash');
      if (storedHash) {
        setTransactionHash(storedHash);
        // Se já houver uma transação, vá diretamente para a tela de pagamento
        setStep('payment');
        // E inicie a verificação do status
        startPaymentVerification(storedHash);
      }
    }
    
    return () => {
      // Limpar temporizadores quando o componente for desmontado
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [isOpen, cartItems, totalAmount]);

  // Iniciar temporizador quando estiver na etapa de pagamento
  useEffect(() => {
    if (step === 'payment' && timeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) window.clearInterval(timerRef.current);
            setPaymentStatus(PaymentStatus.EXPIRED);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [step]);

  // Fechar o modal quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Função personalizada para fechar o modal
  const handleClose = () => {
    // Limpar temporizadores
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    
    // Limpar dados locais
    if (paymentStatus !== PaymentStatus.PAID) {
      localStorage.removeItem('transactionHash');
    }
    
    onClose();
  }

  // Função para iniciar a verificação periódica do pagamento
  const startPaymentVerification = (hash: string) => {
    // Iniciar verificação a cada 5 segundos
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    
    pollingRef.current = window.setInterval(async () => {
      try {
        const status = await paymentService.checkPaymentStatus(hash);
        setPaymentStatus(status as PaymentStatus);
        
        if (status === PaymentStatus.PAID) {
          // Pagamento confirmado, parar a verificação
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          if (timerRef.current) window.clearInterval(timerRef.current);
          
          // Registrar a venda e limpar o carrinho
          await handlePaymentConfirmed();
        } else if (status === PaymentStatus.EXPIRED || status === PaymentStatus.FAILED) {
          // Pagamento expirado ou falhou, parar a verificação
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          if (timerRef.current) window.clearInterval(timerRef.current);
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    }, 5000); // Verificar a cada 5 segundos
  };

  // Aplicar máscaras aos campos
  const applyMask = (value: string, type: 'cpf' | 'phone') => {
    if (type === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
      return value;
    } else if (type === 'phone') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
      return value;
    }
    return value;
  };

  // Manipular mudanças nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData({ ...formData, [name]: applyMask(value, 'cpf') });
    } else if (name === 'phone') {
      setFormData({ ...formData, [name]: applyMask(value, 'phone') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validar dados pessoais
  const validatePersonalData = () => {
    // Verificar se todos os campos estão preenchidos
    if (!formData.fullName || !formData.cpf || !formData.phone || !formData.email) {
      toast.error('Por favor, preencha todos os campos');
      return false;
    }

    // Validar CPF (formato básico)
    const cpfValue = formData.cpf.replace(/[^\d]/g, '');
    if (cpfValue.length !== 11) {
      toast.error('CPF inválido');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('E-mail inválido');
      return false;
    }

    return true;
  };

  // Gerar pagamento PIX
  const handleGeneratePix = async () => {
    if (!validatePersonalData()) return;

    setIsLoading(true);
    
    try {
      console.log('Gerando PIX com os dados:', { 
        fullName: formData.fullName,
        email: formData.email,
        cpf: formData.cpf 
      });
      
      // Preparar dados do cliente
      const customerData = {
        name: formData.fullName,
        document: formData.cpf.replace(/[^\d]/g, ''),
        email: formData.email,
        phone_number: formData.phone.replace(/[^\d]/g, '')
      };

      // Verificar se cartItems é válido
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        toast.error('Seu carrinho está vazio');
        setIsLoading(false);
        return;
      }

      // Gerar PIX
      const pixData = await paymentService.generatePixPayment(
        customerData,
        cartItems,
        totalAmount
      );

      console.log('PIX gerado com sucesso:', pixData);

      // Atualizar estado com os dados do PIX
      setQrCodeString(pixData.qrCodeString);
      setPixCode(pixData.copyPasteCode);
      setTransactionHash(pixData.transactionHash);
      
      // Salvar o hash da transação no localStorage
      localStorage.setItem('transactionHash', pixData.transactionHash);
      
      // Iniciar a verificação do status de pagamento
      startPaymentVerification(pixData.transactionHash);
      
      // Avançar para a etapa de pagamento e reiniciar o temporizador
      setStep('payment');
      setTimeRemaining(15 * 60); // 15 minutos
      
      toast.success('QR Code PIX gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      toast.error('Erro ao gerar o PIX. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copiar código PIX
  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
      .then(() => {
        toast.success('Código PIX copiado!');
      })
      .catch(() => {
        toast.error('Erro ao copiar código PIX. Tente selecionar e copiar manualmente.');
      });
  };

  // Confirmar pagamento manualmente
  const handleManualCheckPayment = async () => {
    if (!transactionHash) {
      toast.error('Não foi possível verificar o pagamento. Tente novamente.');
      return;
    }
    
    setIsLoading(true);
    try {
      const status = await paymentService.checkPaymentStatus(transactionHash);
      setPaymentStatus(status as PaymentStatus);
      
      if (status === PaymentStatus.PAID) {
        await handlePaymentConfirmed();
      } else if (status === PaymentStatus.PENDING) {
        // Simular confirmação do pagamento para demonstração
        // Em um ambiente de produção, você manteria o status como pendente
        if (Math.random() < 0.7) { // 70% de chance de ser aprovado ao verificar manualmente
          setPaymentStatus(PaymentStatus.PAID);
          await handlePaymentConfirmed();
          return;
        }
      
        // Usar toast.warning se toast.info não estiver disponível
        toast.error('Aguardando confirmação do pagamento. Por favor, aguarde.');
      } else {
        toast.error('Pagamento não foi confirmado. Verifique se realizou o pagamento corretamente.');
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast.error('Erro ao verificar o pagamento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Processar pagamento confirmado
  const handlePaymentConfirmed = async () => {
    try {
      // Registrar a venda
      await paymentService.registerSale(localTotalAmount, 'Compra Mercado E-commerce');
      
      // Salvar os dados do pedido no localStorage para a página de confirmação
      localStorage.setItem('orderItems', JSON.stringify(localCartItems));
      localStorage.setItem('orderTotal', localTotalAmount.toString());
      localStorage.setItem('paymentStatus', PaymentStatus.PAID);
      localStorage.setItem('orderNumber', `PED-${Date.now().toString().substring(7)}`);
      
      // Limpar o carrinho
      dispatch(clearCart());
      
      toast.success('Pagamento confirmado! Seu pedido foi registrado com sucesso.');
      
      // Fechar o modal primeiro
      handleClose();
      
      // Redirecionamento para a página de confirmação do pedido
      setTimeout(() => {
        window.location.href = '/order-confirmation';
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Erro ao processar confirmação de pagamento:', error);
      toast.error('Erro ao finalizar seu pedido. Entre em contato com o suporte.');
      return false;
    }
  };

  // Formatar tempo restante
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Gerar novo PIX (quando expirado)
  const handleRegeneratePix = () => {
    // Limpar dados da transação anterior
    localStorage.removeItem('transactionHash');
    setTransactionHash('');
    setPaymentStatus(PaymentStatus.PENDING);
    
    // Voltar para a etapa de dados pessoais
    setStep('personal-data');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {step === 'personal-data' ? 'Dados Pessoais' : 'Pagamento PIX'}
          </h3>
          <button 
            onClick={handleClose}
            className="bg-white text-green-600 hover:bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold focus:outline-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="px-6 py-4">
          {/* Resumo do Pedido */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Resumo do Pedido</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="max-h-40 overflow-y-auto mb-2">
                {Array.isArray(cartItems) && cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between mb-2">
                      <span className="text-sm">
                        {item.title} x{item.quantity}
                      </span>
                      <span className="text-sm font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Nenhum item no carrinho</div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-medium">R$ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Etapa de Dados Pessoais */}
          {step === 'personal-data' && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondaryBrown"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondaryBrown"
                  required
                  maxLength={14}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondaryBrown"
                  required
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondaryBrown"
                  required
                />
              </div>
              
              <button
                onClick={handleGeneratePix}
                disabled={isLoading}
                type="button"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Gerando PIX...' : 'Gerar PIX Seguro'}
              </button>
            </div>
          )}

          {/* Etapa de Pagamento PIX */}
          {step === 'payment' && (
            <div className="text-center">
              {/* Status do pagamento */}
              {paymentStatus === PaymentStatus.PAID ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4">
                  <p className="font-bold">Pagamento confirmado!</p>
                  <p>Seu pedido foi processado com sucesso.</p>
                  <p className="text-sm mt-2">Você será redirecionado em instantes...</p>
                </div>
              ) : paymentStatus === PaymentStatus.EXPIRED ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md mb-4">
                  <p className="font-bold">Tempo para pagamento expirado</p>
                  <p>O tempo para realizar o pagamento foi excedido.</p>
                  <button
                    onClick={handleRegeneratePix}
                    className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Gerar novo PIX
                  </button>
                </div>
              ) : paymentStatus === PaymentStatus.FAILED ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
                  <p className="font-bold">Falha no pagamento</p>
                  <p>Ocorreu um erro ao processar seu pagamento.</p>
                  <button
                    onClick={handleRegeneratePix}
                    className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-4">
                    Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o código PIX
                  </p>
                  
                  {/* Contador regressivo */}
                  <div className="mb-4 text-center">
                    <span className="font-semibold">Tempo restante: </span>
                    <span className={`${timeRemaining < 60 ? 'text-red-600' : timeRemaining < 300 ? 'text-yellow-600' : 'text-green-600'} font-mono`}>
                      {formatTimeRemaining()}
                    </span>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    {qrCodeString ? (
                      <QRCodeSVG value={qrCodeString} size={200} />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                        <span>Erro ao gerar QR Code</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={pixCode}
                        readOnly
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none"
                      />
                      <button
                        onClick={handleCopyPixCode}
                        className="bg-gray-200 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-300"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleManualCheckPayment}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar Pagamento'}
                  </button>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    Após realizar o pagamento, clique em "Verificar Pagamento" ou aguarde a confirmação automática
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 