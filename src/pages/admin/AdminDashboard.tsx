import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineShoppingBag, 
  HiOutlineUsers, 
  HiOutlineLogout,
  HiOutlineTag
} from 'react-icons/hi';

const AdminDashboard = () => {
  const { adminLogout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-md ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className={`text-2xl font-bold text-secondaryBrown ${!isSidebarOpen && 'hidden'}`}>Admin Panel</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>
        <nav className="mt-6">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200"
          >
            <HiOutlineViewGrid className="text-xl" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link 
            to="/admin/products" 
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200"
          >
            <HiOutlineShoppingBag className="text-xl" />
            {isSidebarOpen && <span className="ml-3">Produtos</span>}
          </Link>
          <Link 
            to="/admin/categories" 
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200"
          >
            <HiOutlineTag className="text-xl" />
            {isSidebarOpen && <span className="ml-3">Categorias</span>}
          </Link>
          <Link 
            to="/admin/users" 
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200"
          >
            <HiOutlineUsers className="text-xl" />
            {isSidebarOpen && <span className="ml-3">Usuários</span>}
          </Link>
          <button 
            onClick={adminLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200"
          >
            <HiOutlineLogout className="text-xl" />
            {isSidebarOpen && <span className="ml-3">Sair</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 