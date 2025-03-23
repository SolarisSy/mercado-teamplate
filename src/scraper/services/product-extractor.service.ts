import axios from 'axios';
import { ScrapedProductDto } from '../dto/scraped-product.dto';
import { CacheService } from './cache.service';

/**
 * Serviço responsável por extrair informações de produtos do site alvo
 */
export class ProductExtractorService {
  private readonly BASE_URL = 'https://www.apoioentrega.com';
  private readonly PRODUCT_SEARCH_API = '/api/catalog_system/pub/products/search';
  private readonly PRODUCT_DETAIL_API = 'https://www3.apoioentrega.com.br/api-stockkeepingunitbyid.php';
  
  // Controle de taxa de requisições (1 requisição a cada 2 segundos)
  private readonly REQUEST_DELAY = 2000;
  private lastRequestTime = 0;
  
  constructor(private readonly cacheService: CacheService) {}
  
  /**
   * Extrai produtos através da API de busca
   * @param skuIds Lista de IDs de SKU para buscar
   * @param page Página de resultados
   * @param pageSize Tamanho da página
   * @returns Lista de produtos extraídos
   */
  async extractProducts(
    skuIds?: string[],
    page = 0,
    pageSize = 20
  ): Promise<ScrapedProductDto[]> {
    try {
      const cacheKey = `products_${skuIds?.join('_') || 'all'}_${page}_${pageSize}`;
      const cachedData = this.cacheService.get<ScrapedProductDto[]>(cacheKey);
      
      if (cachedData) {
        console.log('Retornando dados do cache:', cacheKey);
        return cachedData;
      }
      
      // Construção da URL de busca
      let url = `${this.BASE_URL}${this.PRODUCT_SEARCH_API}?`;
      
      // Adicionar filtros de SKU se fornecidos
      if (skuIds && skuIds.length > 0) {
        skuIds.forEach(id => {
          url += `fq=skuId:${id}&`;
        });
      }
      
      // Adicionar parâmetros de paginação
      const from = page * pageSize;
      const to = from + pageSize - 1;
      url += `_from=${from}&_to=${to}&sc=3`;
      
      // Aguardar o tempo necessário para respeitar limites de taxa
      await this.waitForRateLimit();
      
      const response = await axios.get(url);
      
      // Processar produtos da resposta
      const products = await this.processProductList(response.data);
      
      // Armazenar no cache
      this.cacheService.set(cacheKey, products);
      
      return products;
    } catch (error) {
      console.error('Erro ao extrair produtos:', error);
      throw new Error(`Falha ao extrair produtos: ${error.message}`);
    }
  }
  
  /**
   * Extrai detalhes de um produto específico pelo ID do SKU
   * @param skuId ID do SKU do produto
   * @returns Detalhes do produto
   */
  async extractProductDetail(skuId: string): Promise<ScrapedProductDto> {
    try {
      const cacheKey = `product_detail_${skuId}`;
      const cachedData = this.cacheService.get<ScrapedProductDto>(cacheKey);
      
      if (cachedData) {
        console.log('Retornando detalhes do cache:', cacheKey);
        return cachedData;
      }
      
      // Aguardar o tempo necessário para respeitar limites de taxa
      await this.waitForRateLimit();
      
      // Obter detalhes completos do produto, incluindo imagens
      const response = await axios.post(this.PRODUCT_DETAIL_API, 
        { sku_id: skuId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!response.data) {
        throw new Error(`Produto ${skuId} não encontrado`);
      }
      
      // Em alguns casos a API retorna uma string JSON que precisa ser parseada
      const data = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      
      // Extrair imagens e dados do produto
      const productDetail = this.processProductDetail(data, skuId);
      
      // Armazenar no cache
      this.cacheService.set(cacheKey, productDetail);
      
      return productDetail;
    } catch (error) {
      console.error(`Erro ao extrair detalhes do produto ${skuId}:`, error);
      throw new Error(`Falha ao extrair detalhes do produto: ${error.message}`);
    }
  }
  
  /**
   * Processa a lista de produtos da API de busca
   * @param productList Lista de produtos da API
   * @returns Lista de produtos processados
   */
  private async processProductList(productList: any[]): Promise<ScrapedProductDto[]> {
    if (!Array.isArray(productList)) {
      return [];
    }
    
    const products: ScrapedProductDto[] = [];
    
    for (const item of productList) {
      try {
        const sourceId = item.productId || '';
        const skuId = item.items?.[0]?.itemId || '';
        
        // Básico do produto que está disponível na listagem
        const product: ScrapedProductDto = {
          sourceId,
          name: item.productName || '',
          description: item.description || '',
          price: item.items?.[0]?.sellers?.[0]?.commertialOffer?.Price || 0,
          category: item.categories?.[0] || '',
          imageUrls: [],
          extractedAt: new Date(),
          sourceUrl: `${this.BASE_URL}/${item.linkText}/p`,
          brand: item.brand || ''
        };
        
        // Tentar extrair imagens da listagem
        if (item.items?.[0]?.images && Array.isArray(item.items[0].images)) {
          product.imageUrls = item.items[0].images
            .map(img => img.imageUrl || '')
            .filter(url => url);
        }
        
        // Se não tiver imagens ou outras informações, obter detalhes completos
        if (product.imageUrls.length === 0 && skuId) {
          try {
            const detailedProduct = await this.extractProductDetail(skuId);
            product.imageUrls = detailedProduct.imageUrls;
            // Adicionar outras informações detalhadas se necessário
          } catch (error) {
            console.warn(`Não foi possível obter detalhes para ${skuId}:`, error);
          }
        }
        
        products.push(product);
      } catch (error) {
        console.error('Erro ao processar produto:', error);
      }
    }
    
    return products;
  }
  
  /**
   * Processa os detalhes de um produto da API de detalhes
   * @param productData Dados do produto da API
   * @param skuId ID do SKU do produto
   * @returns Produto processado
   */
  private processProductDetail(productData: any, skuId: string): ScrapedProductDto {
    const product: ScrapedProductDto = {
      sourceId: productData.Id || skuId,
      name: productData.Name || '',
      description: productData.Description || '',
      price: productData.Price || 0,
      category: productData.CategoryName || '',
      imageUrls: [],
      extractedAt: new Date(),
      sourceUrl: `${this.BASE_URL}/${productData.LinkText || skuId}/p`,
      brand: productData.Brand || '',
      weight: productData.Weight || undefined,
      unit: productData.MeasurementUnit || undefined,
      stock: productData.AvailableQuantity || 0
    };
    
    // Extrair URLs das imagens
    if (productData.Images && Array.isArray(productData.Images)) {
      // Processar estrutura de imagens complexa encontrada na API
      const extractedUrls = this.extractImageUrls(productData.Images);
      if (extractedUrls.length > 0) {
        product.imageUrls = extractedUrls;
      }
    }
    
    return product;
  }
  
  /**
   * Extrai URLs de imagens da estrutura retornada pela API
   * @param imagesData Dados de imagens da API
   * @returns Lista de URLs de imagens
   */
  private extractImageUrls(imagesData: any): string[] {
    const urls: string[] = [];
    
    // A estrutura pode variar, então tentamos diferentes abordagens
    try {
      // Caso 1: imagens em array de arrays com campo Path
      if (Array.isArray(imagesData)) {
        for (const imageGroup of imagesData) {
          if (Array.isArray(imageGroup)) {
            for (const image of imageGroup) {
              if (image && image.Path) {
                urls.push(image.Path);
              }
            }
          }
        }
      }
      
      // Se nenhuma imagem foi encontrada, tentar outras estruturas
      if (urls.length === 0 && typeof imagesData === 'object') {
        // Caso 2: objetos com URLs diretas
        Object.values(imagesData).forEach(img => {
          if (typeof img === 'string' && img.match(/^https?:\/\//)) {
            urls.push(img);
          } else if (img && typeof img === 'object' && 'url' in img) {
            urls.push(img.url);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao extrair URLs de imagens:', error);
    }
    
    return urls;
  }
  
  /**
   * Espera o tempo necessário para respeitar limites de taxa de requisição
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;
    
    if (timeElapsed < this.REQUEST_DELAY) {
      const waitTime = this.REQUEST_DELAY - timeElapsed;
      console.log(`Aguardando ${waitTime}ms para respeitar limite de taxa...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
} 