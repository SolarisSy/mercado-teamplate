import { ScrapedProductDto } from './dto/scraped-product.dto';
import { CacheService } from './services/cache.service';
import { ProductExtractorService } from './services/product-extractor.service';

/**
 * Serviço principal do scraper que coordena a extração de dados
 */
export class ScraperService {
  private readonly productExtractor: ProductExtractorService;
  private readonly cacheService: CacheService;
  
  constructor() {
    this.cacheService = new CacheService();
    this.productExtractor = new ProductExtractorService(this.cacheService);
  }
  
  /**
   * Inicializa o serviço de scraping
   */
  async initialize(): Promise<void> {
    console.log('Inicializando serviço de scraping...');
    // Pode ser expandido para carregar configurações, etc.
  }
  
  /**
   * Obtém produtos do site alvo com opções de filtragem
   * @param options Opções de filtragem
   * @returns Lista de produtos extraídos
   */
  async getProducts(options: {
    skuIds?: string[];
    page?: number;
    pageSize?: number;
    forceRefresh?: boolean;
  } = {}): Promise<ScrapedProductDto[]> {
    const { skuIds, page = 0, pageSize = 20, forceRefresh = false } = options;
    
    // Se forçar atualização, limpar cache relacionado
    if (forceRefresh) {
      this.clearProductCache(skuIds, page, pageSize);
    }
    
    return this.productExtractor.extractProducts(skuIds, page, pageSize);
  }
  
  /**
   * Obtém detalhes de um produto específico
   * @param skuId ID do SKU do produto
   * @param forceRefresh Forçar atualização do cache
   * @returns Detalhes do produto
   */
  async getProductDetail(skuId: string, forceRefresh = false): Promise<ScrapedProductDto> {
    // Se forçar atualização, limpar cache relacionado
    if (forceRefresh) {
      this.cacheService.delete(`product_detail_${skuId}`);
    }
    
    return this.productExtractor.extractProductDetail(skuId);
  }
  
  /**
   * Limpa o cache de produtos
   * @param skuIds Lista de IDs de SKU
   * @param page Página atual
   * @param pageSize Tamanho da página
   */
  private clearProductCache(skuIds?: string[], page?: number, pageSize?: number): void {
    if (skuIds && skuIds.length > 0) {
      const cacheKey = `products_${skuIds.join('_')}_${page}_${pageSize}`;
      this.cacheService.delete(cacheKey);
      
      // Também limpar cache de detalhes para esses SKUs
      skuIds.forEach(id => {
        this.cacheService.delete(`product_detail_${id}`);
      });
    } else {
      // Limpar todos os caches relacionados a produtos
      // Como o cacheService não tem um método para limpar por prefixo,
      // isso teria que ser implementado em uma versão mais completa
      this.cacheService.clear();
    }
  }
  
  /**
   * Converte produtos extraídos para o formato do sistema
   * @param scrapedProducts Produtos extraídos
   * @returns Produtos convertidos para o formato do sistema
   */
  convertToSystemProducts(scrapedProducts: ScrapedProductDto[]): any[] {
    return scrapedProducts.map(product => product.toProduct());
  }
} 