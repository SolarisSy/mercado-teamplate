import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { paymentService } from '../services/paymentService';

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

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount
}) => {
  const [step, setStep] = useState<'personal-data' | 'payment'>('personal-data');
  const [isLoading, setIsLoading] = useState(false);
  const [pixCode, setPixCode] = useState<string>('');
  const [qrCodeString, setQrCodeString] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Dados do formulário
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
  });

  // Fechar o modal quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
      // Preparar dados do cliente
      const customerData = {
        name: formData.fullName,
        document: formData.cpf.replace(/[^\d]/g, ''),
        email: formData.email,
        phone_number: formData.phone.replace(/[^\d]/g, '')
      };

      // Gerar PIX
      const pixData = await paymentService.generatePixPayment(
        customerData,
        cartItems,
        totalAmount
      );

      // Atualizar estado com os dados do PIX
      setQrCodeString(pixData.qrCodeString);
      setPixCode(pixData.copyPasteCode);
      
      // Avançar para a etapa de pagamento
      setStep('payment');
      
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

  // Confirmar pagamento
  const handleConfirmPayment = async () => {
    setIsLoading(true);
    
    try {
      // Simular verificação do pagamento
      toast.success('Verificando pagamento...');
      
      // Simular um atraso para verificação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Registrar a venda
      await paymentService.registerSale(totalAmount, 'Compra Fashion Shop');
      
      toast.success('Pagamento confirmado com sucesso!');
      
      // Fechar o modal e redirecionar
      onClose();
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao confirmar pagamento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-secondaryBrown text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {step === 'personal-data' ? 'Dados Pessoais' : 'Pagamento PIX'}
          </h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between mb-2">
                    <span className="text-sm">
                      {item.title} x{item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
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
                className="w-full bg-secondaryBrown text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Gerando PIX...' : 'Gerar PIX Seguro'}
              </button>
            </div>
          )}

          {/* Etapa de Pagamento PIX */}
          {step === 'payment' && (
            <div className="text-center">
              <p className="mb-4">
                Escaneie o QR Code abaixo com o aplicativo do seu banco ou copie o código PIX
              </p>
              
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
                onClick={handleConfirmPayment}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
              
              <p className="mt-2 text-sm text-gray-600">
                Após realizar o pagamento, clique em "Confirmar Pagamento"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 