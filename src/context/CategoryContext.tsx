import React, { createContext, useContext, useState, useEffect } from 'react';
import customFetch from '../utils/customFetch';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await customFetch.get('/categories');
      
      // Verificar se response.data é um array
      if (!Array.isArray(response.data)) {
        console.error('Dados de categorias não são um array:', response.data);
        setCategories([]);
        setError('Formato de dados inválido');
        return;
      }

      // Ordenar por displayOrder (apenas se for um array)
      const sortedCategories = [...response.data].sort(
        (a: Category, b: Category) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      
      // Filtrar apenas categorias ativas
      const activeCategories = sortedCategories.filter((cat: Category) => cat.isActive);
      setCategories(activeCategories);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Falha ao carregar categorias');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar categorias na inicialização
  useEffect(() => {
    fetchCategories();
  }, []);

  // Função para atualizar categorias quando necessário
  const refreshCategories = async () => {
    await fetchCategories();
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, error, refreshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}; 