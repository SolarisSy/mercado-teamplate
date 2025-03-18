import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage = ({ src, alt, className = '' }: ProductImageProps) => {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    console.log(`Error loading product item image: ${src}`);
    setError(true);
  };
  
  return (
    <img 
      src={error ? '/placeholder-product.jpg' : src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ProductImage; 