import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

declare global {
  interface Window {
    fbq?: any;
    utmify?: any;
  }
}

// Interface para os dados de produto para eventos
interface ProductEventData {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
}

// Interface para os dados de checkout
interface CheckoutEventData {
  products: ProductEventData[];
  currency?: string;
  value: number;
}

class PixelService {
  private facebookPixelId: string | null = null;
  private isPixelInitialized = false;
  private utmifyEnabled = false;
  private trackEvents = {
    viewContent: true,
    addToCart: true,
    initiateCheckout: true,
    purchase: true
  };

  constructor() {
    this.initializePixel();
  }

  private async initializePixel() {
    try {
      // Carregar configurações do Firestore
      const docRef = doc(db, "settings", "analytics");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.facebookPixelId = data.facebookPixelId || null;
        this.utmifyEnabled = data.utmifyEnabled || false;
        this.trackEvents = {
          viewContent: data.trackViewContent !== undefined ? data.trackViewContent : true,
          addToCart: data.trackAddToCart !== undefined ? data.trackAddToCart : true,
          initiateCheckout: data.trackInitiateCheckout !== undefined ? data.trackInitiateCheckout : true,
          purchase: data.trackPurchase !== undefined ? data.trackPurchase : true
        };

        if (this.facebookPixelId) {
          this.loadFacebookPixel();
        }

        if (this.utmifyEnabled) {
          this.loadUtmify();
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar pixel:', error);
    }
  }

  private loadFacebookPixel() {
    if (!this.facebookPixelId || this.isPixelInitialized) return;

    // Adicionar o pixel do Facebook diretamente usando o snippet padrão
    // Evitando problemas de tipagem com uma abordagem mais simples
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${this.facebookPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    
    this.isPixelInitialized = true;
  }

  private loadUtmify() {
    if (this.utmifyEnabled && !document.getElementById('utmify-script')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
      script.id = 'utmify-script';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-utmify-prevent-xcod-sck', '');
      script.setAttribute('data-utmify-prevent-subids', '');
      document.body.appendChild(script);
    }
  }

  // Métodos públicos para eventos
  public trackPageView() {
    if (!this.isPixelInitialized || !window.fbq) return;
    window.fbq('track', 'PageView');
  }

  public trackViewContent(product: ProductEventData) {
    if (!this.isPixelInitialized || !window.fbq || !this.trackEvents.viewContent) return;
    
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category || '',
      content_type: 'product',
      value: product.price,
      currency: 'BRL'
    });
  }

  public trackAddToCart(product: ProductEventData) {
    if (!this.isPixelInitialized || !window.fbq || !this.trackEvents.addToCart) return;
    
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'BRL',
      contents: [{
        id: product.id,
        quantity: product.quantity || 1,
        item_price: product.price
      }]
    });
  }

  public trackInitiateCheckout(checkoutData: CheckoutEventData) {
    if (!this.isPixelInitialized || !window.fbq || !this.trackEvents.initiateCheckout) return;
    
    const contentIds = checkoutData.products.map(product => product.id);
    const contents = checkoutData.products.map(product => ({
      id: product.id,
      quantity: product.quantity || 1,
      item_price: product.price
    }));
    
    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      contents: contents,
      value: checkoutData.value,
      currency: checkoutData.currency || 'BRL',
      num_items: checkoutData.products.length
    });
  }

  public trackPurchase(checkoutData: CheckoutEventData) {
    if (!this.isPixelInitialized || !window.fbq || !this.trackEvents.purchase) return;
    
    window.fbq('track', 'Purchase', {
      content_ids: checkoutData.products.map(product => product.id),
      contents: checkoutData.products.map(product => ({
        id: product.id,
        quantity: product.quantity || 1,
        item_price: product.price
      })),
      value: checkoutData.value,
      currency: checkoutData.currency || 'BRL',
      num_items: checkoutData.products.length
    });
  }

  public trackCustomEvent(eventName: string, params?: Record<string, any>) {
    if (!this.isPixelInitialized || !window.fbq) return;
    
    window.fbq('trackCustom', eventName, params || {});
  }

  // Método para uso em contextos de e-commerce onde queremos fornecer informações detalhadas de UTM
  public getUtmParams(): Record<string, string> {
    const utmParams: Record<string, string> = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    // Parâmetros UTM padrão
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });
    
    // Se o UTMify estiver disponível, use-o para pegar parâmetros armazenados na sessão
    if (window.utmify && typeof window.utmify.getAllParameters === 'function') {
      try {
        const utmifyParams = window.utmify.getAllParameters();
        Object.assign(utmParams, utmifyParams);
      } catch (error) {
        console.error('Erro ao obter parâmetros do UTMify:', error);
      }
    }
    
    return utmParams;
  }
}

export const pixelService = new PixelService();
export default pixelService; 