/**
 * Utilitários para manipulação de imagens no sistema
 */

import { Product } from '../typings';
import { getLocalImageUrl } from './imageUtils';

/**
 * Obtém a URL da imagem principal de um produto
 * @param product Objeto do produto
 * @returns URL da imagem principal ou placeholder
 */
export function getProductMainImage(product: Product): string {
  // Se não tiver produto, retornar placeholder
  if (!product) return '/img/placeholder-product.jpg';
  
  // Tentar usar a imagem principal
  if (product.image) {
    return getLocalImageUrl(product.image, product.title, product.category);
  }
  
  // Tentar usar a primeira imagem da lista
  if (product.images && product.images.length > 0) {
    return getLocalImageUrl(product.images[0], product.title, product.category);
  }
  
  // Fallback para placeholder
  return '/img/placeholder-product.jpg';
}

/**
 * Obtém a URL da imagem de uma categoria
 * @param category Nome da categoria
 * @returns URL da imagem da categoria ou placeholder
 */
export function getCategoryImage(category: string): string {
  if (!category) return '/img/placeholder-product.jpg';
  return getLocalImageUrl('', category, category);
}

/**
 * Verifica se uma URL é válida
 * @param url URL a ser verificada
 * @returns true se a URL é válida
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Verificar se é uma URL válida
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se uma URL é de uma imagem
 * @param url URL a ser verificada
 * @returns true se a URL é de uma imagem
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png)$/i) !== null;
}

/**
 * Verifica se uma URL é um placeholder
 * @param url URL a ser verificada
 * @returns true se a URL é um placeholder
 */
export function isPlaceholderUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('placeholder') || url.includes('no-image');
}

/**
 * Retorna a URL da imagem principal de um produto
 */
export const getProductMainImageLegacy = (product: Product): string => {
  if (product.images && product.images.length > 0) {
    // Tenta encontrar a imagem marcada como primária
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) return primaryImage.url;
    
    // Se não encontrar, usa a primeira imagem
    return product.images[0].url;
  }
  
  // Fallback para o campo image legado
  return product.image || '/placeholder-image.jpg';
}; 