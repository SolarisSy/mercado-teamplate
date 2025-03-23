import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Porta que o servidor vai escutar
const PORT = process.env.PORT || 3000;

server.use(middlewares);

// Adicione qualquer middleware personalizado aqui
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = new Date().toISOString();
    req.body.updatedAt = new Date().toISOString();
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    req.body.updatedAt = new Date().toISOString();
  }
  next();
});

// Middleware para garantir que a paginação funcione corretamente
server.use((req, res, next) => {
  // Se houver parâmetros de paginação, garantir que funcionem corretamente
  if (req.query._page && req.query._limit) {
    // Certificar que os valores são números
    req.query._page = parseInt(req.query._page);
    req.query._limit = parseInt(req.query._limit);
    
    console.log(`Requisição paginada: página ${req.query._page}, limite ${req.query._limit}`);
  }
  next();
});

// Suporte para processamento de parâmetros de consulta específicos
server.use((req, res, next) => {
  // Suporte para parâmetros como _expand, _embed, etc.
  next();
});

server.use(router);

// Lidar com possíveis erros de porta em uso
const startServer = () => {
  try {
    server.listen(PORT, () => {
      console.log(`JSON Server está rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
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