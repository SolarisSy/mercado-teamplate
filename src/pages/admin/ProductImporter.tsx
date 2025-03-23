import { useEffect, useState } from 'react';
import ScraperProductsList from '../../components/ScraperProductsList';

const ProductImporter = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificação simples de admin - em um sistema real, isso seria mais robusto
    const userRole = localStorage.getItem('userRole');
    setIsAdmin(userRole === 'admin');
  }, []);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Acesso Negado</p>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 pb-2 border-b">Importar Produtos</h1>
      
      <div className="mb-6">
        <p className="mb-4">
          Esta ferramenta permite importar produtos de outras lojas para o seu catálogo.
          Os produtos são extraídos do site <strong>apoioentrega.com</strong> em tempo real.
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Importante:</strong> Certifique-se de que o servidor backend está rodando com o comando <code className="bg-gray-100 px-1">npm run server</code> para que a importação funcione corretamente.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ScraperProductsList />
    </div>
  );
};

export default ProductImporter; 