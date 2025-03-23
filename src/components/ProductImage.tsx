import { useState } from 'react';

interface ProductImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
}

const ProductImage = ({ src, alt, className = '' }: ProductImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    if (!hasError) {
      console.warn(`Erro ao carregar imagem do produto: ${src}`);
      setHasError(true);
      setImgSrc('https://via.placeholder.com/300x200?text=Produto');
    }
  };
  
  return (
    <img 
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ProductImage; 