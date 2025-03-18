import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Banner, ProductItem } from "../components";
import customFetch from "../utils/customFetch";
import { useCategories } from '../context/CategoryContext';

const Landing = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useCategories();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await customFetch.get('/products?_sort=createdAt&_order=desc&_limit=12');
        
        // Verificar se response.data é um array
        if (!Array.isArray(response.data)) {
          console.error('Dados de produtos não são um array:', response.data);
          setFeaturedProducts([]);
          return;
        }
        
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Banner Carrossel */}
      <Banner />

      {/* Divider */}
      <div className="section-divider w-full h-10 bg-gray-100 flex items-center justify-center relative">
        <div className="absolute w-16 h-1 bg-primary"></div>
      </div>

      {/* Categorias */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-dark relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-primary">
            Departamentos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((category) => (
              <Link 
                key={category.id} 
                to={`/shop/${category.slug}`}
                className="group bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden flex flex-col items-center p-4"
              >
                <div className="relative h-24 w-24 rounded-full overflow-hidden mb-3">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-category.jpg';
                    }}
                  />
                </div>
                <h3 className="text-center text-dark font-medium group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider w-full h-10 bg-gray-100 flex items-center justify-center relative">
        <div className="absolute w-16 h-1 bg-primary"></div>
      </div>

      {/* Produtos em Destaque */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-center md:text-left text-dark relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 md:after:left-0 after:w-20 after:h-1 after:bg-primary">
              Ofertas da Semana
            </h2>
            <Link to="/shop" className="text-primary hover:underline mt-4 md:mt-0">
              Ver todas as ofertas
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredProducts.slice(0, 10).map((product) => (
                <ProductItem
                  key={product.id}
                  id={product.id}
                  image={product.image}
                  title={product.title}
                  category={product.category}
                  price={product.price}
                  stock={product.stock}
                  featured={product.featured}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">Nenhum produto em destaque disponível</p>
          )}
          
          <div className="text-center mt-10">
            <Link 
              to="/shop" 
              className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition duration-300"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>
      
      {/* Divider */}
      <div className="section-divider w-full h-10 bg-gray-100 flex items-center justify-center relative">
        <div className="absolute w-16 h-1 bg-primary"></div>
      </div>
      
      {/* Compre por Categorias Especiais */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-dark relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-primary">
            Categorias Especiais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.filter(cat => cat.featured).slice(0, 3).map((category) => (
              <Link 
                key={category.id} 
                to={`/shop/${category.slug}`}
                className="group"
              >
                <div className="relative h-64 overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={category.image || '/placeholder-banner.jpg'} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-banner.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center hover:bg-opacity-30 transition-all">
                    <div className="text-center px-4">
                      <h3 className="text-white text-2xl font-bold mb-2">{category.name}</h3>
                      <span className="inline-block bg-primary text-white px-4 py-2 rounded text-sm">
                        Ver Produtos
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
