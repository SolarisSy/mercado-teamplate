import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage = ({ src, alt, className = '' }: ProductImageProps) => {
  const [error, setError] = useState(false);
  
  return (
    <img 
      src={error ? '/placeholder-image.jpg' : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default ProductImage; 