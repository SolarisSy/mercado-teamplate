import DOMPurify from 'dompurify';

/**
 * Sanitiza e formata texto HTML para renderização segura
 * @param htmlContent Conteúdo HTML a ser sanitizado
 * @returns Objeto com HTML sanitizado para uso com dangerouslySetInnerHTML
 */
export const sanitizeHtml = (htmlContent: string | undefined | null): {__html: string} => {
  if (!htmlContent) {
    return { __html: '' };
  }
  
  // Se o conteúdo contém entidades HTML escapadas (&lt;, &gt;), precisamos decodificá-las primeiro
  let decodedContent = htmlContent;
  
  // Verifica se o conteúdo parece conter tags HTML escapadas
  if (htmlContent.includes('&lt;') && htmlContent.includes('&gt;')) {
    // Criar um elemento temporário para decodificar
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    decodedContent = tempElement.textContent || '';
  }
  
  // Sanitizar o HTML decodificado
  const cleanHtml = DOMPurify.sanitize(decodedContent, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'],
    ALLOWED_ATTR: ['class', 'id', 'style']
  });
  
  return { __html: cleanHtml };
};

/**
 * Converte texto HTML para texto plano
 * @param htmlContent Conteúdo HTML a ser convertido
 * @returns Texto plano com tags removidas
 */
export const htmlToPlainText = (htmlContent: string | undefined | null): string => {
  if (!htmlContent) {
    return '';
  }
  
  // Se o conteúdo contém entidades HTML escapadas (&lt;, &gt;), precisamos decodificá-las primeiro
  let decodedContent = htmlContent;
  
  // Verifica se o conteúdo parece conter tags HTML escapadas
  if (htmlContent.includes('&lt;') && htmlContent.includes('&gt;')) {
    // Criar um elemento temporário para decodificar
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    decodedContent = tempElement.textContent || '';
  }
  
  // Criar um elemento temporário para extrair somente o texto
  const tempElement = document.createElement('div');
  tempElement.innerHTML = decodedContent;
  
  // Obter o texto plano
  return tempElement.textContent || '';
};

/**
 * Decodifica entidades HTML em string bruta (sem depender do DOM)
 * Útil para ser usado no Node.js ou em situações onde o DOM não está disponível
 * @param html String com entidades HTML codificadas
 * @returns String com entidades HTML decodificadas
 */
export const decodeHtmlEntities = (html: string | undefined | null): string => {
  if (!html) {
    return '';
  }
  
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}; 