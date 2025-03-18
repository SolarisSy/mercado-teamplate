import { useState, useEffect } from 'react';
import customFetch from '../../utils/customFetch';
import toast from 'react-hot-toast';
import { HiPencil, HiTrash, HiPlus, HiCheck } from 'react-icons/hi';
import { nanoid } from 'nanoid';
import { useCategories, Category } from '../../context/CategoryContext';

interface Product {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
}

const CategoriesManager = () => {
  const { categories, refreshCategories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' ou 'products'
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editingCategory) {
      fetchProductsByCategory(editingCategory.slug);
      fetchAllProducts();
    }
  }, [editingCategory]);

  const fetchAllProducts = async () => {
    try {
      const response = await customFetch.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Falha ao carregar produtos');
    }
  };

  const fetchProductsByCategory = async (categorySlug: string) => {
    try {
      const response = await customFetch.get(`/products?category=${categorySlug}`);
      setCategoryProducts(response.data);
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Falha ao carregar produtos da categoria');
    }
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
    setEditingCategory(null);
    setActiveTab('details');
  };

  const handleEdit = (category: Category) => {
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setDisplayOrder(category.displayOrder);
    setIsActive(category.isActive);
    setImagePreview(category.image);
    setEditingCategory(category);
    setShowForm(true);
    setActiveTab('details');
  };

  const handleManageProducts = (category: Category) => {
    setEditingCategory(category);
    setActiveTab('products');
    setShowForm(true);
    
    // Buscar produtos da categoria
    const fetchCategoryProducts = async () => {
      try {
        setIsLoading(true);
        const response = await customFetch.get(`/products?category=${category.slug}`);
        setCategoryProducts(response.data);
      } catch (error) {
        toast.error('Falha ao carregar produtos da categoria');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Buscar todos os produtos para adicionar à categoria
    const fetchAllProducts = async () => {
      try {
        const response = await customFetch.get('/products');
        setProducts(response.data);
      } catch (error) {
        toast.error('Falha ao carregar produtos');
      }
    };
    
    fetchCategoryProducts();
    fetchAllProducts();
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder(0);
    setIsActive(true);
    setImagePreview('');
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setEditingCategory(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Preview da imagem
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate slug if not editing an existing category
    if (!editingCategory) {
      setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !slug) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      const imageUrl = editingCategory?.image || '';
                
      const categoryData = {
        name,
        slug,
        description,
        image: imagePreview || imageUrl,
        displayOrder,
        isActive,
        updatedAt: new Date().toISOString()
      };
      
      if (editingCategory) {
        // Atualizar categoria existente
        await customFetch.patch(`/categories/${editingCategory.id}`, categoryData);
        toast.success('Categoria atualizada com sucesso');
      } else {
        // Criar nova categoria
        const newCategory = {
          id: nanoid(),
          ...categoryData,
          createdAt: new Date().toISOString()
        };
        await customFetch.post('/categories', newCategory);
        toast.success('Categoria criada com sucesso');
      }
      
      // Atualizar lista de categorias
      await refreshCategories();
      
      // Resetar formulário
      setShowForm(false);
      resetForm();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Falha ao salvar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        setIsLoading(true);
        await customFetch.delete(`/categories/${id}`);
        toast.success('Categoria excluída com sucesso');
        await refreshCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Falha ao excluir categoria');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddProductToCategory = async (product: Product) => {
    if (!editingCategory) return;
    
    try {
      setIsLoading(true);
      
      // Atualizar o produto com a nova categoria
      await customFetch.patch(`/products/${product.id}`, {
        category: editingCategory.slug
      });
      
      // Atualizar a lista de produtos da categoria
      setCategoryProducts(prev => [...prev, { ...product, category: editingCategory.slug }]);
      
      // Remover o produto da lista de produtos disponíveis
      setProducts(prev => prev.filter(p => p.id !== product.id));
      
      toast.success(`Produto "${product.title}" adicionado à categoria`);
    } catch (error) {
      toast.error('Falha ao adicionar produto à categoria');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveProduct = async (product: Product) => {
    try {
      setIsLoading(true);
      
      // Atualizar o produto com uma categoria vazia ou padrão
      await customFetch.patch(`/products/${product.id}`, {
        category: ''
      });
      
      // Remover o produto da lista de produtos da categoria
      setCategoryProducts(prev => prev.filter(p => p.id !== product.id));
      
      // Adicionar o produto de volta à lista de produtos disponíveis
      setProducts(prev => [...prev, { ...product, category: '' }]);
      
      toast.success(`Produto "${product.title}" removido da categoria`);
    } catch (error) {
      toast.error('Falha ao remover produto da categoria');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar produtos que não estão na categoria atual
  const filteredProducts = products.filter(product => {
    // Filtrar por termo de busca
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar produtos que não estão na categoria atual
    const notInCategory = !categoryProducts.some(cp => cp.id === product.id);
    
    return matchesSearch && notInCategory;
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciamento de Categorias</h2>
        <button 
          onClick={handleAddNew}
          className="bg-secondaryBrown text-white px-4 py-2 rounded-md flex items-center"
        >
          <HiPlus className="mr-2" /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {editingCategory ? `Editar Categoria: ${editingCategory.name}` : 'Nova Categoria'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Abas para alternar entre detalhes e produtos */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-secondaryBrown text-secondaryBrown' : 'text-gray-500'}`}
              onClick={() => setActiveTab('details')}
            >
              Detalhes da Categoria
            </button>
            {editingCategory && (
              <button
                className={`px-4 py-2 ${activeTab === 'products' ? 'border-b-2 border-secondaryBrown text-secondaryBrown' : 'text-gray-500'}`}
                onClick={() => setActiveTab('products')}
              >
                Gerenciar Produtos
              </button>
            )}
          </div>
          
          {/* Conteúdo da aba ativa */}
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome*
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug*
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identificador único para URLs (apenas letras minúsculas, números e hífens)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-secondaryBrown border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Categoria Ativa
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem da Categoria
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview da categoria" 
                      className="w-40 h-40 object-cover border rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-secondaryBrown text-white rounded-md disabled:opacity-70"
                >
                  {isLoading 
                    ? (editingCategory ? 'Atualizando...' : 'Criando...') 
                    : (editingCategory ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Produtos na categoria */}
              <div>
                <h3 className="text-lg font-medium mb-4">Produtos nesta Categoria</h3>
                {categoryProducts.length > 0 ? (
                  <div className="space-y-4">
                    {categoryProducts.map(product => (
                      <div key={product.id} className="border rounded-md p-3 flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-12 h-12 object-cover rounded-md mr-3"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium truncate">{product.title}</p>
                          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveProduct(product)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isLoading}
                        >
                          <HiTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum produto nesta categoria</p>
                )}
              </div>
              
              {/* Adicionar produtos à categoria */}
              <div>
                <h3 className="text-lg font-medium mb-2">Adicionar Produtos</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="border rounded-md p-3 flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-12 h-12 object-cover rounded-md mr-3"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium truncate">{product.title}</p>
                          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => handleAddProductToCategory(product)}
                          className="text-green-500 hover:text-green-700"
                          disabled={isLoading}
                        >
                          <HiCheck />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum produto disponível para adicionar</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="h-12 w-12 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{category.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap">{category.displayOrder}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <HiPencil className="text-xl" />
                    </button>
                    <button 
                      onClick={() => handleManageProducts(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <HiTrash className="text-xl" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma categoria encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesManager; 