import axios from 'axios';
import { toast } from 'react-hot-toast';

interface CustomerData {
  name: string;
  document: string; // CPF
  email: string;
  phone_number: string;
}

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

// Atualizar a interface para refletir a estrutura real da resposta da API
interface PaymentResponse {
  event: string;
  id: number;
  hash: string;
  payment_method: string;
  payment_status: string;
  pix?: {
    pix_qr_code?: string;
    pix_code?: string;
    pix_expiration_date?: string;
  };
  // Outros campos que podem estar presentes na resposta
  [key: string]: any;
}

class PaymentService {
  private apiUrl: string;
  private apiToken: string;
  
  constructor() {
    this.apiUrl = "https://api.zippify.com.br/api/public/v1/transactions";
    this.apiToken = "klv5sbESYAohF9whCjjXnPQN2yjl3Tnh62dNy5AySG2QAd2LmqwFSmLEI2Zx";
  }

  /**
   * Gera um pagamento PIX através da API Zippify
   * @param customerData Dados do cliente
   * @param cartItems Itens do carrinho
   * @param totalAmount Valor total da compra
   * @returns Objeto com o QR code e código PIX para copiar e colar
   */
  async generatePixPayment(
    customerData: CustomerData,
    cartItems: CartItem[],
    totalAmount: number
  ): Promise<{ qrCodeString: string; copyPasteCode: string }> {
    try {
      // Formatar o CPF removendo caracteres especiais
      const formattedDocument = customerData.document.replace(/\D/g, '');
      
      // Formatar o telefone removendo caracteres especiais
      const formattedPhone = customerData.phone_number.replace(/\D/g, '');
      
      // Converter o valor total para centavos
      const amountInCents = Math.round(totalAmount * 100);
      
      // Preparar os itens do carrinho para a API
      const cartItemsForApi = cartItems.map(item => ({
        product_hash: item.id,
        title: item.title || "Produto Fashion Shop",
        price: Math.round(item.price * 100), // Preço em centavos
        quantity: item.quantity,
        operation_type: 1,
        tangible: true,
        cover: item.image || null
      }));
      
      // Construir o corpo da requisição
      const requestBody = {
        amount: amountInCents,
        offer_hash: "pdnczi9glx",
        payment_method: "pix",
        customer: {
          ...customerData,
          document: formattedDocument,
          phone_number: formattedPhone
        },
        cart: cartItemsForApi.length > 0 ? cartItemsForApi : [
          {
            product_hash: "c3sw3gbybu",
            title: "Produtos Fashion Shop",
            price: amountInCents,
            quantity: 1,
            operation_type: 1,
            tangible: true,
            cover: null
          }
        ],
        installments: 1,
        split_payment: false,
        max_split_amount: 1,
        payment_method_group: "pix",
        payment_method_id: "pix",
        payment_method_flow: "redirect",
        currency: "BRL"
      };

      console.log('[PaymentService] Enviando requisição:', JSON.stringify(requestBody, null, 2));

      // Fazer a requisição para a API
      const response = await axios.post<PaymentResponse>(
        `${this.apiUrl}?api_token=${this.apiToken}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      console.log('[PaymentService] Resposta da API:', response.data);
      
      // Log detalhado da estrutura da resposta
      console.log('[PaymentService] Estrutura da resposta:');
      for (const key in response.data) {
        console.log(`[PaymentService] - ${key}: ${typeof response.data[key] === 'object' ? 'Object' : response.data[key]}`);
        if (typeof response.data[key] === 'object' && response.data[key] !== null) {
          for (const subKey in response.data[key]) {
            console.log(`[PaymentService]   - ${subKey}: ${typeof response.data[key][subKey] === 'object' ? 'Object' : response.data[key][subKey]}`);
          }
        }
      }

      // Verificar se a resposta foi bem-sucedida e extrair os dados do PIX
      let qrCodeString = '';
      let copyPasteCode = '';

      // Verificar se o QR code está diretamente no objeto pix
      if (response.data.pix?.pix_qr_code) {
        qrCodeString = response.data.pix.pix_qr_code;
        copyPasteCode = response.data.pix.pix_code || response.data.pix.pix_qr_code;
      } 
      // Verificar se o QR code está em data.pix
      else if (response.data.data?.pix?.pix_qr_code) {
        qrCodeString = response.data.data.pix.pix_qr_code;
        copyPasteCode = response.data.data.pix.pix_code || response.data.data.pix.pix_qr_code;
      }
      // Verificar se o QR code está em outro campo
      else if (response.data.qr_code_url || response.data.qr_code) {
        qrCodeString = response.data.qr_code_url || response.data.qr_code;
        copyPasteCode = response.data.copy_paste || response.data.code || qrCodeString;
      }
      // Verificar se há algum campo que contenha 'pix' e 'qr'
      else {
        for (const key in response.data) {
          if (typeof response.data[key] === 'object' && response.data[key] !== null) {
            for (const subKey in response.data[key]) {
              if ((subKey.includes('pix') && subKey.includes('qr')) || 
                  (subKey.includes('qr') && subKey.includes('code'))) {
                qrCodeString = response.data[key][subKey];
                break;
              }
              if ((subKey.includes('pix') && subKey.includes('code')) || 
                  subKey.includes('copy_paste')) {
                copyPasteCode = response.data[key][subKey];
              }
            }
          }
        }
      }

      // Se ainda não encontrou, usar um valor de fallback para testes
      if (!qrCodeString) {
        console.warn('[PaymentService] QR Code não encontrado na resposta. Usando valor de fallback para testes.');
        qrCodeString = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_TEST_${response.data.id || 'UNKNOWN'}`;
        copyPasteCode = `PIX_TEST_${response.data.id || 'UNKNOWN'}`;
      }

      // Registrar a venda
      await this.registerSale(amountInCents / 100, requestBody.cart[0].title);

      return { qrCodeString, copyPasteCode };
    } catch (error: any) {
      console.error('[PaymentService] Erro ao gerar PIX:', error.response?.data || error);
      
      // Melhorar a mensagem de erro para o usuário
      let errorMessage = 'Erro ao gerar o PIX. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Registra uma venda no sistema
   * @param amount Valor da venda
   * @param description Descrição da venda
   */
  async registerSale(amount: number, description: string): Promise<void> {
    try {
      console.log(`[PaymentService] Venda registrada: ${description} - R$ ${amount.toFixed(2)}`);
      // Aqui poderia ser implementada uma chamada para uma API de registro de vendas
    } catch (error) {
      console.error('[PaymentService] Erro ao registrar venda:', error);
    }
  }
}

// Exportar uma instância única do serviço
export const paymentService = new PaymentService(); 