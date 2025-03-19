# Rastreamento de Conversões e UTM

Este diretório contém componentes e utilitários para rastreamento de conversões e parâmetros UTM em toda a aplicação.

## Funcionalidades Disponíveis

### Facebook Pixel

O Facebook Pixel é implementado através do contexto `TrackingContext`. Para utilizar:

1. Adicione o seu ID de Pixel no painel administrativo (em `/admin/tracking`)
2. Utilize as funções de rastreamento de eventos em suas páginas e componentes

### UTMify

A integração com UTMify permite rastrear a origem do tráfego através de parâmetros UTM. Para utilizar:

1. Ative o rastreamento UTM no painel administrativo (em `/admin/tracking`)
2. O script da UTMify será automaticamente incluído em todas as páginas

## Como utilizar em componentes

```tsx
// Importação das funções de rastreamento
import { 
  trackPageView, 
  trackAddToCart, 
  trackPurchase, 
  trackInitiateCheckout 
} from '../../utils/tracking';

// Exemplo de uso em um componente de produto
const ProductComponent = ({ product }) => {
  
  const handleAddToCart = () => {
    // Lógica de adição ao carrinho
    ...
    
    // Rastreamento do evento
    trackAddToCart(
      product.id,
      product.price,
      1,
      product.name,
      product.category
    );
  };
  
  return (
    <button onClick={handleAddToCart}>
      Adicionar ao Carrinho
    </button>
  );
};

// Exemplo de uso em uma página de checkout
const CheckoutPage = ({ cartItems, total }) => {
  
  useEffect(() => {
    // Rastrear início do checkout
    trackInitiateCheckout(
      total,
      cartItems
    );
  }, []);
  
  // ...
};

// Exemplo de uso ao finalizar uma compra
const completeOrder = (orderId, total, products) => {
  // Lógica para finalizar o pedido
  ...
  
  // Rastrear evento de compra
  trackPurchase(
    orderId,
    total,
    'BRL',
    products
  );
};
```

## Visualização de dados

Os dados coletados pelo Facebook Pixel podem ser visualizados na plataforma Facebook Business. Para a UTMify, consulte o painel específico da ferramenta.

## Suporte

Para problemas relacionados ao rastreamento, verifique:

1. Se o ID do Pixel foi configurado corretamente
2. Se o script da UTMify está sendo carregado (verifique o console do navegador)
3. Se os eventos estão sendo disparados corretamente 