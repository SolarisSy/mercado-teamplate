import { useState } from "react";
import { HiShoppingCart, HiSearch, HiUser, HiPhone, HiLocationMarker } from "react-icons/hi";
import { Link } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import { useAppSelector } from "../hooks";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const cart = useAppSelector((state) => state.cart);
  const totalItems = cart.cartItems.reduce(
    (total: number, item: { quantity: number }) => total + item.quantity,
    0
  );
  
  return (
    <>
      {/* Barra superior com informações de contato */}
      <div className="bg-green-700 text-white text-sm py-2">
        <div className="container mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <HiPhone className="mr-1" /> 
              <span>(31) 3333-4444</span>
            </div>
            <div className="hidden md:flex items-center">
              <HiLocationMarker className="mr-1" /> 
              <span>Entregamos em toda a cidade</span>
            </div>
          </div>
          <div>
            <Link to="/login" className="hover:underline">Entrar</Link>
            <span className="mx-2">|</span>
            <Link to="/register" className="hover:underline">Cadastrar</Link>
          </div>
        </div>
      </div>
      
      {/* Header principal */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-5">
          <div className="flex items-center mb-4 md:mb-0">
            <button 
              className="mr-4 text-dark hover:text-green-600 focus:outline-none"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
            <Link to="/" className="flex items-center">
              <img 
                src="/img/marca_apoio_entrega@2x.png" 
                alt="Apoio Entrega" 
                className="h-12 max-sm:h-10 max-[400px]:h-8"
              />
            </Link>
          </div>
          
          {/* Campo de busca */}
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="O que você está procurando hoje?"
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700">
                <HiSearch className="text-xl" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-6 items-center">
            <Link to="/login" className="hidden md:flex flex-col items-center text-dark hover:text-green-600">
              <HiUser className="text-2xl mb-1" />
              <span className="text-xs">Minha Conta</span>
            </Link>
            <Link to="/cart" className="flex flex-col items-center text-dark hover:text-green-600 relative">
              <HiShoppingCart className="text-2xl mb-1" />
              <span className="text-xs">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* Barra de navegação de categorias */}
        <div className="bg-green-600 text-white py-2 px-5 hidden md:block">
          <div className="container mx-auto">
            <ul className="flex space-x-6">
              <li><Link to="/shop/ofertas" className="hover:text-yellow-300 font-medium">Ofertas</Link></li>
              <li><Link to="/shop/hortifruti" className="hover:text-yellow-300 font-medium">Hortifruti</Link></li>
              <li><Link to="/shop/acougue" className="hover:text-yellow-300 font-medium">Açougue</Link></li>
              <li><Link to="/shop/padaria" className="hover:text-yellow-300 font-medium">Padaria</Link></li>
              <li><Link to="/shop/laticinios" className="hover:text-yellow-300 font-medium">Laticínios</Link></li>
              <li><Link to="/shop/bebidas" className="hover:text-yellow-300 font-medium">Bebidas</Link></li>
              <li><Link to="/shop/limpeza" className="hover:text-yellow-300 font-medium">Limpeza</Link></li>
              <li><Link to="/shop" className="hover:text-yellow-300 font-medium">Ver Todos</Link></li>
            </ul>
          </div>
        </div>
      </header>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};

export default Header;
