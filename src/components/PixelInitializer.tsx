import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import pixelService from '../services/pixelService';

const PixelInitializer = () => {
  const location = useLocation();

  // Esse efeito será executado uma vez no carregamento inicial do componente
  useEffect(() => {
    // O pixel será inicializado automaticamente no construtor do serviço
    console.log('Pixel do Facebook inicializado');
  }, []);

  // Esse efeito será executado a cada mudança de rota para registrar visualizações de página
  useEffect(() => {
    // Registrar PageView a cada mudança de rota
    pixelService.trackPageView();
    
    // Registrar eventos personalizados baseados na rota atual
    const path = location.pathname;
    
    // Rastrear visualizações de categorias específicas
    if (path.startsWith('/shop/') && path.length > 6) {
      const category = path.substring(6); // Ex: /shop/frutas -> frutas
      pixelService.trackCustomEvent('category_view', { category });
    }
    
    // Rastrear visualizações específicas
    if (path === '/cart') {
      pixelService.trackCustomEvent('cart_view');
    }
    
    if (path === '/shop') {
      pixelService.trackCustomEvent('shop_view');
    }
    
    if (path === '/') {
      pixelService.trackCustomEvent('homepage_view');
    }
    
  }, [location.pathname]);

  // Este componente não renderiza nada na interface
  return null;
};

export default PixelInitializer; 