import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineShoppingBag, 
  HiOutlineUsers, 
  HiOutlineLogout,
  HiOutlineTag,
  HiOutlinePhotograph,
  HiOutlineChartBar,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineShoppingCart,
  HiOutlineDownload
} from 'react-icons/hi';

const AdminDashboard = () => {
  const { adminLogout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Fechar o menu mobile ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Determinar se um link está ativo
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg transform lg:relative lg:translate-x-0 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-2xl font-bold text-secondaryBrown ${!isSidebarOpen && 'hidden'}`}>
              Mercado Admin
            </h2>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 lg:block hidden"
            >
              {isSidebarOpen ? '←' : '→'}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 lg:hidden block"
            >
              <HiOutlineX className="text-xl text-gray-600" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/dashboard') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlineViewGrid className={`text-xl ${isActive('/admin/dashboard') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
            
            <Link 
              to="/admin/products" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/products') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlineShoppingBag className={`text-xl ${isActive('/admin/products') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Produtos</span>}
            </Link>
            
            <Link 
              to="/admin/importer" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/importer') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlineDownload className={`text-xl ${isActive('/admin/importer') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Importar Produtos</span>}
            </Link>
            
            <Link 
              to="/admin/categories" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/categories') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlineTag className={`text-xl ${isActive('/admin/categories') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Categorias</span>}
            </Link>
            
            <Link 
              to="/admin/carousel" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/carousel') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlinePhotograph className={`text-xl ${isActive('/admin/carousel') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Carrossel</span>}
            </Link>
            
            <Link 
              to="/admin/tracking" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/tracking') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlineChartBar className={`text-xl ${isActive('/admin/tracking') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Rastreamento</span>}
            </Link>
            
            <Link 
              to="/admin/users" 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/users') 
                  ? 'bg-secondaryBrown bg-opacity-10 text-secondaryBrown' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HiOutlineUsers className={`text-xl ${isActive('/admin/users') ? 'text-secondaryBrown' : ''}`} />
              {isSidebarOpen && <span className="ml-3">Usuários</span>}
            </Link>

            <Link 
              to="/" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HiOutlineShoppingCart className="text-xl" />
              {isSidebarOpen && <span className="ml-3">Ver Loja</span>}
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <button 
              onClick={adminLogout}
              className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <HiOutlineLogout className="text-xl" />
              {isSidebarOpen && <span className="ml-3">Sair</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <HiOutlineMenu className="text-xl" />
            </button>
            
            <div className="lg:hidden flex-1 text-center">
              <h1 className="text-xl font-semibold text-gray-800">Mercado Admin</h1>
            </div>
            
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-800">
                {location.pathname.includes('/admin/dashboard') && 'Dashboard'}
                {location.pathname.includes('/admin/products') && 'Gerenciamento de Produtos'}
                {location.pathname.includes('/admin/categories') && 'Gerenciamento de Categorias'}
                {location.pathname.includes('/admin/carousel') && 'Gerenciamento de Carrossel'}
                {location.pathname.includes('/admin/tracking') && 'Rastreamento'}
                {location.pathname.includes('/admin/users') && 'Gerenciamento de Usuários'}
                {location.pathname.includes('/admin/importer') && 'Importar Produtos'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                  <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay para fechar menu mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 