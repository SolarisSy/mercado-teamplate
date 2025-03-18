/**
 * Retorna a URL da imagem principal de um produto
 */
export const getProductMainImage = (product: Product): string => {
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