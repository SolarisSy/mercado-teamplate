/**
 * Utilitários para manipulação de imagens no sistema
 */

import { Product } from '../typings';

// Constantes para fallbacks
const DEFAULT_PLACEHOLDER = '/img/placeholder-product.jpg';

/**
 * Verifica se uma URL é de apoioentrega.vteximg.com.br
 * Esta função foi criada para centralizar a lógica de detecção
 */
function isApoioEntregaImageUrl(url: string): boolean {
  return Boolean(url && typeof url === 'string' && url.includes('apoioentrega.vteximg.com.br'));
}

/**
 * Obtém a URL local de uma imagem
 * @param url URL original da imagem
 * @param title Título do produto (para fallback)
 * @param category Categoria do produto (para fallback)
 * @returns URL local da imagem ou placeholder
 */
export function getLocalImageUrl(url: string, title?: string, category?: string): string {
  // Se não tiver URL, tentar gerar uma com base no título e categoria
  if (!url) {
    if (title && category) {
      return `/img/products/${category.toLowerCase()}/${title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    }
    return DEFAULT_PLACEHOLDER;
  }
  
  // REGRA PRINCIPAL: PRESERVAR URLS DE APOIOENTREGA.VTEXIMG.COM.BR
  if (isApoioEntregaImageUrl(url)) {
    // Tentar usar HTTP se a URL não tem protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    
    // Remover parâmetros desnecessários que podem causar problemas
    const cleanUrl = url.split('?')[0];
    
    return cleanUrl;
  }
  
  // Se for uma URL externa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se for um caminho relativo, adicionar o prefixo
  if (url.startsWith('/')) {
    return url;
  }
  
  // Caso contrário, assumir que é um caminho relativo sem /
  return `/${url}`;
}

/**
 * Obtém a URL da imagem principal de um produto
 * @param product Objeto do produto
 * @returns URL da imagem principal ou placeholder
 */
export function getProductMainImage(product: Product): string {
  // Se não tiver produto, retornar placeholder
  if (!product) return DEFAULT_PLACEHOLDER;
  
  // Tentar usar a imagem principal
  if (product.image) {
    return getLocalImageUrl(product.image, product.title, product.category);
  }
  
  // Tentar usar a primeira imagem da lista
  if (product.images && product.images.length > 0) {
    return getLocalImageUrl(product.images[0], product.title, product.category);
  }
  
  // Fallback para placeholder
  return DEFAULT_PLACEHOLDER;
}

/**
 * Obtém a URL da imagem de uma categoria
 * @param category Nome da categoria
 * @returns URL da imagem da categoria ou placeholder
 */
export function getCategoryImage(category: string): string {
  if (!category) return DEFAULT_PLACEHOLDER;
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
  return product.image || DEFAULT_PLACEHOLDER;
}; 