const jsonServer = require('json-server');
const { ScraperController } = require('./src/scraper/controller.js');
const express = require('express');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Porta que o servidor vai escutar
const PORT = process.env.PORT || 3000;

// Configurar middlewares de parsing antes de qualquer outro middleware
server.use(express.json({ limit: '10mb' })); // Para parsing application/json
server.use(express.urlencoded({ extended: true, limit: '10mb' })); // Para parsing application/x-www-form-urlencoded

// Middleware para logging de requisições
server.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    contentType: req.get('Content-Type'),
    bodySize: req.body ? JSON.stringify(req.body).length : 0,
    query: req.query
  });
  next();
});

// Adicionar middleware CORS para permitir requisições da aplicação frontend
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Inicializar o controller do scraper
const scraperController = new ScraperController();

server.use(middlewares);

// Middleware para tratamento de datas em requisições POST/PUT/PATCH
server.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.body && typeof req.body === 'object') {
      const now = new Date().toISOString();
      if (req.method === 'POST') {
        req.body.createdAt = now;
      }
      req.body.updatedAt = now;
    } else {
      console.warn(`Requisição ${req.method} sem body ou com formato inválido:`, {
        path: req.path,
        contentType: req.get('Content-Type'),
        body: req.body
      });
    }
  }
  next();
});

// Middleware para garantir que a paginação funcione corretamente
server.use((req, res, next) => {
  if (req.query._page && req.query._limit) {
    req.query._page = parseInt(req.query._page);
    req.query._limit = parseInt(req.query._limit);
    console.log(`Requisição paginada: página ${req.query._page}, limite ${req.query._limit}`);
  }
  next();
});

// Registrar rotas do scraper antes do router padrão
scraperController.registerRoutes(server);

// Adicionar rota de teste para verificar se o servidor está funcionando
server.get('/api-test', (req, res) => {
  res.json({ 
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
server.use((err, req, res, next) => {
  console.error('Erro no servidor:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Aplicar o router padrão do JSON Server
server.use(router);

// Lidar com possíveis erros de porta em uso
const startServer = () => {
  try {
    server.listen(PORT, () => {
      console.log(`JSON Server está rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
      console.log(`Scraper disponível em: http://localhost:${PORT}/scraper/products`);
      console.log(`Teste da API em: http://localhost:${PORT}/api-test`);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`A porta ${PORT} já está em uso. Tente finalizar o processo que está usando essa porta ou use outra.`);
      process.exit(1);
    } else {
      console.error('Erro ao iniciar o servidor:', error);
      process.exit(1);
    }
  }
};

// Inicia o servidor
startServer(); 