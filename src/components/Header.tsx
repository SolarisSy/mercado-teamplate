import { useState } from "react";
import { HiShoppingCart, HiSearch, HiUser } from "react-icons/hi";
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
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-5">
          <div className="flex items-center">
            <button 
              className="mr-4 text-dark hover:text-primary focus:outline-none"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
            <Link to="/" className="flex items-center">
              <img 
                src="/img/marca_apoio_entrega.png" 
                alt="Apoio Entrega" 
                className="h-12 max-sm:h-10 max-[400px]:h-8"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex">
            <ul className="flex">
              <li className="mr-6"><Link to="/" className="font-medium text-dark hover:text-primary">Início</Link></li>
              <li className="mr-6"><Link to="/shop" className="font-medium text-dark hover:text-primary">Produtos</Link></li>
              <li className="mr-6"><Link to="/contact" className="font-medium text-dark hover:text-primary">Contato</Link></li>
              <li><Link to="/about" className="font-medium text-dark hover:text-primary">Sobre</Link></li>
            </ul>
          </nav>
          
          <div className="flex gap-4 items-center">
            <Link to="/search" className="text-dark hover:text-primary">
              <HiSearch className="text-2xl max-sm:text-xl" />
            </Link>
            <Link to="/login" className="text-dark hover:text-primary">
              <HiUser className="text-2xl max-sm:text-xl" />
            </Link>
            <Link to="/cart" className="text-dark hover:text-primary relative">
              <HiShoppingCart className="text-2xl max-sm:text-xl" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};

export default Header;
