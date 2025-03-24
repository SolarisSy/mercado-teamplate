import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaTags } from 'react-icons/fa';
import { useAppDispatch } from '../hooks';
import { addToCart } from '../features/cart/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { formatCategoryName } from '../utils/formatCategoryName';
import { htmlToPlainText } from '../utils/formatHtml';
import ProductImage from './ProductImage';
import toast from 'react-hot-toast';

interface ProductProps {
  product?: {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    stock?: number;
    source?: string;
    featured?: boolean;
    description?: string;
  };
  // Propriedades individuais para retrocompatibilidade
  id?: string;
  title?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
  source?: string;
  featured?: boolean;
  description?: string;
  isApoioEntregaImage?: boolean;
}

const ProductItem: React.FC<ProductProps> = ({ 
  product,
  // Props individuais para retrocompatibilidade
  id: propId,
  title: propTitle,
  price: propPrice,
  image: propImage,
  imageUrl: propImageUrl,
  category: propCategory,
  stock: propStock = 0,
  featured: propFeatured,
  description: propDescription,
  source: propSource,
  isApoioEntregaImage
}) => {
  // Usar dados do objeto product se fornecido, senão usar props individuais
  const id = product?.id || propId;
  const title = product?.title || propTitle;
  const price = product?.price || propPrice;
  const image = product?.image || propImage || propImageUrl;
  const category = product?.category || propCategory;
  const stock = product?.stock ?? propStock;
  const featured = product?.featured ?? propFeatured;
  const description = product?.description || propDescription;
  const source = product?.source || propSource;

  // Verificação de segurança - se não houver dados suficientes, mostrar mensagem de erro
  if (!id || !title || price === undefined || !image) {
    console.error('ProductItem: Dados insuficientes para renderizar produto', { product, propId, propTitle });
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 text-center">
        <p className="text-red-500">Produto com dados incompletos</p>
      </div>
    );
  }

  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  // Verificação de produto novo (menos de 30 dias)
  const isNewProduct = () => {
    // Implementação existente
    return false;
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id,
        title,
        price,
        image,
        quantity: 1,
        category,
        stock
      })
    );
    toast.success('Produto adicionado ao carrinho');
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Link para a página do produto */}
      <Link to={`/product/${id}`} className="relative overflow-hidden">
        <div className="h-48 overflow-hidden">
          <ProductImage 
            src={image} 
            alt={title}
            title={title}
            category={category}
            productId={id}
            source={source}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Container para badges à esquerda (empilhados verticalmente) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {/* Badge de oferta */}
            {featured && (
              <div className="bg-secondary text-white text-xs px-2 py-1 rounded-full flex items-center">
                <FaTags className="mr-1" />
                <span>Oferta</span>
              </div>
            )}
            
            {isNewProduct() && (
              <div className="bg-warning text-dark text-xs font-semibold px-2 py-1 rounded">
                Novo
              </div>
            )}
          </div>
          
          {/* Container para badges à direita (empilhados verticalmente) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {stock === 0 && (
              <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                Indisponível
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Informações do produto */}
      <div className="p-4">
        <div className="flex justify-between mb-1">
          <p className="text-sm text-gray-500">{formatCategoryName(category)}</p>
        </div>
        
        <Link to={`/product/${id}`} className="block">
          <h3 className="text-lg font-medium text-gray-800 mb-1 line-clamp-2 hover:text-primary transition-colors">{title}</h3>
        </Link>
        
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {htmlToPlainText(description)}
          </p>
        )}
        
        <div className="flex justify-between items-end">
          <div>
            <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
          </div>
          
          {/* Botão de adicionar ao carrinho */}
          <button
            onClick={handleAddToCart}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
              ${stock > 0 ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-300 cursor-not-allowed'}
            `}
            disabled={stock === 0}
          >
            <FaShoppingCart className="text-xl" />
            <span className="hidden group-hover:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
