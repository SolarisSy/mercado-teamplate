// Utilitário para rastreamento de eventos do Facebook Pixel e outras métricas

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Rastreia um evento personalizado no Facebook Pixel
 * @param eventName Nome do evento (ex: 'AddToCart', 'Purchase', etc)
 * @param params Parâmetros adicionais do evento
 */
export const trackPixelEvent = (eventName: string, params?: EventParams): void => {
  if (typeof window === 'undefined' || !(window as any).fbq) {
    console.warn('Facebook Pixel não está disponível');
    return;
  }

  try {
    (window as any).fbq('track', eventName, params || {});
    console.log(`Evento do Pixel registrado: ${eventName}`, params);
  } catch (error) {
    console.error(`Erro ao registrar evento do Pixel (${eventName}):`, error);
  }
};

/**
 * Rastreia uma visualização de página no Facebook Pixel
 * @param pageName Nome opcional da página para rastreamento adicional
 */
export const trackPageView = (pageName?: string): void => {
  if (typeof window === 'undefined' || !(window as any).fbq) {
    return;
  }

  try {
    // Evento padrão de visualização de página
    (window as any).fbq('track', 'PageView');

    // Evento de visualização de página personalizado com o nome
    if (pageName) {
      (window as any).fbq('trackCustom', 'ViewPage', { pageName });
    }
  } catch (error) {
    console.error('Erro ao registrar visualização de página:', error);
  }
};

/**
 * Rastreia um evento de compra concluída
 * @param orderId ID do pedido
 * @param value Valor total da compra
 * @param currency Moeda utilizada (padrão: BRL)
 * @param products Lista de produtos comprados
 */
export const trackPurchase = (
  orderId: string,
  value: number,
  currency: string = 'BRL',
  products?: any[]
): void => {
  if (typeof window === 'undefined' || !(window as any).fbq) {
    return;
  }
  
  try {
    const purchaseData = {
      content_type: 'product',
      content_ids: products?.map(p => p.id || p.productId) || [],
      value,
      currency,
      num_items: products?.length || 0,
      order_id: orderId,
    };
    
    (window as any).fbq('track', 'Purchase', purchaseData);
    console.log('Compra rastreada:', purchaseData);
  } catch (error) {
    console.error('Erro ao rastrear compra:', error);
  }
};

/**
 * Rastreia um evento de adição ao carrinho
 * @param productId ID do produto
 * @param price Preço do produto
 * @param quantity Quantidade adicionada
 */
export const trackAddToCart = (
  productId: string,
  price: number,
  quantity: number = 1,
  name?: string,
  category?: string
): void => {
  if (typeof window === 'undefined' || !(window as any).fbq) {
    return;
  }
  
  try {
    const cartData = {
      content_type: 'product',
      content_ids: [productId],
      content_name: name,
      content_category: category,
      value: price * quantity,
      currency: 'BRL',
      contents: [
        {
          id: productId,
          quantity,
          price
        }
      ]
    };
    
    (window as any).fbq('track', 'AddToCart', cartData);
  } catch (error) {
    console.error('Erro ao rastrear adição ao carrinho:', error);
  }
};

/**
 * Rastreia o início do processo de checkout
 * @param value Valor total do carrinho
 * @param products Produtos no carrinho
 */
export const trackInitiateCheckout = (value: number, products: any[]): void => {
  if (typeof window === 'undefined' || !(window as any).fbq) {
    return;
  }
  
  try {
    const checkoutData = {
      content_type: 'product',
      content_ids: products.map(p => p.id || p.productId),
      value,
      currency: 'BRL',
      num_items: products.length
    };
    
    (window as any).fbq('track', 'InitiateCheckout', checkoutData);
  } catch (error) {
    console.error('Erro ao rastrear início de checkout:', error);
  }
}; 