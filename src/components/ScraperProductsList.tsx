import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Product } from '../types/product';
import toast from 'react-hot-toast';

type ScraperProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  image?: string;
};

type AutoImportStatus = {
  isRunning: boolean;
  importedCount: number;
  lastCheck?: string;
};

type ImportAllProgress = {
  isRunning: boolean;
  total: number;
  imported: number;
  failed: number;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'canceled';
  startTime: string | null;
  endTime: string | null;
  lastError: string | null;
  currentBatch?: number;
  batchSize?: number;
  estimatedTotal?: number | string;
  elapsed?: {
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
  };
  estimate?: {
    rate: string;
    remaining: {
      hours: number;
      minutes: number;
      seconds: number;
      formatted: string;
    };
  };
};

// Constante para o caminho do placeholder
const LOCAL_FALLBACK_IMAGE = '/img/placeholder-product.jpg';
// URL de CDN confiável para fallback secundário
const CDN_FALLBACK_IMAGE = 'https://dummyimage.com/300x200/e0e0e0/ffffff&text=Sem+Imagem';

const ScraperProductsList = () => {
  const [products, setProducts] = useState<ScraperProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({});
  const [autoImportStatus, setAutoImportStatus] = useState<AutoImportStatus>({
    isRunning: false,
    importedCount: 0
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(LOCAL_FALLBACK_IMAGE);
  const [importedProducts, setImportedProducts] = useState<string[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para importação em massa
  const [importAllProgress, setImportAllProgress] = useState<ImportAllProgress>({
    isRunning: false,
    total: 0,
    imported: 0,
    failed: 0,
    status: 'idle',
    startTime: null,
    endTime: null,
    lastError: null
  });
  const [importAllLoading, setImportAllLoading] = useState(false);

  // Handler para lidar com erros de carregamento de imagens
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Se a imagem local falhar, usar o CDN de fallback
    if (e.currentTarget.src.includes(LOCAL_FALLBACK_IMAGE)) {
      e.currentTarget.src = CDN_FALLBACK_IMAGE;
    } else {
      // Tentar usar a imagem local primeiro
      e.currentTarget.src = LOCAL_FALLBACK_IMAGE;
    }
  };

  useEffect(() => {
    // Verificar o status da importação automática ao carregar o componente
    fetchAutoImportStatus();
    
    // Verificar status da importação em massa
    fetchImportAllStatus();
    
    // Configurar um intervalo para verificar o status a cada 30 segundos
    const statusInterval = setInterval(() => {
      fetchAutoImportStatus();
      // Se a importação em massa estiver em andamento, verificar também seu status
      if (importAllProgress.isRunning) {
        fetchImportAllStatus();
      }
    }, 30000);
    
    return () => clearInterval(statusInterval);
  }, [importAllProgress.isRunning]);

  const fetchAutoImportStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await axios.get('http://localhost:3000/scraper/auto-import/status');
      setAutoImportStatus({
        ...response.data,
        lastCheck: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Erro ao buscar status da importação automática:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const toggleAutoImport = async () => {
    try {
      setStatusLoading(true);
      const endpoint = autoImportStatus.isRunning ? 
        'http://localhost:3000/scraper/auto-import/stop' : 
        'http://localhost:3000/scraper/auto-import/start';
      
      await axios.post(endpoint);
      fetchAutoImportStatus();
    } catch (error) {
      console.error('Erro ao alterar status da importação automática:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const runAutoImportNow = async () => {
    try {
      setStatusLoading(true);
      await axios.post('http://localhost:3000/scraper/auto-import/run-now');
      fetchAutoImportStatus();
    } catch (error) {
      console.error('Erro ao executar importação automática:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchScrapedProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usando o endpoint que implementamos no scraper
      const response = await axios.get('http://localhost:3000/scraper/products');
      
      console.log('Resposta do scraper:', response.data);
      
      if (response.data.success && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        setError('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar produtos do scraper:', err);
      setError('Falha ao conectar com o servidor de scraping. Verifique se o servidor está rodando com "npm run server".');
    } finally {
      setLoading(false);
    }
  };

  const getLocalImageUrl = (imageUrl: string | undefined, title: string, category: string): string => {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('apoioentrega.vteximg.com.br')) {
      console.log('Preservando URL original de apoioentrega:', imageUrl);
      return imageUrl;
    }
    return LOCAL_FALLBACK_IMAGE;
  };

  const importProduct = useCallback(async (product: ScraperProduct) => {
    setIsLoading(true);
    try {
      console.log('Iniciando importação do produto:', {
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        imageUrl: product.image || (product.images && product.images[0])
      });
      
      // Verificar se a imagem é de apoioentrega.vteximg.com.br e preservá-la
      let imageUrl = product.images && product.images[0] ? product.images[0] : product.image;
      console.log('URL da imagem original:', imageUrl);
      
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('apoioentrega.vteximg.com.br')) {
        console.log('Preservando URL original de apoioentrega:', imageUrl);
      } else {
        // Para outras fontes, processar normalmente
        imageUrl = getLocalImageUrl(product.image, product.title, product.category);
        console.log('URL da imagem após processamento:', imageUrl);
      }
      
      // Garantir que a categoria está definida e limpa
      const category = (product.category || 'Outros').replace(/\s*>\s*$/, '').trim();
      console.log('Categoria processada:', category);
      
      // Preparar produto para importação
      const productToImport = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        category: category,
        images: imageUrl ? [imageUrl] : [],
        stock: 999,
        qtd: 1,
        source: 'importado',
        options: {
          colors: [],
          sizes: [],
          weights: []
        }
      };
      
      console.log('Produto preparado para importação:', productToImport);
      
      // Usar a URL completa para a API
      const response = await axios.post('http://localhost:3000/api/import-product', productToImport);
      
      console.log('Resposta do servidor:', response.data);
      
      if (response.status === 200) {
        const importedProduct = response.data;
        console.log('Produto importado com sucesso:', importedProduct);
        
        toast.success(`Produto "${product.title}" importado com sucesso!`);
        
        // Marcar como importado na lista
        setImportedProducts(prev => [...prev, product.id]);
        setImportStatus(prev => ({
          ...prev,
          [product.id]: 'success'
        }));
        
        // Adicionar ao cache e atualizar contagem
        setProductCount(prev => prev + 1);
      } else {
        console.error('Erro na resposta ao importar produto:', response);
        setImportStatus(prev => ({
          ...prev,
          [product.id]: 'error'
        }));
        toast.error(`Falha ao importar "${product.title}": ${response.data?.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      console.error('Erro ao importar produto:', error);
      
      // Melhorar a mensagem de erro com base no tipo de erro
      let errorMessage = 'Erro desconhecido';
      
      if (error.response) {
        // Erro de resposta do servidor (4xx, 5xx)
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        console.error(`Erro ${statusCode} do servidor:`, {
          status: statusCode,
          data: responseData,
          headers: error.response.headers
        });
        
        if (statusCode === 409) {
          errorMessage = 'Produto já existe no sistema';
        } else if (statusCode === 400) {
          errorMessage = `Dados inválidos: ${responseData.message || 'Verifique os campos obrigatórios'}`;
          console.error('Detalhes do erro 400:', responseData);
        } else if (statusCode === 500) {
          errorMessage = `Erro interno no servidor: ${responseData.message || 'Tente novamente mais tarde'}`;
        } else {
          errorMessage = `Erro ${statusCode}: ${responseData.message || 'Falha na requisição'}`;
        }
      } else if (error.request) {
        // Erro de conexão (sem resposta)
        console.error('Erro de conexão - sem resposta:', error.request);
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
      } else {
        // Outros erros
        console.error('Erro ao configurar requisição:', error.message);
        errorMessage = `Erro: ${error.message}`;
      }
      
      setImportStatus(prev => ({
        ...prev,
        [product.id]: 'error'
      }));
      toast.error(`Falha ao importar "${product.title}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [setProductCount, setImportedProducts]);

  // Funções para a importação em massa
  const fetchImportAllStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/scraper/import-all-products/status');
      if (response.data && response.data.success) {
        setImportAllProgress(response.data.progress);
      }
    } catch (error) {
      console.error('Erro ao buscar status da importação em massa:', error);
    }
  };

  const startImportAllProducts = async () => {
    try {
      setImportAllLoading(true);
      // Configurações padrão
      const config = {
        batchSize: 20,
        delayBetweenBatches: 3000
      };
      
      const response = await axios.post('http://localhost:3000/scraper/import-all-products', config);
      
      if (response.data && response.data.success) {
        toast.success('Importação em massa iniciada com sucesso!');
        setImportAllProgress(response.data.progress);
        // Iniciar verificação contínua do status
        const statusCheckInterval = setInterval(async () => {
          if (importAllProgress.isRunning) {
            await fetchImportAllStatus();
          } else {
            clearInterval(statusCheckInterval);
          }
        }, 5000);
      }
    } catch (error: any) {
      console.error('Erro ao iniciar importação em massa:', error);
      toast.error(`Erro ao iniciar importação: ${error.response?.data?.message || error.message}`);
    } finally {
      setImportAllLoading(false);
    }
  };

  const cancelImportAllProducts = async () => {
    try {
      setImportAllLoading(true);
      const response = await axios.post('http://localhost:3000/scraper/import-all-products/cancel');
      
      if (response.data && response.data.success) {
        toast.success('Importação em massa cancelada com sucesso!');
        setImportAllProgress(response.data.progress);
      }
    } catch (error: any) {
      console.error('Erro ao cancelar importação em massa:', error);
      toast.error(`Erro ao cancelar importação: ${error.response?.data?.message || error.message}`);
    } finally {
      setImportAllLoading(false);
    }
  };

  // Renderizar a barra de progresso
  const renderProgressBar = (current: number, total: number | string) => {
    // Se o total é infinito ou desconhecido
    if (total === '∞' || total === Infinity) {
      return (
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div 
            className="bg-blue-600 h-4 rounded-full text-xs text-white flex items-center justify-center"
            style={{ width: '100%' }}
          >
            {current} produtos importados
          </div>
        </div>
      );
    }
    
    // Se temos um total definido
    const totalNum = typeof total === 'string' ? parseInt(total, 10) : total;
    if (isNaN(totalNum)) return null;
    
    const percentage = Math.min(100, Math.round((current / totalNum) * 100));
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
        <div 
          className="bg-blue-600 h-4 rounded-full text-xs text-white flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
          {percentage}% ({current}/{totalNum})
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      {/* Painel de importação em massa */}
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Importação em Massa</h2>
        
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="space-y-2">
              <p className="flex items-center">
                Status: 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  importAllProgress.status === 'running' 
                    ? 'bg-blue-100 text-blue-800' 
                    : importAllProgress.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : importAllProgress.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {importAllProgress.status === 'running' 
                    ? 'Em andamento' 
                    : importAllProgress.status === 'completed'
                    ? 'Concluída'
                    : importAllProgress.status === 'failed'
                    ? 'Falhou'
                    : importAllProgress.status === 'canceled'
                    ? 'Cancelada'
                    : 'Inativa'}
                </span>
              </p>
              
              {importAllProgress.isRunning && (
                <>
                  <p>Lote atual: <span className="font-medium">{importAllProgress.currentBatch || 1}</span></p>
                  <p>Produtos encontrados: <span className="font-medium">{importAllProgress.total}</span></p>
                  <p>Produtos importados: <span className="font-medium">{importAllProgress.imported}</span></p>
                  <p>Falhas: <span className="font-medium">{importAllProgress.failed}</span></p>
                  
                  {importAllProgress.elapsed && (
                    <p>Tempo decorrido: <span className="font-medium">{importAllProgress.elapsed.formatted}</span></p>
                  )}
                  
                  {importAllProgress.estimate && (
                    <>
                      <p>Taxa de importação: <span className="font-medium">{importAllProgress.estimate.rate} produtos/segundo</span></p>
                      <p>Tempo restante estimado: <span className="font-medium">{importAllProgress.estimate.remaining.formatted}</span></p>
                    </>
                  )}
                </>
              )}
              
              {importAllProgress.lastError && (
                <p className="text-red-600">Último erro: {importAllProgress.lastError}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {!importAllProgress.isRunning ? (
                <button 
                  onClick={startImportAllProducts}
                  disabled={importAllLoading || autoImportStatus.isRunning}
                  className={`py-2 px-4 rounded font-medium ${
                    importAllLoading || autoImportStatus.isRunning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {importAllLoading ? 'Processando...' : 'Importar Todos os Produtos'}
                </button>
              ) : (
                <button 
                  onClick={cancelImportAllProducts}
                  disabled={importAllLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                >
                  {importAllLoading ? 'Processando...' : 'Cancelar Importação'}
                </button>
              )}
            </div>
          </div>
          
          {/* Barra de progresso */}
          {importAllProgress.isRunning && renderProgressBar(
            importAllProgress.imported,
            importAllProgress.estimatedTotal || importAllProgress.total || '∞'
          )}
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  A importação em massa busca e importa todos os produtos disponíveis na API. Este processo pode levar muito tempo dependendo da quantidade de produtos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de status da importação automática */}
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Importação Automática</h2>
        
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="space-y-2">
            <p className="flex items-center">
              Status: 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${autoImportStatus.isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {autoImportStatus.isRunning ? 'Ativo' : 'Inativo'}
              </span>
            </p>
            <p>Produtos importados: <span className="font-medium">{autoImportStatus.importedCount}</span></p>
            {autoImportStatus.lastCheck && <p className="text-sm text-gray-500">Última verificação: {autoImportStatus.lastCheck}</p>}
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={toggleAutoImport}
              disabled={statusLoading || importAllProgress.isRunning}
              className={`py-2 px-4 rounded font-medium ${
                statusLoading || importAllProgress.isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : autoImportStatus.isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {statusLoading 
                ? 'Processando...' 
                : autoImportStatus.isRunning 
                  ? 'Parar Importação' 
                  : 'Iniciar Importação'}
            </button>
            
            <button 
              onClick={runAutoImportNow}
              disabled={statusLoading || importAllProgress.isRunning}
              className={`${
                statusLoading || importAllProgress.isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
              } font-medium py-2 px-4 rounded`}
            >
              Importar Agora
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                A importação automática busca novos produtos a cada 5 minutos e adiciona ao catálogo da loja automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Produtos do Apoio Entregas</h2>
        <button
          onClick={fetchScrapedProducts}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Carregando..." : "Buscar Produtos"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-4 shadow-sm">
              <div className="h-48 overflow-hidden mb-2">
                {product.images && product.images[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <img 
                    src={LOCAL_FALLBACK_IMAGE}
                    alt={product.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = CDN_FALLBACK_IMAGE;
                    }}
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1">{product.title}</h3>
              <p className="text-gray-700 mb-2 text-sm line-clamp-2">{product.description}</p>
              <p className="text-green-600 font-bold mb-3">R$ {product.price.toFixed(2)}</p>
              <button
                onClick={() => importProduct(product)}
                disabled={importStatus[product.id] === 'loading' || importStatus[product.id] === 'success'}
                className={`w-full py-2 px-4 rounded text-white font-medium ${
                  importStatus[product.id] === 'success'
                    ? 'bg-green-500'
                    : importStatus[product.id] === 'loading'
                    ? 'bg-gray-400'
                    : importStatus[product.id] === 'error'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {importStatus[product.id] === 'success'
                  ? '✓ Importado'
                  : importStatus[product.id] === 'loading'
                  ? 'Importando...'
                  : importStatus[product.id] === 'error'
                  ? 'Tentar Novamente'
                  : 'Importar Produto'}
              </button>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum produto encontrado. Clique em "Buscar Produtos" para começar.</p>
        </div>
      )}
    </div>
  );
};

export default ScraperProductsList; 