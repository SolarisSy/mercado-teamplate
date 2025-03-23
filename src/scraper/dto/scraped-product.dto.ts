import { Product } from '../../types/product';

/**
 * DTO para armazenar e validar dados extraídos do site externo
 */
export class ScrapedProductDto {
  // Identificador único do produto no site de origem
  sourceId: string;
  
  // Nome do produto
  name: string;
  
  // Descrição do produto
  description?: string;
  
  // Preço do produto
  price: number;
  
  // Categoria do produto
  category?: string;
  
  // URLs das imagens do produto
  imageUrls: string[];
  
  // Estoque disponível (se disponível na fonte)
  stock?: number;
  
  // Marca do produto
  brand?: string;
  
  // Peso do produto (se disponível)
  weight?: number;
  
  // Unidade de medida (kg, g, L, etc.)
  unit?: string;
  
  // Data de extração dos dados
  extractedAt: Date;
  
  // URL de origem do produto
  sourceUrl: string;
  
  /**
   * Converte o DTO para o modelo Product do sistema
   */
  toProduct(): Product {
    return {
      id: `imported_${this.sourceId}`,
      title: this.name,
      description: this.description || '',
      price: this.price,
      category: this.category || 'Importado',
      stock: this.stock || 0,
      images: this.imageUrls,
      brand: this.brand,
      weight: this.weight,
      unit: this.unit,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
} 