import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";
import { useAppDispatch } from "../hooks";
import { addToCart } from "../features/cart/cartSlice";
import toast from "react-hot-toast";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaTags } from "react-icons/fa";
import { Product } from '../types/product';
import { formatCurrency } from '../utils/formatCurrency';
// Imagem de fallback local para evitar problemas de rede
import noImagePlaceholder from '../assets/no-image.svg';
// Importar o utilitário de imagens
import { getLocalImageUrl } from '../utils/imageUtils';

interface ProductItemProps {
  product?: Product;
  // Propriedades individuais para compatibilidade retroativa
  id?: string;
  title?: string;
  price?: number;
  image?: string;
  category?: string;
  stock?: number;
  featured?: boolean;
  description?: string;
  popularity?: number;
  weight?: number;
  unit?: string;
  brand?: string;
  isOrganic?: boolean;
  discount?: number;
}

const ProductItem: React.FC<ProductItemProps> = ({ 
  product,
  id: propId, 
  title: propTitle, 
  price: propPrice, 
  image: propImage,
  category: propCategory,
  stock: propStock,
  featured: propFeatured,
  description: propDescription,
  popularity: propPopularity,
  weight: propWeight,
  unit: propUnit,
  brand: propBrand,
  isOrganic: propIsOrganic,
  discount: propDiscount
}) => {
  // Usar props individuais ou props do objeto product
  const id = product?.id || propId || '';
  const title = product?.title || propTitle || '';
  const price = product?.price || propPrice || 0;
  const imageUrl = product?.image || propImage || '';
  const category = product?.category || propCategory || '';
  const stock = product?.stock ?? propStock ?? 0;
  const featured = product?.featured ?? propFeatured ?? false;
  const description = product?.description || propDescription || '';
  const popularity = product?.popularity || propPopularity || 0;
  const weight = product?.weight || propWeight;
  const unit = product?.unit || propUnit || '';
  const brand = product?.brand || propBrand || '';
  const isOrganic = product?.isOrganic ?? propIsOrganic ?? false;
  const discount = product?.discount || propDiscount || 0;
  
  const [isHovered, setIsHovered] = useState(false);
  // Usar o utilitário para obter a URL local da imagem, passando também o título e a categoria
  const [imgSrc, setImgSrc] = useState(getLocalImageUrl(imageUrl, title, category));
  const [hasImgError, setHasImgError] = useState(false);
  const dispatch = useAppDispatch();
  
  // Verifica se um produto é novo (menos de 30 dias)
  const isNewProduct = () => {
    // Simulando produto novo (10% de chance)
    return Math.random() < 0.1;
  };
  
  // Calcula o preço com desconto
  const priceWithDiscount = discount > 0 ? price * (1 - discount / 100) : price;
  
  // Formata o peso para exibição
  const formattedWeight = weight ? `${weight}${unit}` : '';
  
  const handleAddToCart = () => {
    const productToAdd = {
      id,
      title,
      price,
      image: imageUrl,
      quantity: 1,
      category,
      stock,
      weight,
      unit,
      brand,
      isOrganic,
      discount
    };
    
    dispatch(addToCart(productToAdd));
  };
  
  // Use um efeito para tentar obter uma imagem melhor se o componente for montado com uma imagem de fallback genérica
  useEffect(() => {
    // Se a imagem for um placeholder, tentar encontrar uma imagem melhor baseada no título e categoria
    if (imgSrc.includes('placeholder-product.jpg')) {
      // Tentar obter uma imagem melhor baseada no título do produto
      const betterImage = getLocalImageUrl('', title, category);
      if (betterImage !== imgSrc && !betterImage.includes('placeholder-product.jpg')) {
        console.log(`Substituindo placeholder por imagem mais específica para "${title}"`);
        setImgSrc(betterImage);
      }
    }
  }, [title, category, imgSrc]);
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Link para a página do produto */}
      <Link to={`/product/${id}`} className="relative overflow-hidden">
        <div className="h-48 overflow-hidden">
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Prevenção contra loop infinito - só tenta uma vez a imagem de fallback
              if (!hasImgError) {
                console.warn(`Imagem não encontrada para o produto "${title}": ${imageUrl}`);
                setHasImgError(true);
                
                // Estratégia de fallback em etapas:
                // 1. Tentar novamente com getLocalImageUrl incluindo título e categoria
                const localUrl = getLocalImageUrl(imageUrl, title, category);
                if (localUrl !== imgSrc) {
                  setImgSrc(localUrl);
                  return;
                }
                
                // 2. Se ainda não encontrou, tentar obter apenas pelo título e categoria
                const fallbackByName = getLocalImageUrl('', title, category);
                if (fallbackByName !== DEFAULT_PLACEHOLDER && !fallbackByName.includes('placeholder-product.jpg')) {
                  setImgSrc(fallbackByName);
                  return;
                }
                
                // 3. Em último caso, usar o placeholder SVG local
                setImgSrc(noImagePlaceholder);
              }
            }}
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
            
            {isOrganic && (
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Orgânico
              </div>
            )}
          </div>
          
          {/* Container para badges à direita (empilhados verticalmente) */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {discount && discount > 0 && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {`-${discount}%`}
              </div>
            )}
            
            {stock <= 5 && stock > 0 && (
              <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                Últimas unidades
              </div>
            )}
            
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
          {brand && <p className="text-sm text-gray-500">{brand}</p>}
        </div>
        
        <Link to={`/product/${id}`} className="block">
          <h3 className="text-lg font-medium text-gray-800 mb-1 line-clamp-2 hover:text-primary transition-colors">{title}</h3>
        </Link>
        
        {formattedWeight && (
          <p className="text-sm text-gray-500 mb-2">{formattedWeight}</p>
        )}
        
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="flex justify-between items-end">
          <div>
            {discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">{formatCurrency(price)}</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(priceWithDiscount)}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className={`p-2 rounded-full transition duration-300 ${
              stock === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            title={stock === 0 ? 'Produto indisponível' : 'Adicionar ao carrinho'}
          >
            <HiOutlineShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Constante para o caminho do placeholder, para não depender da string literal
const DEFAULT_PLACEHOLDER = '/img/placeholder-product.jpg';

export default ProductItem;
