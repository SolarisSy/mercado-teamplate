/**
 * Serviço responsável por gerenciar o cache de requisições
 * Evita requisições repetidas ao site alvo, reduzindo chances de bloqueio
 */
export class CacheService {
  private cache: Map<string, {
    data: any;
    timestamp: number;
  }> = new Map();

  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hora em milissegundos

  /**
   * Obtém dados do cache se disponíveis e válidos
   * @param key Chave do cache
   * @param ttl Tempo de vida do cache em milissegundos
   * @returns Dados do cache ou null se não encontrado/expirado
   */
  get<T>(key: string, ttl = this.DEFAULT_TTL): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    const now = Date.now();
    if (now - item.timestamp > ttl) {
      // Cache expirou
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * Armazena dados no cache
   * @param key Chave do cache
   * @param data Dados a serem armazenados
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Remove item do cache
   * @param key Chave do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Verifica se uma chave existe no cache e não está expirada
   * @param key Chave do cache
   * @param ttl Tempo de vida do cache em milissegundos
   * @returns true se a chave existir e não estiver expirada
   */
  has(key: string, ttl = this.DEFAULT_TTL): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    const now = Date.now();
    if (now - item.timestamp > ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
} 