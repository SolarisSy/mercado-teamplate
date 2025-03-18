import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";
import { useAppDispatch } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";
import toast from "react-hot-toast";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaTags } from "react-icons/fa";

interface ProductItemProps {
  id: string;
  image: string;
  title: string;
  category?: string;
  price: number;
  popularity?: number;
  stock?: number;
  description?: string;
  featured?: boolean;
}

const ProductItem = ({ id, image, title, category = "", price, popularity, stock, description, featured }: ProductItemProps) => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  
  // Verificar se é um produto novo (adicionado nos últimos 7 dias)
  const isNewProduct = () => {
    // Simulando produtos novos apenas se featured for true
    return featured;
  };
  
  // Formatação de preço no estilo brasileiro
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const unitPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price / 1000);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Previne a navegação ao clicar no botão
    dispatch(
      addProductToTheCart({
        id,
        image,
        title,
        category,
        price,
        quantity: 1,
        size: "m", // Tamanho padrão
        color: "black", // Cor padrão
        popularity,
        stock,
        description,
        featured
      })
    );
    toast.success("Produto adicionado ao carrinho");
  };

  return (
    <div 
      className="group bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de promoção */}
      {featured && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <FaTags className="mr-1" />
            <span>Oferta</span>
          </div>
        </div>
      )}
      
      {/* Imagem do produto */}
      <Link to={`/product/${id}`} className="relative overflow-hidden">
        <div className="h-48 overflow-hidden">
          <img
            src={image || '/placeholder-product.jpg'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              console.log(`Error loading product item image: ${image}`);
              e.currentTarget.src = '/placeholder-product.jpg';
            }}
          />
          {isNewProduct() && (
            <div className="absolute top-2 left-2 bg-warning text-dark text-xs font-semibold px-2 py-1 rounded">
              Novo
            </div>
          )}
          {stock !== undefined && stock <= 5 && stock > 0 && (
            <div className="absolute top-2 right-2 bg-warning text-dark text-xs font-semibold px-2 py-1 rounded">
              Restam {stock}
            </div>
          )}
          {stock !== undefined && stock === 0 && (
            <div className="absolute top-2 right-2 bg-danger text-white text-xs font-semibold px-2 py-1 rounded">
              Esgotado
            </div>
          )}
        </div>
        
        {/* Overlay com botão de adicionar se estiver em estoque */}
        {isHovered && stock > 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart(e);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center transition hover:bg-green-700"
            >
              <HiOutlineShoppingCart className="mr-2" />
              Adicionar
            </button>
          </div>
        )}
      </Link>
      
      {/* Informações do produto */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Título */}
        <Link to={`/product/${id}`} className="mb-2">
          <h3 className="text-dark font-medium line-clamp-2 min-h-[40px] group-hover:text-green-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        {/* Preço e disponibilidade */}
        <div className="mt-auto">
          {stock > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-baseline mb-1">
                <span className="text-lg font-bold text-green-700">{formatPrice(price)}</span>
                {featured && (
                  <span className="ml-2 text-xs line-through text-gray-500">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(price * 1.2)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{unitPrice}/kg</span>
            </div>
          ) : (
            <p className="text-gray-500 italic">Produto indisponível</p>
          )}
          
          {/* Botão de adicionar para mobile (sempre visível) */}
          {stock > 0 && (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-green-600 text-white py-2 rounded-md mt-3 flex items-center justify-center hover:bg-green-700 transition md:hidden"
            >
              <HiOutlineShoppingCart className="mr-2" />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
