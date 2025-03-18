import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectPath?: string;
};

const ProtectedRoute = ({ 
  children, 
  redirectPath = '/login' 
}: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica se há um usuário no localStorage
    const storedUser = localStorage.getItem('user');
    const isUserStored = !!storedUser;
    
    // Considera autenticado se tiver um usuário no Firebase OU no localStorage
    setIsAuthenticated(!!currentUser || isUserStored);
    
    // Se não estiver autenticado, mostra uma mensagem
    if (!loading && !currentUser && !isUserStored) {
      toast.error('You must be logged in to access this page');
    }
  }, [currentUser, loading]);

  // Se estiver carregando, mostra um indicador de carregamento
  if (loading || isAuthenticated === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Se não estiver autenticado, redireciona
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Se estiver autenticado, permite o acesso
  return <>{children}</>;
};

export default ProtectedRoute; 