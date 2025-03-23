import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useAppDispatch } from '../../hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { fetchProductById } from '../../services/productService';
import { Product } from '../../types/product';
import Layout from '../../components/Layout';
import { formatCurrency } from '../../utils/formatCurrency';
import RelatedProducts from '../../components/RelatedProducts';
import NutritionalTable from '../../components/NutritionalTable';
import SEO from '../../components/SEO';

interface ProductPageProps {
  product: Product;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>(
    product?.images && product.images.length > 0 
      ? product.images[0] 
      : '/images/placeholder-product.jpg'
  );

  // Redirecionar para a página 404 se o produto não for encontrado
  useEffect(() => {
    if (router.isFallback && !product) {
      router.push('/404');
    }
  }, [product, router]);

  // Se ainda estiver carregando
  if (router.isFallback) {
    return <div className="container mx-auto mt-12 px-4">Carregando...</div>;
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: selectedImage,
        quantity,
        category: product.category,
        weight: product.weight,
        unit: product.unit,
        brand: product.brand,
        isOrganic: product.isOrganic,
        discount: product.discount,
      })
    );
  };

  const calculatedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <Layout>
      <SEO 
        title={`${product.title} | Mercado`}
        description={product.description.substring(0, 160)}
        image={selectedImage}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagens do produto */}
          <div className="space-y-4">
            <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain' }}
                priority
              />
              {product.isOrganic && (
                <span className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                  Orgânico
                </span>
              )}
              {product.discount && product.discount > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                  {`-${product.discount}%`}
                </span>
              )}
            </div>
            
            {/* Galeria de miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto py-2">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer border-2 rounded-md overflow-hidden ${
                      selectedImage === img ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} - Imagem ${index + 1}`}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Informações do produto */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-gray-500 text-sm uppercase">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              
              <div className="mt-4 flex items-baseline">
                {product.discount && product.discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrency(calculatedPrice)}
                    </span>
                    <span className="ml-2 text-lg text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              
              {product.weight && product.unit && (
                <p className="mt-2 text-gray-600">
                  {product.weight} {product.unit}
                </p>
              )}
            </div>
            
            {/* Origem */}
            {product.origin && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Origem:</h3>
                <p className="text-gray-600">{product.origin}</p>
              </div>
            )}
            
            {/* Data de validade */}
            {product.expiryDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-700">Validade:</h3>
                <p className="text-gray-600">
                  {new Date(product.expiryDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            
            {/* Descrição */}
            <div>
              <h3 className="text-sm font-medium text-gray-700">Descrição:</h3>
              <div className="mt-2 prose prose-sm text-gray-600">
                <p>{product.description}</p>
              </div>
            </div>
            
            {/* Quantidade e botão de adicionar ao carrinho */}
            <div className="mt-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                    aria-label="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium"
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? "Adicionar ao carrinho" : "Produto esgotado"}
                </button>
              </div>
              
              {product.stock <= 5 && product.stock > 0 && (
                <p className="mt-2 text-sm text-orange-600">
                  Apenas {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'} em estoque
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Informações nutricionais */}
        {product.nutritionalInfo && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Informações Nutricionais</h2>
            <NutritionalTable nutritionalInfo={product.nutritionalInfo} />
          </div>
        )}
        
        {/* Produtos relacionados */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Produtos Relacionados</h2>
          <RelatedProducts 
            currentProductId={product.id} 
            category={product.category} 
          />
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  try {
    const product = await fetchProductById(id);
    
    if (!product) {
      return {
        notFound: true,
      };
    }
    
    return {
      props: {
        product,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return {
      notFound: true,
    };
  }
};

export default ProductPage;