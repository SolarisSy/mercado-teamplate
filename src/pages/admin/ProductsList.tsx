import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import customFetch from '../../axios/custom';
import toast from 'react-hot-toast';
import { 
  HiPencil, 
  HiTrash, 
  HiPlus, 
  HiEye, 
  HiSearch, 
  HiFilter, 
  HiChevronLeft, 
  HiChevronRight,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

const ITEMS_PER_PAGE = 8;

const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await customFetch.get('/products');
        setProducts(response.data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(response.data.map((product: any) => product.category))
        ).filter(Boolean) as string[];
        
        setCategories(uniqueCategories);
      } catch (error) {
        toast.error('Falha ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on current filters
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.title.toLowerCase().includes(searchLower) || 
          product.description?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter === 'inStock') {
      result = result.filter(product => product.stock > 0);
    } else if (stockFilter === 'lowStock') {
      result = result.filter(product => product.stock > 0 && product.stock <= 5);
    } else if (stockFilter === 'outOfStock') {
      result = result.filter(product => product.stock === 0);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareResult = 0;
      
      if (sortBy === 'title') {
        compareResult = a.title.localeCompare(b.title);
      } else if (sortBy === 'price') {
        compareResult = a.price - b.price;
      } else if (sortBy === 'stock') {
        compareResult = a.stock - b.stock;
      } else if (sortBy === 'popularity') {
        compareResult = (a.popularity || 0) - (b.popularity || 0);
      }
      
      return sortOrder === 'asc' ? compareResult : -compareResult;
    });
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await customFetch.delete(`/products/${id}`);
        setProducts(products.filter(product => product.id !== id));
        toast.success('Produto excluído com sucesso');
      } catch (error) {
        toast.error('Falha ao excluir produto');
      }
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const StockIndicator = ({ stock }: { stock: number }) => {
    let colorClass = '';
    let label = '';
    
    if (stock === 0) {
      colorClass = 'bg-red-100 text-red-800';
      label = 'Esgotado';
    } else if (stock <= 5) {
      colorClass = 'bg-yellow-100 text-yellow-800';
      label = 'Baixo';
    } else {
      colorClass = 'bg-green-100 text-green-800';
      label = 'Em estoque';
    }
    
    return (
      <div className="flex items-center">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
          {label}
        </span>
        <span className="ml-2 text-gray-500">{stock}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondaryBrown"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Produtos</h2>
        <Link 
          to="/admin/products/new" 
          className="bg-secondaryBrown text-white px-4 py-2 rounded-md flex items-center hover:bg-opacity-90 transition-colors"
        >
          <HiPlus className="mr-2" /> Adicionar Produto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Stock Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">Todos os estoques</option>
              <option value="inStock">Em estoque</option>
              <option value="lowStock">Estoque baixo</option>
              <option value="outOfStock">Esgotado</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex space-x-2">
            <select
              className="flex-1 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-secondaryBrown focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Nome</option>
              <option value="price">Preço</option>
              <option value="stock">Estoque</option>
              <option value="popularity">Popularidade</option>
            </select>
            <button
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none hover:bg-gray-50"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white shadow-md rounded-md p-8 text-center">
          <HiOutlineExclamationCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum produto encontrado</h3>
          <p className="text-gray-500">Tente ajustar seus filtros ou adicione novos produtos.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={product.images && product.images.length > 0 
                            ? (product.images.find(img => img.isPrimary)?.url || product.images[0]?.url) 
                            : product.image} 
                          alt={product.title} 
                          className="h-16 w-16 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.svg';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.title}</div>
                        {product.brand && (
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        )}
                        {product.isOrganic && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Orgânico
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{formatCurrency(product.price)}</div>
                        {product.discount && product.discount > 0 && (
                          <div className="text-sm text-red-600">-{product.discount}%</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StockIndicator stock={product.stock} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <Link 
                            to={`/admin/products/view/${product.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Visualizar produto"
                          >
                            <HiEye className="text-xl" />
                          </Link>
                          <Link 
                            to={`/admin/products/edit/${product.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                            title="Editar produto"
                          >
                            <HiPencil className="text-xl" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Excluir produto"
                          >
                            <HiTrash className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-md shadow-md">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                </span> de <span className="font-medium">{filteredProducts.length}</span> produtos
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HiChevronLeft className="text-xl" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-secondaryBrown text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HiChevronRight className="text-xl" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsList; 