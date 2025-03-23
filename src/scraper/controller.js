// Este é um wrapper para o ScraperController para ser importado pelo server.js
// Como o server.js está usando CommonJS e não consegue importar arquivos TypeScript diretamente
const axios = require('axios');
const NodeCache = require('node-cache');

/**
 * Controller para o scraper
 */
class ScraperController {
  constructor() {
    this.products = [];
    this.cache = {};
    this.productMemory = new Set();
    this.autoImportStatus = false; // Garantir que importação automática inicie desligada
    this.autoImportTimer = null;
    this.cache = new NodeCache({ stdTTL: 300 }); // Cache por 5 minutos
    this.baseUrl = 'https://www.apoioentrega.com.br';
    this.autoImportInterval = null; // Inicialmente nulo (desligado)
    this.importedProducts = new Set(); // Conjunto para rastrear produtos já importados
    this.initialize();
  }

  /**
   * Inicializa o controller
   */
  async initialize() {
    console.log('Inicializando ScraperController...');
    // NÃO iniciar a importação automática por padrão
    console.log('Importação automática inicialmente desligada. Use o botão "Iniciar Importação" para ativá-la.');
  }

  /**
   * Inicia o processo de importação automática
   */
  startAutoImport() {
    console.log('Iniciando serviço de importação automática...');
    // Executar importação imediatamente e depois a cada 5 minutos
    this.runAutoImport();
    this.autoImportInterval = setInterval(() => this.runAutoImport(), 5 * 60 * 1000);
  }

  /**
   * Para o processo de importação automática
   */
  stopAutoImport() {
    if (this.autoImportInterval) {
      clearInterval(this.autoImportInterval);
      this.autoImportInterval = null;
      console.log('Serviço de importação automática parado');
    }
  }

  /**
   * Executa uma rodada de importação automática
   */
  async runAutoImport() {
    console.log('Executando importação automática de produtos...');
    try {
      // Extrair produtos do site alvo
      const products = await this.extractProducts();
      console.log(`Encontrados ${products.length} produtos para verificação`);
      
      // Buscar produtos existentes para comparação
      const existingProducts = await this.getExistingProducts();
      console.log(`Existem ${existingProducts.length} produtos no banco de dados`);
      
      // Criar conjunto com IDs completos e IDs originais para verificação mais robusta
      const existingProductIds = new Set();
      const existingOriginalIds = new Set();
      
      existingProducts.forEach(p => {
        existingProductIds.add(p.id); // Adicionar ID completo
        
        // Extrair e adicionar o ID original (sem o prefixo 'imported_')
        const originalId = p.id && p.id.startsWith('imported_') 
          ? p.id.replace('imported_', '') 
          : null;
        
        if (originalId) {
          existingOriginalIds.add(originalId);
        }
      });
      
      // Filtrar apenas produtos que não existem em nenhum formato
      const newProducts = products.filter(p => {
        const fullId = `imported_${p.id}`;
        return !existingProductIds.has(fullId) && !existingOriginalIds.has(p.id);
      });
      
      console.log(`${newProducts.length} produtos novos encontrados para importação`);
      
      // Importar cada produto novo
      let importedCount = 0;
      for (const product of newProducts) {
        try {
          await this.importProductToStore(product);
          importedCount++;
        } catch (importError) {
          console.error(`Erro ao importar produto ${product.id}:`, importError.message);
          // Continuar com o próximo produto em caso de erro
        }
      }
      
      console.log(`Importação automática concluída. ${importedCount} produtos importados com sucesso.`);
    } catch (error) {
      console.error('Erro durante importação automática:', error.message);
    }
  }

  /**
   * Busca produtos existentes na loja
   * @returns {Promise<Array>} Lista de produtos da loja
   */
  async getExistingProducts() {
    try {
      const response = await axios.get('http://localhost:3000/products');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos existentes:', error.message);
      return [];
    }
  }

  /**
   * Importa um produto para a loja
   * @param {Object} product Produto a ser importado
   */
  async importProductToStore(product) {
    try {
      console.log('Processando produto para importação:', {
        id: product.id,
        title: product.title
      });

      // Garantir que temos os dados mínimos necessários
      if (!product.id || !product.title) {
        throw new Error('Dados obrigatórios faltando para importação do produto');
      }

      // Processar imagens
      let processedImages = [];
      if (Array.isArray(product.images)) {
        processedImages = product.images.map(img => {
          // Se a imagem já é uma URL completa do apoioentrega, preservá-la
          if (img.includes('apoioentrega.vteximg.com.br')) {
            // Remover parâmetros da URL que podem causar problemas
            const cleanUrl = img.split('?')[0];
            // Garantir que a URL use HTTP se não tiver protocolo
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
              return `http://${cleanUrl}`;
            }
            return cleanUrl;
          }
          
          // Se a imagem já é uma URL completa de outra fonte, mantê-la
          if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
          }
          
          // Se é um caminho relativo do apoioentrega, construir a URL completa
          if (img.includes('/arquivos/') || img.includes('/ids/')) {
            const baseUrl = 'http://apoioentrega.vteximg.com.br';
            return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
          }
          
          // Para outros casos, usar o placeholder
          return '/img/placeholder-product.jpg';
        });
      }

      // Se não houver imagens, usar o placeholder local
      if (processedImages.length === 0) {
        processedImages = ['/img/placeholder-product.jpg'];
      }

      // Criar o produto formatado para o sistema
      const systemProduct = {
        id: `imported_${product.id}`, // Adicionar prefixo para evitar conflitos
        title: product.title,
        description: product.description || product.title,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        category: product.category || 'Importado',
        image: processedImages[0], // Imagem principal
        images: processedImages, // Array com todas as imagens
        stock: product.stock || 999,
        source: 'apoioentrega',
        importedAt: new Date().toISOString(),
        // Campos adicionais para rastreamento
        originalId: product.id,
        originalImages: product.images, // Preservar URLs originais
        lastUpdated: new Date().toISOString()
      };

      // Validar o produto processado
      const validationErrors = [];
      if (!systemProduct.id) validationErrors.push('ID é obrigatório');
      if (!systemProduct.title) validationErrors.push('Título é obrigatório');
      if (!systemProduct.image) validationErrors.push('Imagem principal é obrigatória');
      if (!Array.isArray(systemProduct.images)) validationErrors.push('Images deve ser um array');
      if (typeof systemProduct.price !== 'number') validationErrors.push('Preço deve ser um número');

      if (validationErrors.length > 0) {
        throw new Error(`Erro de validação: ${validationErrors.join(', ')}`);
      }

      console.log('Produto processado com sucesso:', {
        id: systemProduct.id,
        title: systemProduct.title,
        imagesCount: systemProduct.images.length
      });

      // Salvar o produto no banco de dados
      console.log('Enviando produto para o banco de dados:', {
        id: systemProduct.id,
        title: systemProduct.title
      });

      const response = await axios.post('http://localhost:3000/products', systemProduct);

      console.log('Produto salvo com sucesso:', {
        id: systemProduct.id,
        responseId: response.data.id,
        status: response.status
      });

      return systemProduct;
    } catch (error) {
      console.error('Erro ao processar produto para importação:', {
        error: error.message,
        productId: product?.id,
        productTitle: product?.title
      });
      throw error;
    }
  }

  /**
   * Extrair produtos do site apoioentrega.com
   * @param {number} limit Limite de produtos a extrair (padrão: 100)
   * @returns {Promise<Array>} Lista de produtos extraídos
   */
  async extractProducts(limit = 100) {
    const cacheKey = `apoioentrega_products_${limit}`;
    
    // Verificar se os produtos estão em cache
    if (this.cache.has(cacheKey)) {
      console.log('Retornando produtos do cache');
      return this.cache.get(cacheKey);
    }

    try {
      // Fazer requisição paginada para API de produtos
      console.log(`Extraindo até ${limit} produtos de apoioentrega.com...`);
      
      let allProducts = [];
      let currentPage = 0;
      const pageSize = 50; // Tamanho máximo recomendado por página
      
      // Loop para buscar produtos em lotes até atingir o limite
      while (allProducts.length < limit) {
        const fromIndex = currentPage * pageSize;
        const toIndex = fromIndex + pageSize - 1;
        
        console.log(`Buscando produtos de ${fromIndex} a ${toIndex}...`);
        
        const response = await axios.get(`${this.baseUrl}/api/catalog_system/pub/products/search`, {
          params: {
            ft: '', // Parâmetro fulltext search vazio para trazer todos os produtos
            O: 'OrderByPriceDESC', // Ordenação por preço decrescente
            _from: fromIndex,
            _to: toIndex,
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.apoioentrega.com.br/',
            'Origin': 'https://www.apoioentrega.com.br',
            'Connection': 'keep-alive'
          },
          timeout: 15000 // Aumentar timeout para 15 segundos para requisições maiores
        });

        console.log(`Resposta da API de produtos (página ${currentPage + 1}):`, response.status);
        
        // Verificar se a resposta é um array
        if (!Array.isArray(response.data)) {
          console.error('Resposta não é um array:', typeof response.data);
          break; // Sair do loop se a resposta não for válida
        }
        
        // Se não retornou produtos, chegamos ao fim da lista
        if (response.data.length === 0) {
          console.log('Não há mais produtos disponíveis');
          break;
        }

        // Mapear os produtos para o formato esperado pelo frontend
        const pageProducts = response.data.map(product => {
          // Extrair imagens
          const images = [];
          if (product.items && product.items.length > 0) {
            const item = product.items[0];
            if (item.images && item.images.length > 0) {
              item.images.forEach(img => {
                if (img.imageUrl) {
                  images.push(img.imageUrl);
                }
              });
            }
          }

          // Extrair preço
          let price = 0;
          if (product.items && 
              product.items[0] && 
              product.items[0].sellers && 
              product.items[0].sellers[0] && 
              product.items[0].sellers[0].commertialOffer) {
            price = product.items[0].sellers[0].commertialOffer.Price || 0;
          }

          // Extrair categoria
          let category = 'Importado';
          if (product.categories && product.categories.length > 0) {
            // Pegar a última categoria (mais específica)
            category = product.categories[product.categories.length - 1]
              .replace(/^\//, '')  // Remove / inicial
              .replace(/\//g, ' > '); // Substitui / por >
          }

          return {
            id: product.productId,
            title: product.productName,
            description: product.description || product.metaTagDescription || product.productName,
            price: price,
            category: category,
            images: images.length > 0 ? images : ['https://via.placeholder.com/300x300?text=Sem+Imagem']
          };
        });

        // Adicionar produtos à lista completa
        allProducts = [...allProducts, ...pageProducts];
        console.log(`Obtidos ${pageProducts.length} produtos na página ${currentPage + 1}, total: ${allProducts.length}`);
        
        // Avançar para a próxima página
        currentPage++;
        
        // Adicionar pequeno delay entre requisições para evitar bloqueios
        if (allProducts.length < limit) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Limitar ao número máximo solicitado
      const products = allProducts.slice(0, limit);
      console.log(`Extraídos ${products.length} produtos com sucesso de um total de ${allProducts.length} encontrados`);

      // Armazenar no cache
      this.cache.set(cacheKey, products);
      return products;
    } catch (error) {
      console.error('Erro ao extrair produtos:', error.message);
      
      // Tentar URL alternativa em caso de erro
      try {
        console.log('Tentando URL alternativa...');
        const response = await axios.get(`${this.baseUrl}/busca?fq=departmentId:100`, {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });
        
        console.log('Resposta da URL alternativa:', response.status);
        
        // Extrair dados dos produtos do HTML
        const html = response.data;
        
        // Extrair produtos do HTML usando regex simples
        const productRegex = /<div class="shelf-item[\s\S]*?data-id="([^"]+)"[\s\S]*?<h3 class="shelf-item__title"><a[^>]*>([^<]+)<\/a><\/h3>[\s\S]*?<div class="shelf-item__price">[\s\S]*?<p[^>]*>R\$ ([0-9,\.]+)<\/p>/g;
        
        const products = [];
        let match;
        while ((match = productRegex.exec(html)) !== null) {
          products.push({
            id: match[1],
            title: match[2].trim(),
            description: match[2].trim(),
            price: parseFloat(match[3].replace('.', '').replace(',', '.')),
            category: 'Produto Apoio Entrega',
            images: ['https://via.placeholder.com/300x300?text=Produto+Apoio']
          });
        }
        
        if (products.length > 0) {
          console.log(`Extraídos ${products.length} produtos da página HTML`);
          this.cache.set(cacheKey, products);
          return products;
        }
      } catch (htmlError) {
        console.error('Erro ao extrair produtos da página HTML:', htmlError.message);
      }
      
      // Dados de exemplo se ambas as tentativas falharem
      return [
        {
          id: 'test-product-1',
          title: 'Produto de Teste 1',
          description: 'Produto extraído do www.apoioentrega.com',
          price: 19.99,
          category: 'Importado',
          images: ['https://picsum.photos/200/300']
        },
        {
          id: 'test-product-2',
          title: 'Produto de Teste 2',
          description: 'Outro produto de teste',
          price: 29.99,
          category: 'Importado',
          images: ['https://picsum.photos/200/300']
        },
        {
          id: 'test-product-3',
          title: 'Teste Scraper API',
          description: 'Produto para testar o scraper. O site alvo pode estar bloqueando nossas requisições ou mudou sua estrutura.',
          price: 39.99,
          category: 'Importado',
          images: ['https://picsum.photos/200/300']
        }
      ];
    }
  }

  /**
   * Extrair detalhes de um produto específico
   * @param {string} productId ID do produto
   * @returns {Promise<Object>} Detalhes do produto
   */
  async extractProductDetails(productId) {
    const cacheKey = `apoioentrega_product_${productId}`;
    
    // Verificar se o produto está em cache
    if (this.cache.has(cacheKey)) {
      console.log(`Retornando produto ${productId} do cache`);
      return this.cache.get(cacheKey);
    }

    try {
      // Tentar obter detalhes do produto pela API
      console.log(`Extraindo detalhes do produto ${productId}...`);
      const response = await axios.get(`${this.baseUrl}/api/catalog_system/pub/products/search?fq=productId:${productId}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.apoioentrega.com.br/',
          'Origin': 'https://www.apoioentrega.com.br'
        },
        timeout: 10000
      });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const productData = response.data[0];
        
        // Extrair imagens
        const images = [];
        if (productData.items && productData.items.length > 0) {
          const item = productData.items[0];
          if (item.images && item.images.length > 0) {
            item.images.forEach(img => {
              if (img.imageUrl) {
                images.push(img.imageUrl);
              }
            });
          }
        }
        
        // Extrair preço
        let price = 0;
        if (productData.items && 
            productData.items[0] && 
            productData.items[0].sellers && 
            productData.items[0].sellers[0] && 
            productData.items[0].sellers[0].commertialOffer) {
          price = productData.items[0].sellers[0].commertialOffer.Price || 0;
        }
        
        const product = {
          id: productId,
          title: productData.productName,
          description: productData.description || productData.metaTagDescription || productData.productName,
          price: price,
          category: productData.categories ? productData.categories[0].replace(/^\//, '') : 'Importado',
          images: images.length > 0 ? images : ['https://via.placeholder.com/300x300?text=Sem+Imagem']
        };
        
        // Armazenar no cache
        this.cache.set(cacheKey, product);
        return product;
      } else {
        throw new Error('Produto não encontrado');
      }
    } catch (error) {
      console.error(`Erro ao extrair detalhes do produto ${productId}:`, error.message);
      
      // Em caso de erro, tentar página do produto
      try {
        console.log(`Tentando obter detalhes da página do produto ${productId}...`);
        const response = await axios.get(`${this.baseUrl}/p/${productId}`, {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });
        
        // Extrair dados do HTML com regex simples
        const html = response.data;
        const titleMatch = /<h1[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]+)<\/h1>/.exec(html);
        const priceMatch = /<strong[^>]*class="[^"]*skuBestPrice[^"]*"[^>]*>R\$\s*([0-9,.]+)<\/strong>/.exec(html);
        const descriptionMatch = /<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(html);
        const imageMatch = /<a[^>]*id="botaoZoom"[^>]*href="([^"]+)"/.exec(html);
        
        if (titleMatch) {
          const product = {
            id: productId,
            title: titleMatch[1].trim(),
            description: descriptionMatch ? descriptionMatch[1].replace(/<[^>]+>/g, ' ').trim() : titleMatch[1].trim(),
            price: priceMatch ? parseFloat(priceMatch[1].replace('.', '').replace(',', '.')) : 0,
            category: 'Produto Apoio Entrega',
            images: imageMatch ? [imageMatch[1]] : ['https://via.placeholder.com/300x300?text=Sem+Imagem']
          };
          
          this.cache.set(cacheKey, product);
          return product;
        }
      } catch (htmlError) {
        console.error(`Erro ao extrair detalhes da página do produto ${productId}:`, htmlError.message);
      }
      
      // Em caso de erro em ambas as tentativas, retornar produto de exemplo
      return {
        id: productId,
        title: `Produto ${productId}`,
        description: 'Detalhes do produto extraído',
        price: 19.99,
        category: 'Importado',
        images: ['https://picsum.photos/200/300']
      };
    }
  }

  /**
   * Registra as rotas do scraper no router do Express
   * @param {*} router - Express router
   */
  registerRoutes(router) {
    console.log('Registrando rotas do scraper...');
    
    // Rota para listar produtos
    router.get('/scraper/products', async (req, res) => {
      try {
        const products = await this.extractProducts();
        
        res.json({
          success: true,
          message: 'Produtos extraídos com sucesso',
          products
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: `Erro ao extrair produtos: ${error.message}`,
          products: []
        });
      }
    });
    
    // Rota para detalhes de um produto
    router.get('/scraper/products/:skuId', async (req, res) => {
      const { skuId } = req.params;
      
      try {
        const product = await this.extractProductDetails(skuId);
        
        res.json({
          success: true,
          product
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: `Erro ao extrair detalhes do produto ${skuId}: ${error.message}`,
          product: null
        });
      }
    });

    // Nova rota para importar um produto individual
    router.post('/api/import-product', async (req, res) => {
      try {
        const product = req.body;
        console.log('Recebendo requisição para importar produto:', {
          receivedData: product,
          bodyType: typeof product,
          hasProduct: !!product
        });
        
        // Validação mais robusta dos dados
        if (!product || typeof product !== 'object') {
          console.error('Produto inválido ou não fornecido no body da requisição');
          return res.status(400).json({
            success: false,
            message: 'Dados do produto não fornecidos ou inválidos',
            receivedType: typeof product
          });
        }

        // Garantir que o produto tenha um ID
        const productId = product.id || product.productId;
        if (!productId) {
          console.error('ID do produto não fornecido:', product);
          return res.status(400).json({
            success: false,
            message: 'ID do produto é obrigatório',
            receivedData: product
          });
        }

        // Garantir que o produto tenha um título
        const productTitle = product.title || product.name || product.productName;
        if (!productTitle) {
          console.error('Título do produto não fornecido:', product);
          return res.status(400).json({
            success: false,
            message: 'Título do produto é obrigatório',
            receivedData: product
          });
        }

        // Normalizar os dados do produto
        const normalizedProduct = {
          ...product,
          id: productId,
          title: productTitle,
          description: product.description || productTitle,
          price: product.price || 0,
          category: product.category || 'Importado',
          images: Array.isArray(product.images) ? product.images : []
        };
        
        // Verificar se o produto já existe
        const existingProducts = await this.getExistingProducts();
        console.log('Produtos existentes encontrados:', existingProducts.length);
        
        const fullId = `imported_${normalizedProduct.id}`;
        const isDuplicate = existingProducts.some(p => p.id === fullId || p.id === normalizedProduct.id);
        
        if (isDuplicate) {
          console.log('Produto duplicado detectado:', fullId);
          return res.status(409).json({
            success: false,
            message: 'Produto já existe no sistema',
            productId: fullId
          });
        }
        
        // Processar e importar o produto
        console.log('Iniciando processamento do produto para importação:', normalizedProduct);
        const importedProduct = await this.importProductToStore(normalizedProduct);
        
        if (!importedProduct) {
          throw new Error('Falha ao processar o produto para importação');
        }

        console.log('Produto processado com sucesso:', {
          id: importedProduct.id,
          title: importedProduct.title
        });
        
        // Adicionar o produto ao banco de dados
        const systemProduct = {
          ...importedProduct,
          id: fullId
        };
        
        try {
          console.log('Enviando produto para o banco de dados:', {
            id: systemProduct.id,
            title: systemProduct.title
          });
          
          const response = await axios.post('http://localhost:3000/products', systemProduct);
          
          if (!response || !response.data) {
            throw new Error('Resposta inválida do banco de dados');
          }
          
          console.log('Produto salvo com sucesso:', {
            id: systemProduct.id,
            responseId: response.data?.id,
            status: response.status
          });
          
          // Adicionar ao conjunto de produtos importados
          this.importedProducts.add(normalizedProduct.id);
          
          return res.status(200).json({
            success: true,
            message: 'Produto importado com sucesso',
            product: response.data
          });
        } catch (dbError) {
          console.error('Erro ao salvar produto no banco:', {
            error: dbError.message,
            product: systemProduct.id,
            status: dbError.response?.status,
            data: dbError.response?.data,
            systemProduct
          });
          
          return res.status(500).json({
            success: false,
            message: `Erro ao salvar produto: ${dbError.message}`,
            details: {
              error: dbError.message,
              data: dbError.response?.data,
              systemProduct
            }
          });
        }
      } catch (error) {
        console.error('Erro ao processar importação:', {
          error: error.message,
          stack: error.stack,
          product: req.body?.id
        });
        
        return res.status(500).json({
          success: false,
          message: `Erro ao importar produto: ${error.message}`,
          details: error.stack
        });
      }
    });

    // Rota para iniciar importação automática
    router.post('/scraper/auto-import/start', (req, res) => {
      this.startAutoImport();
      res.json({
        success: true,
        message: 'Importação automática iniciada'
      });
    });

    // Rota para parar importação automática
    router.post('/scraper/auto-import/stop', (req, res) => {
      this.stopAutoImport();
      res.json({
        success: true,
        message: 'Importação automática parada'
      });
    });

    // Rota para obter status da importação automática
    router.get('/scraper/auto-import/status', (req, res) => {
      res.json({
        success: true,
        isRunning: this.autoImportInterval !== null,
        importedCount: this.importedProducts.size
      });
    });

    // Rota para forçar uma importação imediata
    router.post('/scraper/auto-import/run-now', async (req, res) => {
      try {
        await this.runAutoImport();
        res.json({
          success: true,
          message: 'Importação automática executada com sucesso',
          importedCount: this.importedProducts.size
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: `Erro ao executar importação automática: ${error.message}`
        });
      }
    });
  }
}

module.exports = { ScraperController }; 