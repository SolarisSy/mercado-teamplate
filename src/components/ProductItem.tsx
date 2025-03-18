import React from 'react';
import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";
import { useAppDispatch } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";
import toast from "react-hot-toast";

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
    <div className="product-card bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <Link
        to={`/product/${id}`}
        className="block"
      >
        <div className="product-image relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              console.error("Error loading product item image:", e.currentTarget.src);
              e.currentTarget.src = '/placeholder-image.jpg';
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
      </Link>
      
      <div className="p-3">
        {category && (
          <p className="text-xs text-gray-500 mb-1">{formatCategoryName(category)}</p>
        )}
        <Link to={`/product/${id}`} className="block">
          <h3 className="text-dark font-medium text-base h-12 mb-2 line-clamp-2 hover:text-primary transition-colors">{title}</h3>
        </Link>
        
        <div className="flex justify-between items-center mb-3">
          <p className="text-lg font-bold text-dark">{formatPrice(price)}</p>
          {featured && (
            <span className="text-xs text-success font-medium">Oferta</span>
          )}
        </div>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300 touch-manipulation"
          disabled={stock !== undefined && stock === 0}
        >
          {stock !== undefined && stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
