import React, { useState, useEffect } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  title?: string;
  category?: string;
  className?: string;
  productId?: string;
  source?: string;
}

// Definindo placeholders em ordem de prioridade
const PLACEHOLDERS = [
  '/img/placeholder-product.jpg',
  '/img/placeholder-image.jpg',
  '/img/produtos/placeholder.jpg',
  '/img/placeholder.jpg',
  '/placeholder.jpg',
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22350%22%20height%3D%22350%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20350%20350%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189d307c1f1%20text%20%7B%20fill%3Argba(201%2C201%2C201%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A18pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189d307c1f1%22%3E%3Crect%20width%3D%22350%22%20height%3D%22350%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22130.5%22%20y%3D%22183.6%22%3EProduto%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
];

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  title = '', 
  category = '', 
  className = '',
  productId = '',
  source = ''
}) => {
  // Verificações para imagens do apoioentrega ou produtos importados
  const isApoioEntregaImage = src && typeof src === 'string' && src.includes('apoioentrega');
  const isImportedProduct = productId?.startsWith('imported_') || source === 'apoioentrega';
  
  // Inicializar com a URL original ou placeholder se não tiver URL
  const initialSrc = src || PLACEHOLDERS[0];
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasImgError, setHasImgError] = useState(false);
  const [fallbackAttempts, setFallbackAttempts] = useState(0);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(-1);
  
  // Atualizar a URL da imagem quando a prop src mudar
  useEffect(() => {
    if (!src) {
      setImgSrc(PLACEHOLDERS[0]);
      return;
    }
    
    // Resetar o estado ao mudar a imagem
    setHasImgError(false);
    setFallbackAttempts(0);
    setCurrentPlaceholderIndex(-1);
    
    // Verificar se a imagem já está no diretório local
    if (src.includes('/img/produtos/')) {
      setImgSrc(src);
      return;
    }
    
    // Para URLs relativas (caminhos locais)
    if (src.startsWith('/')) {
      setImgSrc(src);
      return;
    }
    
    // Para URLs completas
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // Tratamento especial para apoioentrega
      if (isApoioEntregaImage) {
        let cleanUrl = src;
        // Remover parâmetros que podem causar problemas
        if (cleanUrl.includes('?')) {
          cleanUrl = cleanUrl.split('?')[0];
        }
        setImgSrc(cleanUrl);
      } else {
        // Outras URLs externas
        setImgSrc(src);
      }
      return;
    }
    
    // Se chegou aqui, formato não reconhecido
    setImgSrc(PLACEHOLDERS[0]);
  }, [src, isApoioEntregaImage, isImportedProduct]);
  
  const handleImageError = () => {
    // Se já tentou muitos fallbacks, usar placeholder de SVG embutido (último recurso)
    if (fallbackAttempts >= 5) {
      setImgSrc(PLACEHOLDERS[PLACEHOLDERS.length - 1]);
      return;
    }
    
    setHasImgError(true);
    setFallbackAttempts(prev => prev + 1);
    
    // Estratégia 1: Se a imagem atual é um placeholder, tentar o próximo placeholder
    if (currentPlaceholderIndex >= 0 || PLACEHOLDERS.includes(imgSrc)) {
      // Determinar qual é o próximo placeholder a tentar
      const nextIndex = currentPlaceholderIndex >= 0 
        ? currentPlaceholderIndex + 1 
        : PLACEHOLDERS.indexOf(imgSrc) + 1;
      
      // Se ainda temos placeholders para tentar
      if (nextIndex < PLACEHOLDERS.length) {
        setCurrentPlaceholderIndex(nextIndex);
        setImgSrc(PLACEHOLDERS[nextIndex]);
        return;
      }
    }
    
    // Estratégia 2: Se for uma imagem de produtos locais, tentar com placeholder
    if (imgSrc.includes('/img/produtos/')) {
      setCurrentPlaceholderIndex(0);
      setImgSrc(PLACEHOLDERS[0]);
      return;
    }
    
    // Estratégia 3: Se for do apoioentrega, tentar com protocolo alternativo
    if (isApoioEntregaImage) {
      let alternativeUrl = imgSrc;
      
      // Tentar trocar o protocolo
      if (imgSrc.startsWith('https://')) {
        alternativeUrl = imgSrc.replace('https://', 'http://');
      } else if (imgSrc.startsWith('http://')) {
        alternativeUrl = imgSrc.replace('http://', 'https://');
      }
      
      // Remover parâmetros se houver
      if (alternativeUrl.includes('?')) {
        alternativeUrl = alternativeUrl.split('?')[0];
      }
      
      setImgSrc(alternativeUrl);
      return;
    }
    
    // Estratégia 4: Para qualquer outro caso, usar o primeiro placeholder
    setCurrentPlaceholderIndex(0);
    setImgSrc(PLACEHOLDERS[0]);
  };
  
  return (
    <img
      src={imgSrc}
      alt={alt || title || "Imagem do produto"}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default ProductImage; 