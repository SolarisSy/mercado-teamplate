import React, { useState, useEffect } from 'react';
import { getLocalImageUrl } from '../utils/imageUtils';

interface ProductImageProps {
  src: string;
  alt: string;
  title?: string;
  category?: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, title = '', category = '', className = '' }) => {
  // Verificar se a URL é de apoioentrega.vteximg.com.br para preservá-la
  const isApoioEntregaImage = src && typeof src === 'string' && src.includes('apoioentrega.vteximg.com.br');
  
  // Inicializar com URL original para apoioentrega ou URL local para outras fontes
  const [imgSrc, setImgSrc] = useState(isApoioEntregaImage ? src : getLocalImageUrl(src, title, category));
  const [hasImgError, setHasImgError] = useState(false);
  
  const handleImageError = () => {
    // Não tentar substituir URLs de apoioentrega.vteximg.com.br
    if (isApoioEntregaImage) {
      console.error(`Erro ao carregar imagem original do apoioentrega: ${src}`);
      setImgSrc('/img/placeholder-product.jpg');
      setHasImgError(true);
      return;
    }
    
    // Prevenção contra loop infinito - só tenta uma vez a imagem de fallback
    if (!hasImgError) {
      console.warn(`Imagem não encontrada: ${src}`);
      setHasImgError(true);
      
      // Estratégia de fallback em etapas:
      // 1. Tentar novamente com getLocalImageUrl incluindo título e categoria
      const localUrl = getLocalImageUrl(src, title, category);
      if (localUrl !== imgSrc) {
        setImgSrc(localUrl);
        return;
      }
      
      // 2. Se ainda não encontrou, tentar obter apenas pelo título e categoria
      const fallbackByName = getLocalImageUrl('', title, category);
      if (fallbackByName !== '/img/placeholder-product.jpg' && !fallbackByName.includes('placeholder-product.jpg')) {
        setImgSrc(fallbackByName);
        return;
      }
      
      // 3. Em último caso, usar o placeholder local
      setImgSrc('/img/placeholder-product.jpg');
    }
  };
  
  // Use um efeito para tentar obter uma imagem melhor se o componente for montado com uma imagem de fallback genérica
  useEffect(() => {
    // Não modificar URLs de apoioentrega.vteximg.com.br
    if (isApoioEntregaImage) {
      console.log(`Mantendo URL original de apoioentrega: ${src}`);
      return;
    }
    
    // Se a imagem for um placeholder, tentar encontrar uma imagem melhor baseada no título e categoria
    if (imgSrc.includes('placeholder-product.jpg')) {
      // Tentar obter uma imagem melhor baseada no título do produto
      const betterImage = getLocalImageUrl('', title, category);
      if (betterImage !== imgSrc && !betterImage.includes('placeholder-product.jpg')) {
        console.log(`Substituindo placeholder por imagem mais específica para "${title}"`);
        setImgSrc(betterImage);
      }
    }
  }, [title, category, imgSrc, src, isApoioEntregaImage]);
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default ProductImage; 