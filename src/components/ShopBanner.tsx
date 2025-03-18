import { useCategories } from '../context/CategoryContext';

interface ShopBannerProps {
  category?: string;
}

const ShopBanner = ({ category }: ShopBannerProps) => {
  const { categories } = useCategories();
  
  // Encontrar a categoria atual pelo slug
  const currentCategory = category 
    ? categories.find(cat => cat.slug === category) 
    : null;
  
  // Título da página
  const pageTitle = currentCategory 
    ? currentCategory.name 
    : "All Products";
  
  // Imagem de fundo
  const backgroundImage = currentCategory?.image || '/images/shop-banner.jpg';

  return (
    <div 
      className="h-80 w-full flex items-center justify-center mb-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="text-5xl text-white font-bold tracking-wider">{pageTitle}</h1>
    </div>
  );
};

export default ShopBanner;
