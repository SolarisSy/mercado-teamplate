/**
 * Utilitários para manipulação de imagens
 * REFATORADO PARA GARANTIR A PRESERVAÇÃO DE URLS ORIGINAIS DE IMAGENS
 */

// Imagem de fallback padrão (local)
const DEFAULT_PLACEHOLDER = "/img/placeholder-product.jpg";

// Mapeamento de URLs externas para caminhos de imagem locais
const imageMap: Record<string, string> = {
  // URLs do Unsplash (apenas o início, vamos tratar os parâmetros depois)
  "https://images.unsplash.com/photo-1586201375761-83865001e8ac": "/img/114739-picanha-tradicional-peca-1kg.jpg", // Arroz Branco
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c": "/img/bife-ancho-friboi-maturatta-entrecote-1-7kg.jpg", // Legumes
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg", // Frutas
  "https://images.unsplash.com/photo-1591857177593-aec9cc4147e4": "/img/picanha-grill-fat-1kg.jpg", // Feijão
  
  // Adicionando as URLs que estão falhando nos logs
  "https://images.unsplash.com/photo-1587132137056-bfbf0166836e": "/img/placeholder-product.jpg", // Banana Prata Orgânica
  "https://images.unsplash.com/photo-1563636619-e9143da7973b": "/img/placeholder-product.jpg", // Leite Integral
  
  // Mais URLs comuns do Unsplash
  "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "https://images.unsplash.com/photo-1608198093002-ad4e005484ec": "/img/177634-salame-11g-de-proteina-original-sadia-salam.jpg",
  "https://images.unsplash.com/photo-1551024709-8f23befc6f87": "/img/114739-picanha-tradicional-peca-1kg.jpg",
  "https://images.unsplash.com/photo-1563453392212-326f5e854473": "/img/coracao-de-frango-bandeja-seara-1kg.jpg",
  "https://images.unsplash.com/photo-1589033134270-25236a5be391": "/img/placeholder-product.jpg",
  "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906": "/img/placeholder-banner.jpg",
  "https://images.unsplash.com/photo-1610348725531-843dff563e2c": "/img/placeholder-product.jpg",
  "https://images.unsplash.com/photo-1573246123716-6b1782bfc499": "/img/placeholder-banner.jpg",
  "https://images.unsplash.com/photo-1628689469838-524a4a973b8e": "/img/placeholder-product.jpg",
  "https://images.unsplash.com/photo-1583608564372-3e5e46a9e05d": "/img/placeholder-product.jpg"
};

// Mapeamento de palavras-chave em produtos para imagens (usado quando a URL falha e não temos categoria)
const keywordImageMap: Record<string, string> = {
  "frango": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
  "carne": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "bovina": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "peixe": "/img/226635-file-salmao-noronha-congelado-500g.jpg",
  "pescado": "/img/226635-file-salmao-noronha-congelado-500g.jpg",
  "bebida": "/img/placeholder-product.jpg",
  "limpeza": "/img/placeholder-product.jpg",
  "higiene": "/img/placeholder-product.jpg"
};

// Mapeamento de categorias para imagens fallback
const categoryImageMap: Record<string, string> = {
  "carnes": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "aves": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
  "peixes": "/img/226635-file-salmao-noronha-congelado-500g.jpg",
  "frutas": "/img/placeholder-product.jpg",
  "legumes": "/img/placeholder-product.jpg",
  "mercearia": "/img/placeholder-product.jpg",
  "bebidas": "/img/placeholder-product.jpg",
  "laticinios": "/img/placeholder-product.jpg",
  "açougue": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "hortifruti": "/img/placeholder-product.jpg",
  "padaria": "/img/placeholder-product.jpg",
  "congelados": "/img/placeholder-product.jpg",
  "frios": "/img/placeholder-product.jpg",
  "utilidades": "/img/placeholder-product.jpg",
  "bazar": "/img/placeholder-product.jpg"
};

/**
 * Verifica se uma URL é de apoioentrega.vteximg.com.br
 * Esta função foi criada para centralizar a lógica de detecção
 */
function isApoioEntregaImageUrl(url: string): boolean {
  return Boolean(url && typeof url === 'string' && url.includes('apoioentrega.vteximg.com.br'));
}

/**
 * Obtém a URL da imagem local correspondente a um termo (nome de produto ou categoria)
 * 
 * @param term Termo a ser usado para buscar uma imagem correspondente
 * @returns URL da imagem local mais adequada para o termo
 */
function getImageForTerm(term: string): string {
  if (!term) return DEFAULT_PLACEHOLDER;
  
  const termLower = term.toLowerCase();
  
  // Verificar palavras-chave no termo
  for (const [keyword, imagePath] of Object.entries(keywordImageMap)) {
    if (termLower.includes(keyword.toLowerCase())) {
      return imagePath;
    }
  }
  
  // Verificar categorias no termo
  for (const [category, imagePath] of Object.entries(categoryImageMap)) {
    if (termLower.includes(category.toLowerCase())) {
      return imagePath;
    }
  }
  
  return DEFAULT_PLACEHOLDER;
}

/**
 * Converte uma URL de imagem externa para uma URL local correspondente
 * 
 * @param url A URL da imagem original
 * @param productName Nome do produto (opcional, usado para fallback inteligente)
 * @param category Categoria do produto (opcional, usado para fallback inteligente)
 * @returns A URL original para apoioentrega.vteximg.com.br ou uma URL local correspondente para outras fontes
 */
export function getLocalImageUrl(url: string, productName?: string, category?: string): string {
  // VERIFICAÇÃO DE SEGURANÇA: verificar se a URL é válida
  if (!url || typeof url !== 'string') {
    return getFallbackImage(productName, category);
  }
  
  // REGRA PRINCIPAL: PRESERVAR URLS DE APOIOENTREGA.VTEXIMG.COM.BR
  if (isApoioEntregaImageUrl(url)) {
    // Tentar usar HTTP se a URL não tem protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    
    // Remover parâmetros desnecessários que podem causar problemas
    const cleanUrl = url.split('?')[0];
    
    console.log(`PRESERVANDO URL ORIGINAL DO APOIOENTREGA: ${cleanUrl}`);
    return cleanUrl;
  }
  
  // Se já é uma URL local, retornar sem modificação
  if (url.startsWith('/')) {
    return url;
  }
  
  // Se é uma URI de dados (data:image), retorná-la como está
  if (url.startsWith('data:image')) {
    return url;
  }
  
  // Se tem extensão de imagem e não é um placeholder externo, tentar usar diretamente
  if (url.match(/\.(jpeg|jpg|gif|png)$/i) && !url.includes('placeholder.com')) {
    return url;
  }
  
  // Fallback: tentar encontrar uma imagem baseada no nome ou categoria
  return getFallbackImage(productName, category);
}

/**
 * Obtém uma imagem de fallback baseada no nome do produto e categoria
 * 
 * @param productName Nome do produto
 * @param category Categoria do produto
 * @returns URL de uma imagem de fallback adequada
 */
function getFallbackImage(productName?: string, category?: string): string {
  // 1. Tentar pelo nome do produto
  if (productName) {
    const productImage = getImageForTerm(productName);
    if (productImage !== DEFAULT_PLACEHOLDER) {
      return productImage;
    }
  }
  
  // 2. Tentar pela categoria
  if (category) {
    const categoryLower = category.toLowerCase();
    
    // Verificar se temos um mapeamento direto para esta categoria
    if (categoryImageMap[categoryLower]) {
      return categoryImageMap[categoryLower];
    }
    
    // Tentar correspondência parcial com a categoria
    const categoryImage = getImageForTerm(category);
    if (categoryImage !== DEFAULT_PLACEHOLDER) {
      return categoryImage;
    }
  }
  
  // 3. Usar imagem padrão como último recurso
  return DEFAULT_PLACEHOLDER;
}

/**
 * Precarrega as imagens mais comuns para evitar problemas de carregamento
 */
export function preloadCommonImages(): void {
  const commonImages = [
    DEFAULT_PLACEHOLDER,
    "/img/placeholder-product.jpg",
    "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
    "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
    "/img/226635-file-salmao-noronha-congelado-500g.jpg"
  ];
  
  commonImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
  console.log('Imagens comuns pré-carregadas');
} 