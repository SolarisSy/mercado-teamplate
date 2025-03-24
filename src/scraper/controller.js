// Este é um wrapper para o ScraperController para ser importado pelo server.js
// Como o server.js está usando CommonJS e não consegue importar arquivos TypeScript diretamente
const axios = require('axios');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller para o scraper
 */
class ScraperController {
  constructor() {
    this.products = [];
    this.cache = new Map();
    this.productMemory = new Set();
    this.autoImportStatus = false; // Garantir que importação automática inicie desligada
    this.autoImportTimer = null;
    this.cache = new NodeCache({ stdTTL: 300 }); // Cache por 5 minutos
    this.baseUrl = 'https://www.apoioentrega.com.br';
    this.autoImportInterval = null; // Inicialmente nulo (desligado)
    this.importedProducts = new Set(); // Conjunto para rastrear produtos já importados
    this.importProgress = {
      isRunning: false,
      total: 0,
      imported: 0,
      failed: 0,
      startTime: null,
      endTime: null,
      status: 'idle', // 'idle', 'running', 'completed', 'failed'
      lastError: null
    };
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
   * Baixa e salva uma imagem localmente
   * @param {string} imageUrl URL da imagem para baixar
   * @param {string} productId ID do produto
   * @returns {Promise<string>} Caminho local da imagem salva
   */
  async downloadImage(imageUrl, productId) {
    try {
      // Validar URL da imagem
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.log('URL de imagem inválida:', imageUrl);
        return '/img/placeholder-product.jpg';
      }

      // Ignorar URLs locais
      if (imageUrl.startsWith('/')) {
        console.log('Imagem já é local, ignorando:', imageUrl);
        return imageUrl;
      }

      // Obter extensão do arquivo a partir da URL
      let fileExtension = 'jpg';
      if (imageUrl.includes('.')) {
        const urlParts = imageUrl.split('?')[0].split('.');
        const extension = urlParts[urlParts.length - 1].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          fileExtension = extension;
        }
      }

      // Gerar um nome único para o arquivo baseado no produto e hash da URL
      const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const safeProductId = productId.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeProductId}_${urlHash}.${fileExtension}`;

      // Diretório para salvar as imagens
      const productImagesDir = path.join(process.cwd(), 'public', 'img', 'produtos');
      
      // Criar diretório se não existir
      if (!fs.existsSync(productImagesDir)) {
        fs.mkdirSync(productImagesDir, { recursive: true });
      }

      // Caminho completo do arquivo
      const filePath = path.join(productImagesDir, fileName);
      
      // Caminho relativo para uso no frontend
      const relativePath = `/img/produtos/${fileName}`;

      // Verificar se o arquivo já existe para evitar downloads duplicados
      if (fs.existsSync(filePath)) {
        console.log('Imagem já existe localmente:', relativePath);
        return relativePath;
      }

      console.log('Baixando imagem:', imageUrl);
      
      // Fazer a requisição para baixar a imagem
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.apoioentrega.com.br/',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        }
      });

      // Salvar o arquivo
      await fs.writeFile(filePath, response.data);
      
      console.log('Imagem salva com sucesso:', relativePath);
      return relativePath;
    } catch (error) {
      console.error('Erro ao baixar imagem:', {
        url: imageUrl,
        error: error.message
      });
      return '/img/placeholder-product.jpg';
    }
  }

  /**
   * Exclui a imagem de um produto do sistema de arquivos
   * @param {string} imagePath Caminho relativo da imagem a ser excluída
   * @returns {Promise<boolean>} Resultado da operação
   */
  async deleteProductImage(imagePath) {
    try {
      // Ignorar se for uma imagem de placeholder ou URL externa
      if (!imagePath || 
          imagePath.startsWith('http') || 
          imagePath === '/img/placeholder-product.jpg' ||
          !imagePath.startsWith('/img/produtos/')) {
        console.log('Imagem não precisa ser excluída:', imagePath);
        return true;
      }

      // Obter caminho completo no sistema de arquivos
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      
      console.log('Tentando excluir imagem:', fullPath);

      // Verificar se o arquivo existe
      if (!fs.existsSync(fullPath)) {
        console.log('Arquivo não encontrado:', fullPath);
        return false;
      }

      // Excluir o arquivo
      await fs.unlink(fullPath);
      console.log('Imagem excluída com sucesso:', fullPath);
      return true;
    } catch (error) {
      console.error('Erro ao excluir imagem:', error.message);
      return false;
    }
  }

  /**
   * Exclui todas as imagens associadas a um produto
   * @param {Object} product Produto cujas imagens serão excluídas
   * @returns {Promise<number>} Número de imagens excluídas
   */
  async deleteAllProductImages(product) {
    let deletedCount = 0;
    
    try {
      if (!product) return deletedCount;
      
      // Excluir imagem principal se existir
      if (product.image) {
        const success = await this.deleteProductImage(product.image);
        if (success) deletedCount++;
      }
      
      // Excluir todas as imagens do array images
      if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
          const imgUrl = typeof img === 'string' ? img : img.url;
          if (imgUrl) {
            const success = await this.deleteProductImage(imgUrl);
            if (success) deletedCount++;
          }
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Erro ao excluir imagens do produto:', error.message);
      return deletedCount;
    }
  }

  /**
   * Importa um produto para a loja
   * @param {Object} product Produto a ser importado
   * @param {boolean} downloadImages Se deve baixar as imagens ou usar URLs originais (padrão: true)
   */
  async importProductToStore(product, downloadImages = true) {
    try {
      console.log('Processando produto para importação:', {
        id: product.id,
        title: product.title,
        downloadImages: downloadImages ? 'Sim (baixar imagens)' : 'Não (usar URLs originais)'
      });

      // Garantir que temos os dados mínimos necessários
      if (!product.id || !product.title) {
        throw new Error('Dados obrigatórios faltando para importação do produto');
      }

      // Processar descrição HTML
      let processedDescription = product.description || product.title;
      
      // Verificar se a descrição contém tags HTML escapadas e decodificá-las
      if (typeof processedDescription === 'string' && 
          (processedDescription.includes('&lt;') || processedDescription.includes('&gt;'))) {
        console.log('Detectadas tags HTML escapadas na descrição. Decodificando...');
        
        // Decodificar entidades HTML comuns
        processedDescription = processedDescription
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
          
        console.log('Descrição decodificada com sucesso');
      }
      
      // Remover completamente todas as tags HTML da descrição
      if (typeof processedDescription === 'string' && processedDescription.includes('<')) {
        console.log('Removendo tags HTML da descrição');
        // Primeiro método: substituir todas as tags HTML por espaço
        processedDescription = processedDescription.replace(/<[^>]*>/g, ' ');
        
        // Segundo método: usar DOMParser se estiver no navegador (não funciona no Node.js)
        // processedDescription = new DOMParser().parseFromString(processedDescription, 'text/html').body.textContent || '';
        
        // Remover múltiplos espaços consecutivos
        processedDescription = processedDescription.replace(/\s+/g, ' ').trim();
        
        console.log('Tags HTML removidas com sucesso');
      }

      // Processar e baixar imagens
      let processedImages = [];
      const originalImages = [];
      
      if (Array.isArray(product.images)) {
        // Armazenar as URLs originais para referência
        originalImages.push(...product.images);
        
        // Processar cada imagem
        for (const img of product.images) {
          // Se devemos baixar imagens
          if (downloadImages) {
            // Se a imagem já é uma URL completa do apoioentrega, preservá-la e baixá-la
            if (img.includes('apoioentrega.vteximg.com.br')) {
              // Remover parâmetros da URL que podem causar problemas
              const cleanUrl = img.split('?')[0];
              
              // Garantir que a URL use HTTP se não tiver protocolo
              let fullUrl = cleanUrl;
              if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                fullUrl = `http://${fullUrl}`;
              }
              
              // Baixar e salvar a imagem localmente
              const localPath = await this.downloadImage(fullUrl, product.id);
              processedImages.push(localPath);
            }
            // Se a imagem já é uma URL completa de outra fonte, baixá-la
            else if (img.startsWith('http://') || img.startsWith('https://')) {
              const localPath = await this.downloadImage(img, product.id);
              processedImages.push(localPath);
            }
            // Se é um caminho relativo do apoioentrega, construir a URL completa e baixá-la
            else if (img.includes('/arquivos/') || img.includes('/ids/')) {
              const baseUrl = 'http://apoioentrega.vteximg.com.br';
              const fullUrl = `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
              const localPath = await this.downloadImage(fullUrl, product.id);
              processedImages.push(localPath);
            }
            // Para outros casos, usar o placeholder
            else {
              processedImages.push('/img/placeholder-product.jpg');
            }
          } else {
            // Usar URLs originais sem baixar (novo comportamento)
            // Se a imagem já é uma URL completa, usá-la diretamente
            if (img.startsWith('http://') || img.startsWith('https://')) {
              processedImages.push(img);
            }
            // Se é um caminho relativo do apoioentrega, construir a URL completa
            else if (img.includes('/arquivos/') || img.includes('/ids/')) {
              const baseUrl = 'http://apoioentrega.vteximg.com.br';
              const fullUrl = `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
              processedImages.push(fullUrl);
            }
            // Para outros casos, usar o placeholder
            else {
              processedImages.push('/img/placeholder-product.jpg');
            }
          }
        }
      }

      // Se não houver imagens, usar o placeholder local
      if (processedImages.length === 0) {
        processedImages = ['/img/placeholder-product.jpg'];
      }

      // Criar o produto formatado para o sistema
      const systemProduct = {
        id: `imported_${product.id}`, // Adicionar prefixo para evitar conflitos
        title: product.title,
        description: processedDescription,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        category: product.category || 'Importado',
        image: processedImages[0], // Imagem principal
        images: processedImages, // Array com todas as imagens
        stock: product.stock || 999,
        source: 'apoioentrega',
        importedAt: new Date().toISOString(),
        // Campos adicionais para rastreamento
        originalId: product.id,
        originalImages: originalImages, // Preservar URLs originais
        lastUpdated: new Date().toISOString(),
        downloadedImages: downloadImages // Informar se as imagens foram baixadas
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
        imagesCount: systemProduct.images.length,
        downloadedImages: downloadImages
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
   * Importar todos os produtos disponíveis na API gradualmente
   * @param {number} batchSize Tamanho do lote de produtos por vez (padrão: 20)
   * @param {number} delayBetweenBatches Atraso em ms entre lotes (padrão: 3000)
   * @param {boolean} downloadImages Se deve baixar as imagens ou usar URLs originais (padrão: true)
   * @returns {Promise<Object>} Objeto com estatísticas da importação
   */
  async importAllProducts(batchSize = 20, delayBetweenBatches = 3000, downloadImages = true) {
    try {
      // Verificar se já está em execução
      if (this.importProgress.isRunning) {
        console.log('Importação em massa já está em andamento');
        return this.importProgress;
      }

      // Resetar e inicializar o progresso
      this.importProgress = {
        isRunning: true,
        total: 0,
        imported: 0,
        failed: 0,
        startTime: new Date(),
        endTime: null,
        status: 'running',
        lastError: null,
        batchSize,
        currentBatch: 0,
        estimatedTotal: '∞', // Inicialmente desconhecido
        downloadImages, // Armazenar a configuração de download
      };

      console.log(`Iniciando importação em massa de produtos (download de imagens: ${downloadImages ? 'Sim' : 'Não'})...`);
      
      let allProducts = [];
      let currentPage = 0;
      let hasMoreProducts = true;
      let totalFailures = 0;
      
      // Continuar buscando e importando enquanto houver produtos disponíveis
      while (hasMoreProducts) {
        try {
          // Incrementar o número do lote atual
          this.importProgress.currentBatch = currentPage + 1;
          
          const fromIndex = currentPage * batchSize;
          const toIndex = fromIndex + batchSize - 1;
          
          console.log(`Buscando lote ${currentPage + 1}: produtos de ${fromIndex} a ${toIndex}...`);
          
          // Buscar produtos usando a API
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

          console.log(`Resposta da API de produtos (lote ${currentPage + 1}):`, response.status);
          
          // Verificar se a resposta é um array
          if (!Array.isArray(response.data)) {
            console.error('Resposta não é um array:', typeof response.data);
            hasMoreProducts = false;
            continue;
          }
          
          // Se não retornou produtos, chegamos ao fim da lista
          if (response.data.length === 0) {
            console.log('Não há mais produtos disponíveis, importação completa.');
            hasMoreProducts = false;
            continue;
          }

          // Atualizar estimativa de total se ainda for desconhecido
          if (this.importProgress.estimatedTotal === '∞' && response.headers['x-total-count']) {
            const estimatedTotal = parseInt(response.headers['x-total-count'], 10);
            this.importProgress.estimatedTotal = isNaN(estimatedTotal) ? '∞' : estimatedTotal;
            console.log(`Estimativa de total de produtos: ${this.importProgress.estimatedTotal}`);
          }

          // Mapear os produtos para o formato esperado
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

          console.log(`Encontrados ${pageProducts.length} produtos no lote ${currentPage + 1}`);
          this.importProgress.total += pageProducts.length;
          
          // Importar cada produto individualmente
          for (const product of pageProducts) {
            try {
              // Verificar se o produto já existe
              const existingProducts = await this.getExistingProducts();
              const existingProduct = existingProducts.find(p => 
                p.id === `imported_${product.id}` || 
                (p.originalId && p.originalId === product.id)
              );
              
              if (existingProduct) {
                console.log(`Produto ${product.id} já existe no sistema como ${existingProduct.id}, pulando...`);
                continue;
              }
              
              // Importar o produto com a configuração de download
              console.log(`Importando produto ${product.id}: ${product.title}... (download: ${downloadImages ? 'Sim' : 'Não'})`);
              const result = await this.importProductToStore(product, downloadImages);
              
              if (result && result.id) {
                console.log(`Produto ${product.id} importado com sucesso como ${result.id}`);
                this.importProgress.imported++;
                // Adicionar ao conjunto de produtos importados
                this.importedProducts.add(product.id);
              } else {
                console.error(`Falha ao importar produto ${product.id}`);
                this.importProgress.failed++;
                totalFailures++;
              }
            } catch (importError) {
              console.error(`Erro ao importar produto ${product.id}:`, importError.message);
              this.importProgress.failed++;
              this.importProgress.lastError = importError.message;
              totalFailures++;
            }
          }
          
          // Avançar para a próxima página
          currentPage++;
          
          // Adicionar delay para não sobrecarregar a API
          if (hasMoreProducts) {
            console.log(`Aguardando ${delayBetweenBatches}ms antes do próximo lote...`);
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
          
          // Se acumulou muitos erros, pausar a importação
          if (totalFailures > 10) {
            console.error('Muitos erros consecutivos, abortando importação em massa');
            hasMoreProducts = false;
            this.importProgress.status = 'failed';
            this.importProgress.lastError = 'Muitos erros consecutivos';
          }
        } catch (batchError) {
          console.error(`Erro ao processar lote ${currentPage + 1}:`, batchError.message);
          totalFailures++;
          this.importProgress.lastError = batchError.message;
          
          // Se falhar 3 vezes consecutivas, abortar
          if (totalFailures >= 3) {
            console.error('Falhas consecutivas, abortando importação em massa');
            hasMoreProducts = false;
            this.importProgress.status = 'failed';
          } else {
            // Adicionar delay maior antes de tentar novamente
            console.log('Aguardando 10s antes de tentar novamente...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        }
      }
      
      // Finalizar o progresso
      this.importProgress.isRunning = false;
      this.importProgress.endTime = new Date();
      if (this.importProgress.status !== 'failed') {
        this.importProgress.status = 'completed';
      }
      
      const duration = (this.importProgress.endTime - this.importProgress.startTime) / 1000;
      console.log(`Importação em massa concluída em ${duration.toFixed(1)}s`);
      console.log(`Total de produtos: ${this.importProgress.total}`);
      console.log(`Produtos importados: ${this.importProgress.imported}`);
      console.log(`Produtos com erro: ${this.importProgress.failed}`);
      console.log(`Download de imagens: ${downloadImages ? 'Sim' : 'Não'}`);
      
      return this.importProgress;
    } catch (error) {
      console.error('Erro fatal na importação em massa:', error.message);
      
      // Atualizar o progresso com o erro
      this.importProgress.isRunning = false;
      this.importProgress.endTime = new Date();
      this.importProgress.status = 'failed';
      this.importProgress.lastError = error.message;
      
      return this.importProgress;
    }
  }

  /**
   * Obter o status atual da importação em massa
   * @returns {Object} Estado atual do progresso da importação
   */
  getImportAllStatus() {
    // Calcular tempo decorrido se a importação estiver em andamento
    if (this.importProgress.isRunning && this.importProgress.startTime) {
      const elapsedMs = new Date() - this.importProgress.startTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      const elapsedHours = Math.floor(elapsedMinutes / 60);
      
      this.importProgress.elapsed = {
        hours: elapsedHours,
        minutes: elapsedMinutes % 60,
        seconds: elapsedSeconds % 60,
        formatted: `${elapsedHours}h ${elapsedMinutes % 60}m ${elapsedSeconds % 60}s`
      };
      
      // Calcular taxa de importação e estimativa de tempo restante
      if (elapsedSeconds > 0 && this.importProgress.imported > 0) {
        const rate = this.importProgress.imported / elapsedSeconds; // produtos por segundo
        
        if (this.importProgress.estimatedTotal !== '∞') {
          const remaining = this.importProgress.estimatedTotal - this.importProgress.imported - this.importProgress.failed;
          if (remaining > 0 && rate > 0) {
            const secondsRemaining = Math.ceil(remaining / rate);
            const minutesRemaining = Math.floor(secondsRemaining / 60);
            const hoursRemaining = Math.floor(minutesRemaining / 60);
            
            this.importProgress.estimate = {
              rate: rate.toFixed(2), // produtos por segundo
              remaining: {
                hours: hoursRemaining,
                minutes: minutesRemaining % 60,
                seconds: secondsRemaining % 60,
                formatted: `${hoursRemaining}h ${minutesRemaining % 60}m ${secondsRemaining % 60}s`
              }
            };
          }
        }
      }
    }
    
    return this.importProgress;
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
        
        if (!product || !product.id || !product.title) {
          return res.status(400).json({ 
            success: false, 
            message: 'Dados de produto inválidos'
          });
        }
        
        console.log('Iniciando importação de produto:', {
          id: product.id,
          title: product.title
        });
        
        // Tratar a URL da imagem, especialmente se for do apoioentrega
        if (product.imageUrl && typeof product.imageUrl === 'string') {
          console.log('URL da imagem original:', product.imageUrl);
          
          if (product.imageUrl.includes('apoioentrega.vteximg.com.br')) {
            console.log('Preservando URL original de apoioentrega:', product.imageUrl);
            product.images = [product.imageUrl];
          } else {
            product.images = [product.imageUrl];
          }
        }
        
        // Processar descrição HTML, se houver
        if (product.description && typeof product.description === 'string' && 
            (product.description.includes('&lt;') || product.description.includes('&gt;'))) {
          console.log('Decodificando entidades HTML na descrição');
          
          // Decodificar entidades HTML comuns
          product.description = product.description
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          
          console.log('Descrição decodificada com sucesso');
        }
        
        // Processar categoria
        if (product.category && product.category.includes('>')) {
          console.log('Categoria original:', product.category);
          product.category = product.category.split('>')[0].trim();
          console.log('Categoria processada:', product.category);
        }
        
        console.log('Produto preparado para importação:', product);
        
        // Verificar se o produto já existe
        const existingProducts = await this.getExistingProducts();
        const existingProduct = existingProducts.find(p => 
          p.id === `imported_${product.id}` || 
          (p.originalId && p.originalId === product.id)
        );
        
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message: 'Produto já existe no sistema',
            productId: existingProduct.id
          });
        }
        
        // Importar o produto
        const result = await this.importProductToStore(product);
        
        console.log('Resposta do servidor:', result);
        
        if (result && result.id) {
          console.log('Produto importado com sucesso:', result);
          return res.status(201).json({
            success: true,
            message: 'Produto importado com sucesso',
            productId: result.id,
            product: result
          });
        } else {
          throw new Error('Falha ao importar produto');
        }
      } catch (error) {
        console.error('Erro ao importar produto:', error.message);
        res.status(500).json({
          success: false,
          message: `Erro ao importar produto: ${error.message}`
        });
      }
    });

    // Rota para excluir um produto (com suas imagens)
    router.delete('/api/delete-product/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Obter detalhes do produto para excluir suas imagens
        const existingProductsResponse = await axios.get(`http://localhost:3000/products/${id}`);
        const product = existingProductsResponse.data;
        
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Produto não encontrado'
          });
        }
        
        // Excluir as imagens associadas ao produto
        const deletedImagesCount = await this.deleteAllProductImages(product);
        
        // Excluir o produto do banco de dados
        await axios.delete(`http://localhost:3000/products/${id}`);
        
        res.json({
          success: true,
          message: `Produto excluído com sucesso. ${deletedImagesCount} imagens foram removidas.`
        });
      } catch (error) {
        console.error('Erro ao excluir produto:', error.message);
        res.status(500).json({
          success: false,
          message: `Erro ao excluir produto: ${error.message}`
        });
      }
    });

    // Rota para excluir todos os produtos
    router.delete('/api/delete-all-products', async (req, res) => {
      try {
        // Obter todos os produtos
        const productsResponse = await axios.get('http://localhost:3000/products');
        const products = productsResponse.data;
        
        console.log(`Preparando para excluir ${products.length} produtos`);
        
        // Contadores para estatísticas
        let deletedProducts = 0;
        let deletedImages = 0;
        
        // Excluir cada produto e suas imagens
        for (const product of products) {
          try {
            // Excluir imagens associadas ao produto
            const imagesDeleted = await this.deleteAllProductImages(product);
            deletedImages += imagesDeleted;
            
            // Excluir o produto do banco de dados
            await axios.delete(`http://localhost:3000/products/${product.id}`);
            deletedProducts++;
            
            console.log(`Produto ${product.id} excluído com ${imagesDeleted} imagens`);
          } catch (productError) {
            console.error(`Erro ao excluir produto ${product.id}:`, productError.message);
            // Continuar com o próximo produto mesmo se houver erro
          }
        }
        
        res.json({
          success: true,
          message: `${deletedProducts} produtos excluídos com sucesso. ${deletedImages} imagens foram removidas.`,
          stats: {
            totalProducts: products.length,
            deletedProducts,
            deletedImages
          }
        });
      } catch (error) {
        console.error('Erro ao excluir todos os produtos:', error.message);
        res.status(500).json({
          success: false,
          message: `Erro ao excluir todos os produtos: ${error.message}`
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

    // Rota para iniciar importação de todos os produtos
    router.post('/scraper/import-all-products', async (req, res) => {
      try {
        // Verificar se já está em andamento
        if (this.importProgress.isRunning) {
          return res.status(409).json({
            success: false,
            message: 'Importação em massa já está em andamento',
            progress: this.getImportAllStatus()
          });
        }
        
        // Obter parâmetros da requisição
        const { 
          batchSize = 20, 
          delayBetweenBatches = 3000, 
          downloadImages = true 
        } = req.body;
        
        // Iniciar a importação em um processo separado para não bloquear a resposta
        res.status(202).json({
          success: true,
          message: `Importação em massa iniciada (download de imagens: ${downloadImages ? 'Sim' : 'Não'})`,
          progress: this.getImportAllStatus()
        });
        
        // Iniciar o processo de importação em massa
        this.importAllProducts(batchSize, delayBetweenBatches, downloadImages).catch(error => {
          console.error('Erro na importação em massa:', error);
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: `Erro ao iniciar importação em massa: ${error.message}`
        });
      }
    });

    // Rota para obter status da importação em massa
    router.get('/scraper/import-all-products/status', (req, res) => {
      res.json({
        success: true,
        progress: this.getImportAllStatus()
      });
    });

    // Rota para cancelar importação em massa
    router.post('/scraper/import-all-products/cancel', (req, res) => {
      if (!this.importProgress.isRunning) {
        return res.status(400).json({
          success: false,
          message: 'Não há importação em massa em andamento'
        });
      }
      
      this.importProgress.isRunning = false;
      this.importProgress.endTime = new Date();
      this.importProgress.status = 'canceled';
      
      res.json({
        success: true,
        message: 'Importação em massa cancelada',
        progress: this.getImportAllStatus()
      });
    });
  }
}

module.exports = { ScraperController }; 