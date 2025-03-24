/**
 * Script para otimizar o tamanho do banco de dados db.json
 * Este script pode ser executado periodicamente para manter o tamanho do db.json gerenciável
 */

const fs = require('fs');
const path = require('path');

// Configurações
const DB_FILE = path.join(__dirname, 'db.json');
const BACKUP_DIR = path.join(__dirname, 'db_backups');
const PRODUCTS_LIMIT = 5000; // Limite de produtos a manter
const ORDERS_LIMIT = 1000; // Limite de pedidos a manter

// Criar diretório de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Fazer backup do db.json atual
function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFile = path.join(BACKUP_DIR, `db_backup_${timestamp}.json`);
  
  console.log(`Criando backup do banco de dados em: ${backupFile}`);
  fs.copyFileSync(DB_FILE, backupFile);
  
  // Manter apenas os últimos 5 backups
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('db_backup_'))
    .sort((a, b) => b.localeCompare(a));
  
  if (backups.length > 5) {
    const toRemove = backups.slice(5);
    toRemove.forEach(file => {
      fs.unlinkSync(path.join(BACKUP_DIR, file));
      console.log(`Backup antigo removido: ${file}`);
    });
  }
}

// Otimizar o banco de dados
function optimizeDatabase() {
  console.log('Iniciando otimização do banco de dados...');
  
  // Ler o banco de dados
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const originalSize = Buffer.byteLength(JSON.stringify(data));
  console.log(`Tamanho original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Backup antes de qualquer alteração
  backupDatabase();
  
  // Otimização de produtos
  if (data.products && data.products.length > PRODUCTS_LIMIT) {
    console.log(`Produtos: ${data.products.length} (limite: ${PRODUCTS_LIMIT})`);
    
    // Ordenar produtos por data (mantendo os mais recentes)
    data.products.sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || '0';
      const dateB = b.updatedAt || b.createdAt || '0';
      return dateB.localeCompare(dateA);
    });
    
    // Manter apenas os PRODUCTS_LIMIT mais recentes
    data.products = data.products.slice(0, PRODUCTS_LIMIT);
    console.log(`Produtos reduzidos para: ${data.products.length}`);
  }
  
  // Otimização de pedidos
  if (data.orders && data.orders.length > ORDERS_LIMIT) {
    console.log(`Pedidos: ${data.orders.length} (limite: ${ORDERS_LIMIT})`);
    
    // Ordenar pedidos por data (mantendo os mais recentes)
    data.orders.sort((a, b) => {
      const dateA = a.createdAt || '0';
      const dateB = b.createdAt || '0';
      return dateB.localeCompare(dateA);
    });
    
    // Manter apenas os ORDERS_LIMIT mais recentes
    data.orders = data.orders.slice(0, ORDERS_LIMIT);
    console.log(`Pedidos reduzidos para: ${data.orders.length}`);
  }
  
  // Otimizar o formato dos produtos (remover dados desnecessários)
  if (data.products && data.products.length > 0) {
    data.products.forEach(product => {
      // Se há descrição muito longa, limitar o tamanho
      if (product.description && product.description.length > 1000) {
        product.description = product.description.substring(0, 1000) + '...';
      }
      
      // Limitar o número de imagens por produto
      if (product.images && product.images.length > 5) {
        product.images = product.images.slice(0, 5);
      }
      
      // Remover campos temporários ou desnecessários
      delete product.temp;
      delete product.tempData;
    });
  }
  
  // Salvar o banco de dados otimizado
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  
  const newSize = Buffer.byteLength(JSON.stringify(data));
  console.log(`Tamanho após otimização: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Redução: ${(100 - (newSize / originalSize) * 100).toFixed(2)}%`);
}

// Executar otimização
try {
  optimizeDatabase();
  console.log('Otimização concluída com sucesso!');
} catch (error) {
  console.error('Erro durante a otimização:', error);
}

// Exportar função para uso em outros scripts
module.exports = {
  optimizeDatabase
}; 