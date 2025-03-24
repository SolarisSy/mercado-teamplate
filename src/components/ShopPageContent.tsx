import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductItem } from ".";
import { useCategories } from '../context/CategoryContext';
import customFetch from '../utils/customFetch';
import Pagination from './Pagination';

interface ShopPageContentProps {
  category?: string;
  page: number;
}

// Definindo a interface para o objeto de produtos
interface ProductsResult {
  url: string;
  totalCount: number;
  totalPages: number;
  productsPerPage: number;
  currentPage: number;
  produtos: any[];
}

const ShopPageContent = ({ category, page }: ShopPageContentProps) => {
  const [products, setProducts] = useState<ProductsResult>({
    url: '',
    totalCount: 0,
    totalPages: 0,
    productsPerPage: 0,
    currentPage: 0,
    produtos: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useCategories();
  
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Encontrar o categoryId correspondente ao slug da categoria selecionada
        let categoryId = '';
        let categorySlug = '';
        
        if (category) {
          const selectedCategory = categories.find(cat => cat.slug === category);
          if (selectedCategory) {
            categoryId = selectedCategory.id;
            categorySlug = selectedCategory.slug;
          } else {
            console.warn(`Categoria não encontrada para o slug: ${category}`);
          }
        }

        // Construir a URL com filtro de categoria, se disponível
        let url = `/products?_page=${page}&_limit=${productsPerPage}`;
        
        if (categoryId) {
          // Adicionar filtro de categoria à URL
          url = `/products?category=${categorySlug}&_page=${page}&_limit=${productsPerPage}`;
        }
        
        console.log(`Buscando produtos com URL: ${url}`);
        
        // Primeira solicitação para obter os produtos da página atual
        const response = await customFetch.get(url);
        const dataFromServer = response.data || [];
        
        // Solicitação adicional para obter a contagem total
        const allProductsUrl = categoryId ? `/products?category=${categorySlug}` : '/products';
        const allProductsResponse = await customFetch.get(allProductsUrl);
        const allProducts = allProductsResponse.data || [];
        
        // Cálculo correto de totalCount
        const totalCount = allProducts.length;
        
        // Garantir que estamos recebendo os produtos corretos para a página atual
        let productsToShow = dataFromServer;
        
        // Se estamos na página 2 ou maior e o servidor não está paginando corretamente,
        // realizar paginação manual
        if (page > 1 && dataFromServer.length > 0 && allProducts.length > 0 && 
            (dataFromServer.length !== productsPerPage || 
             (dataFromServer[0]?.id === allProducts[0]?.id && page !== 1))) {
          console.log('Realizando paginação manual para a página', page);
          const startIndex = (page - 1) * productsPerPage;
          productsToShow = allProducts.slice(startIndex, startIndex + productsPerPage);
        }
        
        // Construir objeto de resposta com os dados corretos
        const result = {
          url,
          totalCount,
          totalPages: Math.ceil(totalCount / productsPerPage),
          productsPerPage,
          currentPage: page,
          produtos: productsToShow
        };
        
        console.log('Produtos retornados na página de shop:', result);
        setProducts(result);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setError('Falha ao carregar os produtos. Por favor, tente novamente.');
        setProducts({
          url: '',
          totalCount: 0,
          totalPages: 0,
          productsPerPage,
          currentPage: page,
          produtos: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, page, categories]);

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Filtros de categoria */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categorias</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/shop"
            className={`px-4 py-2 rounded-md ${
              !category 
                ? "bg-secondaryBrown text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Todos os Produtos
          </Link>
          
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop/${cat.slug}`}
              className={`px-4 py-2 rounded-md ${
                category === cat.slug
                  ? "bg-secondaryBrown text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Lista de produtos */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondaryBrown"></div>
        </div>
      ) : products.produtos && products.produtos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.produtos.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
              />
            ))}
          </div>
          
          {/* Paginação */}
          <div className="mt-12">
            <Pagination 
              currentPage={page} 
              totalPages={products.totalPages} 
              baseUrl={category ? `/shop/${category}` : '/shop'} 
            />
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl text-gray-600">Nenhum produto encontrado nesta categoria.</h3>
          <Link to="/shop" className="mt-4 inline-block px-6 py-2 bg-secondaryBrown text-white rounded-md">
            Ver todos os produtos
          </Link>
        </div>
      )}
    </div>
  );
};

export default ShopPageContent;
