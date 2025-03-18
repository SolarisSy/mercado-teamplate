import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductItem, Pagination } from ".";
import customFetch from "../utils/customFetch";
import { useCategories } from '../context/CategoryContext';

interface ShopPageContentProps {
  category?: string;
  page: number;
}

const ShopPageContent = ({ category, page }: ShopPageContentProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useCategories();
  
  const productsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Construir a URL com filtros
        let url = `/products?_page=${page}&_limit=${productsPerPage}`;
        
        // Adicionar filtro de categoria se especificado
        if (category) {
          url += `&category=${category}`;
        }
        
        const response = await customFetch.get(url);
        
        // Obter o total de produtos para calcular a paginação
        const totalCount = parseInt(response.headers['x-total-count'] || '0');
        setTotalPages(Math.ceil(totalCount / productsPerPage));
        
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, page]);

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* Filtros de categoria */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/shop"
            className={`px-4 py-2 rounded-md ${
              !category 
                ? "bg-secondaryBrown text-white" 
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All Products
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

      {/* Lista de produtos */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondaryBrown"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductItem
                key={product.id}
                id={product.id}
                image={product.image}
                title={product.title}
                category={product.category}
                price={product.price}
              />
            ))}
          </div>
          
          {/* Paginação */}
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={category ? `/shop/${category}` : '/shop'} />
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl text-gray-600">No products found in this category.</h3>
          <Link to="/shop" className="mt-4 inline-block px-6 py-2 bg-secondaryBrown text-white rounded-md">
            View all products
          </Link>
        </div>
      )}
    </div>
  );
};

export default ShopPageContent;
