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
        const response = await customFetch.get('/products?featured=true&_limit=12');
        
        // Verificar se response.data é um array
        if (!Array.isArray(response.data)) {
          console.error('Dados de produtos não são um array:', response.data);
          setFeaturedProducts([]);
          return;
        }
        
        console.log('Produtos retornados na página inicial:', {
          total: response.data.length,
          produtos: response.data.map(p => ({
            id: p.id,
            title: p.title,
            featured: p.featured
          }))
        });
        
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
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <Banner />

      {/* Categorias em Destaque */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-dark relative pb-3 mb-10 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-primary">
            Categorias em Destaque
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories
              .filter(category => category.featured)
              .map(category => (
                <Link
                  key={category.id}
                  to={`/shop/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-200">{category.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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
      <div className="border-t border-gray-200"></div>
    </div>
  );
};

export default Landing;
