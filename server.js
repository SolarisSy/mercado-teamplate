// Middleware para o JSON Server
module.exports = (req, res, next) => {
  // Configuração de CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Logging das requisições
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Lidar com requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Middleware para timestamp automático
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const timestamp = new Date().toISOString();
    
    if (req.method === 'POST') {
      req.body.createdAt = timestamp;
    }
    
    req.body.updatedAt = timestamp;
  }
  
  next();
} 