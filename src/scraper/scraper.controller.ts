import { ScraperService } from './scraper.service';
import { ScrapedProductDto } from './dto/scraped-product.dto';

/**
 * Controller para expor as funcionalidades do scraper via API REST
 */
export class ScraperController {
  private readonly scraperService: ScraperService;
  
  constructor() {
    this.scraperService = new ScraperService();
    this.initialize();
  }
  
  /**
   * Inicializa o controller e seus serviços
   */
  private async initialize(): Promise<void> {
    await this.scraperService.initialize();
  }
  
  /**
   * Endpoint para buscar produtos do site alvo
   * @param req Requisição
   * @param res Resposta
   */
  async getProducts(req: any, res: any): Promise<void> {
    try {
      const { 
        skuIds, 
        page = 0, 
        pageSize = 20, 
        forceRefresh = false,
        convertToSystem = false
      } = req.query;
      
      // Converter parâmetros para os tipos corretos
      const parsedSkuIds = skuIds ? 
        (Array.isArray(skuIds) ? skuIds : [skuIds]) : 
        undefined;
      
      const parsedPage = parseInt(page as string, 10) || 0;
      const parsedPageSize = parseInt(pageSize as string, 10) || 20;
      const parsedForceRefresh = forceRefresh === 'true';
      const parsedConvertToSystem = convertToSystem === 'true';
      
      const products = await this.scraperService.getProducts({
        skuIds: parsedSkuIds,
        page: parsedPage,
        pageSize: parsedPageSize,
        forceRefresh: parsedForceRefresh
      });
      
      // Converter para formato do sistema se solicitado
      const result = parsedConvertToSystem ? 
        this.scraperService.convertToSystemProducts(products) : 
        products;
      
      res.json({
        success: true,
        products: result,
        total: result.length,
        page: parsedPage,
        pageSize: parsedPageSize
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Endpoint para buscar detalhes de um produto específico
   * @param req Requisição
   * @param res Resposta
   */
  async getProductDetail(req: any, res: any): Promise<void> {
    try {
      const { skuId } = req.params;
      const { forceRefresh = false, convertToSystem = false } = req.query;
      
      const parsedForceRefresh = forceRefresh === 'true';
      const parsedConvertToSystem = convertToSystem === 'true';
      
      if (!skuId) {
        res.status(400).json({
          success: false,
          error: 'ID do produto é obrigatório'
        });
        return;
      }
      
      const product = await this.scraperService.getProductDetail(
        skuId, 
        parsedForceRefresh
      );
      
      // Converter para formato do sistema se solicitado
      const result = parsedConvertToSystem ? 
        product.toProduct() : 
        product;
      
      res.json({
        success: true,
        product: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  /**
   * Configura as rotas do controller em um Express router
   * @param router Express router
   */
  registerRoutes(router: any): void {
    // Rota para listar produtos
    router.get('/scraper/products', this.getProducts.bind(this));
    
    // Rota para obter detalhes de um produto
    router.get('/scraper/products/:skuId', this.getProductDetail.bind(this));
  }
} 