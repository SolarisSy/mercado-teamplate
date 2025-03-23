/**
 * Utilitários para manipulação de imagens
 */

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
  "https://images.unsplash.com/photo-1583608564372-3e5e46a9e05d": "/img/placeholder-product.jpg",
  
  // URLs da apoioentrega no formato que está no db.json
  "https://www.apoioentrega.com/Hamburguer-Imperio-Bovino-56g/p": "/img/salsicha-hotdog-perdigao-1kg.jpg",
  "https://www.apoioentrega.com/Coxinha-Asa-Frango-Rivelli-800g-iqf-Cong/p": "/img/coracao-de-frango-bandeja-seara-1kg.jpg",
  "https://www.apoioentrega.com/Salsicha-Rezende-Hotdog-1Kg/p": "/img/salsicha-hotdog-perdigao-1kg.jpg",
  "https://www.apoioentrega.com/Empanado-de-Frango-Tradicional-Perdigao-Mini-Chicken-Pacote-1kg/p": "/img/3469-kibe-congelado-feito-com-carne-bovina-sadia-c.jpg",
  "https://www.apoioentrega.com/File-De-Frango-Congelado-In-Natura-1Kg/p": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
  "https://www.apoioentrega.com/Moela-de-Frango-Ave-Nova-800g/p": "/img/coracao-de-frango-bandeja-seara-1kg.jpg",
  "https://www.apoioentrega.com/Recorte-File-Mignon-1Kg/p": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "https://www.apoioentrega.com/Carne-Moida-Tudbom-Congelada-500g/p": "/img/219704-copa-lombo-moido-apreco-resfriado-450g.jpg",
  "https://www.apoioentrega.com/File-de-Peito-de-Frango-Rivelli-Congelado-bandeja-1-kg/p": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
  "https://www.apoioentrega.com/Peixe-Piramutaba-Posta-Congelado-1Kg/p": "/img/226635-file-salmao-noronha-congelado-500g.jpg",
  "https://www.apoioentrega.com/Linguica-tipo-calabresa-Seara-400g-2pc/p": "/img/184447-linguica-toscana-com-alho-e-ervas-perdigao-.jpg",
  "https://www.apoioentrega.com/Salsicha-Congelada-Hotdog-Sadia-1Kg/p": "/img/salsicha-hotdog-perdigao-1kg.jpg",
  "https://www.apoioentrega.com/Filezinho-De-Frango-Sassimi-1k/p": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
  "https://www.apoioentrega.com/Figado-De-Frango-Bom-Todo-800g/p": "/img/coracao-de-frango-bandeja-seara-1kg.jpg",
  "https://www.apoioentrega.com/File-de-Peito-de-Frango-Nat-Congelado-Kg/p": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg"
};

// Mapeamento de fallback por categoria para produtos não mapeados
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
  "congelados": "/img/3469-kibe-congelado-feito-com-carne-bovina-sadia-c.jpg",
  "frios": "/img/177634-salame-11g-de-proteina-original-sadia-salam.jpg"
};

// Mapeamento de palavras-chave em produtos para imagens (usado quando a URL falha e não temos categoria)
const keywordImageMap: Record<string, string> = {
  "frango": "/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg",
  "carne": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "bovina": "/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg",
  "peixe": "/img/226635-file-salmao-noronha-congelado-500g.jpg",
  "pescado": "/img/226635-file-salmao-noronha-congelado-500g.jpg",
  "banana": "/img/placeholder-product.jpg",
  "maçã": "/img/placeholder-product.jpg",
  "leite": "/img/placeholder-product.jpg",
  "queijo": "/img/placeholder-product.jpg",
  "arroz": "/img/placeholder-product.jpg",
  "feijão": "/img/placeholder-product.jpg",
  "picanha": "/img/114739-picanha-tradicional-peca-1kg.jpg",
  "linguiça": "/img/184447-linguica-toscana-com-alho-e-ervas-perdigao-.jpg",
  "salsicha": "/img/salsicha-hotdog-perdigao-1kg.jpg"
};

// Imagem de fallback para quando não encontrar nenhuma correspondência
const DEFAULT_IMAGE = "/img/placeholder-product.jpg";

/**
 * Obtém a URL da imagem local correspondente a um termo (nome de produto ou categoria)
 * 
 * @param term Termo a ser usado para buscar uma imagem correspondente
 * @returns URL da imagem local mais adequada para o termo
 */
function getImageForTerm(term: string): string {
  if (!term) return DEFAULT_IMAGE;
  
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
  
  return DEFAULT_IMAGE;
}

/**
 * Converte uma URL de imagem externa para uma URL local correspondente
 * 
 * @param url A URL da imagem original (possivelmente externa)
 * @param productName Nome do produto (opcional, usado para fallback inteligente)
 * @param category Categoria do produto (opcional, usado para fallback inteligente)
 * @returns A URL local correspondente ou a URL original se não houver mapeamento
 */
export function getLocalImageUrl(url: string, productName?: string, category?: string): string {
  // Se a URL já é local (começa com /), retorná-la como está
  if (url.startsWith('/')) {
    return url;
  }
  
  // Se é uma URI de dados (data:image), retorná-la como está
  if (url.startsWith('data:image')) {
    return url;
  }
  
  // Remover parâmetros de consulta das URLs do Unsplash para comparação
  const baseUrl = url.split('?')[0];
  
  // Verificar se temos um mapeamento para esta URL base
  const localUrl = imageMap[baseUrl] || imageMap[url];
  
  if (localUrl) {
    return localUrl;
  }
  
  // Tentar encontrar correspondência parcial para URLs similares
  for (const [externalUrl, localPath] of Object.entries(imageMap)) {
    // Comparar sem os parâmetros de consulta
    const externalBaseUrl = externalUrl.split('?')[0];
    if (baseUrl.includes(externalBaseUrl) || externalBaseUrl.includes(baseUrl)) {
      return localPath;
    }
  }
  
  // Verificar URL por categoria de produto fornecida
  if (category && categoryImageMap[category.toLowerCase()]) {
    return categoryImageMap[category.toLowerCase()];
  }
  
  // Usar informações de produto/categoria para tentar encontrar uma imagem adequada
  if (productName) {
    const termImageUrl = getImageForTerm(productName);
    if (termImageUrl !== DEFAULT_IMAGE) {
      return termImageUrl;
    }
  }
  
  if (category) {
    const termImageUrl = getImageForTerm(category);
    if (termImageUrl !== DEFAULT_IMAGE) {
      return termImageUrl;
    }
  }
  
  // Se nenhuma correspondência for encontrada, registrar um aviso e retornar a URL original
  console.warn(`Imagem não mapeada: ${url}`);
  
  // Verificar se é uma URL do Unsplash ou apoioentrega que não temos mapeada
  if (url.startsWith('https://images.unsplash.com/') || 
      url.startsWith('https://www.apoioentrega.com/')) {
    console.warn(`Usando imagem de fallback para ${url}`);
    return DEFAULT_IMAGE; // Usar imagem de fallback para estas fontes conhecidas que estão falhando
  }
  
  // Tentar acessar diretamente a URL (implementação alternativa)
  // Como estamos em um ambiente de navegador, não podemos verificar facilmente se a URL está acessível
  // sem fazer uma requisição real, o que poderia causar problemas de desempenho
  
  return url; // Retornar a URL original se não for de uma fonte conhecida que está falhando
}

/**
 * Precarrega as imagens mais comuns para evitar problemas de carregamento
 * quando elas forem necessárias
 */
export function preloadCommonImages(): void {
  // Array com caminhos das imagens mais comumente usadas
  const commonImages = [
    '/img/placeholder-product.jpg',
    '/img/file-mignon-bovino-sem-cordao-peca-1kg.jpg',
    '/img/-file-de-peito-de-frango-tropeira-desfiado-tempera.jpg',
    '/img/226635-file-salmao-noronha-congelado-500g.jpg',
    '/img/coracao-de-frango-bandeja-seara-1kg.jpg',
    '/img/salsicha-hotdog-perdigao-1kg.jpg',
    '/img/114739-picanha-tradicional-peca-1kg.jpg',
  ];
  
  // Precarregar cada imagem
  commonImages.forEach(src => {
    const img = new Image();
    img.src = src;
    // Não precisamos adicionar ao DOM, apenas criar o objeto Image
    // e definir a src já inicia o download em segundo plano
  });
  
  console.log('Imagens comuns pré-carregadas');
} 