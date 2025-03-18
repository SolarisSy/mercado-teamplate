import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const carouselData = [
  {
    id: 1,
    image: "/img/banner-promocao.jpg",
    title: "Ofertas Imperdíveis",
    description: "Confira nossas ofertas especiais com até 50% de desconto",
    link: "/shop"
  },
  {
    id: 2,
    image: "/img/banner-hortifruti.jpg",
    title: "Hortifruti Fresquinho",
    description: "Frutas, legumes e verduras frescos todos os dias",
    link: "/shop/hortifruti"
  },
  {
    id: 3,
    image: "/img/banner-acougue.jpg",
    title: "Carnes Selecionadas",
    description: "As melhores carnes para o seu churrasco",
    link: "/shop/carnes"
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
  };
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);
  
  return (
    <section className="relative">
      <div className="carousel-container w-full relative overflow-hidden h-[400px]">
        <div 
          className="carousel-slides flex transition-transform duration-500 h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carouselData.map((slide, index) => (
            <div key={slide.id} className="carousel-slide min-w-full h-full relative">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
              <div className="slide-content absolute inset-0 flex flex-col justify-center items-center text-center text-white bg-black bg-opacity-40 px-4">
                <h2 className="text-4xl font-bold mb-2">{slide.title}</h2>
                <p className="text-xl mb-6">{slide.description}</p>
                <Link 
                  to={slide.link} 
                  className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition duration-300"
                >
                  Ver Ofertas
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-control prev absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 hover:bg-opacity-75"
          onClick={prevSlide}
        >
          <FaChevronLeft />
        </button>
        
        <button 
          className="carousel-control next absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 hover:bg-opacity-75"
          onClick={nextSlide}
        >
          <FaChevronRight />
        </button>
        
        <div className="carousel-indicators absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselData.map((_, index) => (
            <button 
              key={index} 
              className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-primary' : 'bg-white bg-opacity-50'}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;
