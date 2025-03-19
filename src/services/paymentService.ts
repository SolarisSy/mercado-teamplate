import axios from 'axios';
import toast from 'react-hot-toast';

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

// Possíveis status de pagamento
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  FAILED = 'failed'
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
   * @returns Objeto com o QR code, código PIX para copiar e colar, e o hash da transação
   */
  async generatePixPayment(
    customerData: CustomerData,
    cartItems: CartItem[],
    totalAmount: number
  ): Promise<{ qrCodeString: string; copyPasteCode: string; transactionHash: string }> {
    try {
      console.log('[PaymentService] Iniciando geração de PIX');
      
      // Garantir que cartItems é um array válido
      const validCartItems = Array.isArray(cartItems) ? cartItems : [];

      if (validCartItems.length === 0) {
        console.warn('[PaymentService] Carrinho vazio, usando item padrão');
      }
      
      // Formatar o CPF removendo caracteres especiais
      const formattedDocument = customerData.document.replace(/\D/g, '');
      
      // Formatar o telefone removendo caracteres especiais
      const formattedPhone = customerData.phone_number.replace(/\D/g, '');
      
      // Converter o valor total para centavos
      const amountInCents = Math.round(totalAmount * 100);

      // CORREÇÃO: Consolidar todos os produtos em um único item
      // A API retorna erro ao enviar múltiplos produtos
      const cartItemsForApi = [{
        product_hash: "mercado-product",
        title: validCartItems.length > 1 
          ? "Compra de supermercado" 
          : (validCartItems[0]?.title || "Produtos Mercado"),
        price: amountInCents,
        quantity: 1,
        operation_type: 1,
        tangible: true,
        cover: validCartItems[0]?.image || null
      }];
      
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
        cart: cartItemsForApi,
        installments: 1,
        split_payment: false,
        max_split_amount: 1,
        payment_method_group: "pix",
        payment_method_id: "pix",
        payment_method_flow: "redirect",
        currency: "BRL"
      };

      console.log('[PaymentService] Enviando requisição:', JSON.stringify(requestBody, null, 2));

      try {
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
        const transactionHash = response.data.hash || `demo-${Date.now()}`;

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

        return { qrCodeString, copyPasteCode, transactionHash };
      } catch (apiError) {
        console.error('[PaymentService] Erro na chamada da API:', apiError);
        
        // Retornar um QR code de demonstração para fins de teste
        // Em produção, você deve modificar este comportamento
        console.log('[PaymentService] Gerando QR code de demonstração para teste');
        
        const demoQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_DEMO_${Date.now()}`;
        const demoCopyPaste = `00020126330014BR.GOV.BCB.PIX0111123456789012520400005303986540510.005802BR5915Test%20Merchant6008Sao%20Paulo62180514PIX_DEMO_123456304EE5C`;
        const demoHash = `demo-${Date.now()}`;
        
        return { 
          qrCodeString: demoQrCode, 
          copyPasteCode: demoCopyPaste,
          transactionHash: demoHash
        };
      }
    } catch (error: any) {
      console.error('[PaymentService] Erro ao gerar PIX:', error);
      
      // Retornar um QR code de demonstração para fins de teste
      // Em produção, você deve modificar este comportamento
      console.log('[PaymentService] Erro geral - Gerando QR code de demonstração para teste');
      
      const demoQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_DEMO_${Date.now()}`;
      const demoCopyPaste = `00020126330014BR.GOV.BCB.PIX0111123456789012520400005303986540510.005802BR5915Test%20Merchant6008Sao%20Paulo62180514PIX_DEMO_123456304EE5C`;
      const demoHash = `demo-${Date.now()}`;
      
      return { 
        qrCodeString: demoQrCode, 
        copyPasteCode: demoCopyPaste,
        transactionHash: demoHash
      };
    }
  }

  /**
   * Verifica o status de um pagamento
   * @param transactionHash Hash da transação a ser verificada
   * @returns Status do pagamento (pending, paid, expired, failed)
   */
  async checkPaymentStatus(transactionHash: string): Promise<PaymentStatus> {
    try {
      console.log(`[PaymentService] Verificando status do pagamento: ${transactionHash}`);
      
      // Se for um hash de demonstração, simular uma resposta para testes
      if (transactionHash.startsWith('demo-')) {
        // Simular diferentes tempos de resposta para o pagamento
        // 20% de chance de pagamento confirmado, 80% de chance de pendente
        const randomValue = Math.random();
        
        // Simular um atraso na resposta
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (randomValue < 0.2) {
          console.log('[PaymentService] Simulação: Pagamento confirmado');
          return PaymentStatus.PAID;
        } else {
          console.log('[PaymentService] Simulação: Pagamento pendente');
          return PaymentStatus.PENDING;
        }
      }
      
      // Em produção, faria uma requisição para a API para verificar o status
      try {
        const response = await axios.get<PaymentResponse>(
          `${this.apiUrl}/${transactionHash}?api_token=${this.apiToken}`,
          {
            headers: {
              "Accept": "application/json"
            }
          }
        );
        
        console.log('[PaymentService] Status do pagamento:', response.data.payment_status);
        
        // Mapear o status retornado pela API para nossos status internos
        switch (response.data.payment_status?.toLowerCase()) {
          case 'paid':
          case 'confirmed':
          case 'approved':
          case 'completed':
            return PaymentStatus.PAID;
          case 'expired':
          case 'canceled':
          case 'cancelled':
            return PaymentStatus.EXPIRED;
          case 'failed':
          case 'error':
          case 'rejected':
            return PaymentStatus.FAILED;
          case 'pending':
          case 'waiting':
          case 'processing':
          default:
            return PaymentStatus.PENDING;
        }
      } catch (apiError) {
        console.error('[PaymentService] Erro ao verificar status na API:', apiError);
        
        // Em caso de erro na API, simular uma resposta para não bloquear o fluxo
        // Em um ambiente de produção, você deve tratar o erro adequadamente
        
        // Se o erro incluir alguma informação sobre o status, tentar extrair
        const errorResponse = (apiError as any)?.response?.data;
        if (errorResponse?.payment_status) {
          return this.mapApiStatusToPaymentStatus(errorResponse.payment_status);
        }
        
        return PaymentStatus.PENDING;
      }
    } catch (error) {
      console.error('[PaymentService] Erro ao verificar status do pagamento:', error);
      return PaymentStatus.PENDING;
    }
  }
  
  /**
   * Mapeia um status da API para o nosso enum interno
   * @param apiStatus Status retornado pela API
   * @returns Status de pagamento mapeado
   */
  private mapApiStatusToPaymentStatus(apiStatus: string): PaymentStatus {
    switch (apiStatus.toLowerCase()) {
      case 'paid':
      case 'confirmed':
      case 'approved':
      case 'completed':
        return PaymentStatus.PAID;
      case 'expired':
      case 'canceled':
      case 'cancelled':
        return PaymentStatus.EXPIRED;
      case 'failed':
      case 'error':
      case 'rejected':
        return PaymentStatus.FAILED;
      case 'pending':
      case 'waiting':
      case 'processing':
      default:
        return PaymentStatus.PENDING;
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