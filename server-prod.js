const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const ScraperController = require('./src/scraper/controller').default || require('./src/scraper/controller');

// Configuração para minimizar uso de memória
const MEMORY_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutos
const MAX_MEMORY_USAGE_MB = 300;

class ProductionServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.dbFile = 'db.json';
    this.routesFile = 'routes.json';
    this.db = null;
    this.scraperController = null;
    
    // Configurar log de erros
    this.errorLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'error.log'), { flags: 'a' });
    
    this.setupDatabase();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupMemoryMonitoring();
  }
  
  setupDatabase() {
    try {
      // Verificar se o diretório de logs existe, caso contrário, criá-lo
      if (!fs.existsSync(path.join(__dirname, 'logs'))) {
        fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
      }
      
      // Verificar se o arquivo db.json existe
      if (!fs.existsSync(this.dbFile)) {
        console.log('Arquivo db.json não encontrado. Criando uma versão básica...');
        fs.writeFileSync(this.dbFile, JSON.stringify({
          products: [],
          categories: [],
          carousel: [],
          orders: [],
          users: []
        }, null, 2));
      }
      
      // Inicializar o banco de dados
      const adapter = new JSONFile(this.dbFile);
      this.db = new Low(adapter);
      
      // Carregar os dados iniciais
      this.db.read()
        .then(() => {
          console.log('Banco de dados carregado com sucesso.');
          // Inicializar o controller após carregar o banco
          this.initializeController();
        })
        .catch(err => {
          console.error('Erro ao carregar o banco de dados:', err);
          this.logError('DATABASE_LOAD_ERROR', err);
        });
    } catch (error) {
      console.error('Erro ao configurar o banco de dados:', error);
      this.logError('DATABASE_SETUP_ERROR', error);
    }
  }
  
  initializeController() {
    try {
      this.scraperController = new ScraperController();
      console.log('ScraperController inicializado com sucesso.');
    } catch (error) {
      console.error('Erro ao inicializar o ScraperController:', error);
      this.logError('CONTROLLER_INIT_ERROR', error);
    }
  }
  
  setupMiddleware() {
    // Middleware para logging
    this.app.use(morgan('common'));
    
    // Middleware para CORS
    this.app.use(cors());
    
    // Middleware para parsing de JSON
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Middleware para adicionar timestamp
    this.app.use((req, res, next) => {
      if (req.method === 'POST') {
        req.body.createdAt = new Date().toISOString();
        req.body.updatedAt = new Date().toISOString();
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        req.body.updatedAt = new Date().toISOString();
      }
      next();
    });
    
    // Middleware para tratamento de erros
    this.app.use((err, req, res, next) => {
      console.error('Erro na requisição:', err);
      this.logError('REQUEST_ERROR', err, req.path);
      res.status(500).json({ error: 'Erro interno do servidor' });
    });
  }
  
  setupRoutes() {
    // Rota de verificação de saúde
    this.app.get('/api-test', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        memoryUsage: this.getMemoryUsage()
      });
    });
    
    // Rotas básicas CRUD para cada coleção no db.json
    const collections = ['products', 'categories', 'carousel', 'orders', 'users'];
    
    collections.forEach(collection => {
      // Listar todos
      this.app.get(`/${collection}`, async (req, res) => {
        try {
          await this.db.read();
          res.json(this.db.data[collection] || []);
        } catch (error) {
          this.logError(`GET_${collection.toUpperCase()}_ERROR`, error);
          res.status(500).json({ error: `Erro ao buscar ${collection}` });
        }
      });
      
      // Buscar por ID
      this.app.get(`/${collection}/:id`, async (req, res) => {
        try {
          await this.db.read();
          const item = (this.db.data[collection] || []).find(item => item.id === req.params.id);
          if (item) {
            res.json(item);
          } else {
            res.status(404).json({ error: `Item não encontrado em ${collection}` });
          }
        } catch (error) {
          this.logError(`GET_${collection.toUpperCase()}_ID_ERROR`, error);
          res.status(500).json({ error: `Erro ao buscar item em ${collection}` });
        }
      });
      
      // Criar
      this.app.post(`/${collection}`, async (req, res) => {
        try {
          await this.db.read();
          if (!this.db.data[collection]) {
            this.db.data[collection] = [];
          }
          
          const newItem = {
            ...req.body,
            id: req.body.id || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          };
          
          this.db.data[collection].push(newItem);
          await this.db.write();
          
          res.status(201).json(newItem);
        } catch (error) {
          this.logError(`CREATE_${collection.toUpperCase()}_ERROR`, error);
          res.status(500).json({ error: `Erro ao criar item em ${collection}` });
        }
      });
      
      // Atualizar
      this.app.put(`/${collection}/:id`, async (req, res) => {
        try {
          await this.db.read();
          if (!this.db.data[collection]) {
            return res.status(404).json({ error: `Coleção ${collection} não encontrada` });
          }
          
          const index = this.db.data[collection].findIndex(item => item.id === req.params.id);
          if (index === -1) {
            return res.status(404).json({ error: `Item não encontrado em ${collection}` });
          }
          
          this.db.data[collection][index] = {
            ...req.body,
            id: req.params.id
          };
          
          await this.db.write();
          
          res.json(this.db.data[collection][index]);
        } catch (error) {
          this.logError(`UPDATE_${collection.toUpperCase()}_ERROR`, error);
          res.status(500).json({ error: `Erro ao atualizar item em ${collection}` });
        }
      });
      
      // Deletar
      this.app.delete(`/${collection}/:id`, async (req, res) => {
        try {
          await this.db.read();
          if (!this.db.data[collection]) {
            return res.status(404).json({ error: `Coleção ${collection} não encontrada` });
          }
          
          const index = this.db.data[collection].findIndex(item => item.id === req.params.id);
          if (index === -1) {
            return res.status(404).json({ error: `Item não encontrado em ${collection}` });
          }
          
          const deletedItem = this.db.data[collection][index];
          this.db.data[collection].splice(index, 1);
          
          await this.db.write();
          
          res.json(deletedItem);
        } catch (error) {
          this.logError(`DELETE_${collection.toUpperCase()}_ERROR`, error);
          res.status(500).json({ error: `Erro ao deletar item em ${collection}` });
        }
      });
    });
    
    // Registrar rotas do ScraperController se disponível
    this.app.use((req, res, next) => {
      if (this.db && this.scraperController) {
        // Garante que o controller tenha acesso ao db atualizado
        this.scraperController.registerRoutes(this.app, this.db);
      }
      next();
    });
  }
  
  setupMemoryMonitoring() {
    // Monitorar uso de memória periodicamente
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      console.log(`[${new Date().toISOString()}] Uso de memória: ${memoryUsage.toFixed(2)}MB`);
      
      // Se o uso de memória exceder o limite, reiniciar o servidor
      if (memoryUsage > MAX_MEMORY_USAGE_MB) {
        console.error(`Uso de memória excedeu o limite de ${MAX_MEMORY_USAGE_MB}MB (${memoryUsage.toFixed(2)}MB)`);
        this.logError('MEMORY_LIMIT_EXCEEDED', { memoryUsage });
        
        // Forçar liberação de memória coletando lixo
        if (global.gc) {
          console.log('Forçando coleta de lixo...');
          global.gc();
        }
        
        // Verificar se o uso de memória diminuiu após a coleta
        const newMemoryUsage = this.getMemoryUsage();
        if (newMemoryUsage > MAX_MEMORY_USAGE_MB) {
          console.error(`Uso de memória continua alto após coleta de lixo: ${newMemoryUsage.toFixed(2)}MB`);
          this.logError('MEMORY_LIMIT_PERSISTS', { memoryUsage: newMemoryUsage });
          
          // Notificar que o servidor será reiniciado
          console.log('Preparando para reiniciar o servidor...');
          
          // Salvar quaisquer dados pendentes
          this.db.write()
            .then(() => {
              console.log('Dados salvos. Saindo para permitir reinício pelo sistema de monitoramento...');
              process.exit(1);
            })
            .catch(err => {
              console.error('Erro ao salvar dados antes de reiniciar:', err);
              process.exit(1);
            });
        } else {
          console.log(`Uso de memória reduzido para ${newMemoryUsage.toFixed(2)}MB após coleta de lixo.`);
        }
      }
    }, MEMORY_CHECK_INTERVAL);
  }
  
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return memoryUsage.rss / (1024 * 1024); // Converter para MB
  }
  
  logError(type, error, context = '') {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.stack || error.message : JSON.stringify(error);
    const logEntry = `[${timestamp}] [${type}] ${context ? `[${context}] ` : ''}${errorMessage}\n`;
    
    this.errorLogStream.write(logEntry);
    console.error(logEntry);
  }
  
  start() {
    this.app.listen(this.port, () => {
      console.log(`Servidor rodando na porta ${this.port}`);
    });
  }
}

// Iniciar o servidor
const server = new ProductionServer();
server.start();

// Capturar exceções não tratadas
process.on('uncaughtException', (error) => {
  console.error('Exceção não tratada:', error);
  server.logError('UNCAUGHT_EXCEPTION', error);
  // Não encerrar o processo para manter o servidor funcionando
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada:', reason);
  server.logError('UNHANDLED_REJECTION', reason);
  // Não encerrar o processo para manter o servidor funcionando
}); 